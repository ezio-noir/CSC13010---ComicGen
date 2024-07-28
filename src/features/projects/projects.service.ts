import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { ResourceNotFoundError } from 'src/common/errors/resource-not-found.error';
import { ResourcesService } from 'src/shared/resources/resources.service';
import { Project } from 'src/shared/schemas/project.schema';
import { ResourceAccess } from 'src/shared/schemas/resource.schema';
import { User } from 'src/shared/schemas/user.schema';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel('User') private userModel: mongoose.Model<User>,
    @InjectModel('Project') private projectModel: mongoose.Model<Project>,
    private resourcesService: ResourcesService,
  ) {}

  async createProject(userId: Types.ObjectId, file: Express.Multer.File) {
    const session = await this.userModel.db.startSession();
    try {
      const newProject = await session.withTransaction(async () => {
        const user = await this.userModel
          .findOne({ _id: userId })
          .session(session);
        if (!user) throw new ResourceNotFoundError('User not found.');

        const newProjectResource = await this.resourcesService.createResource(
          'project',
          userId,
          ResourceAccess.OWNER,
          file,
        );

        const newProject = new this.projectModel({
          file: newProjectResource._id,
        });
        await newProject.save({ session });

        await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { projects: newProject._id } },
          { session },
        );

        return newProject;
      });

      this.logger.log(`New project created: ${newProject.id}.`);
      return newProject;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateProject(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    const session = await this.userModel.db.startSession();
    try {
      const updatedProject = await session.withTransaction(async () => {
        const user = await this.userModel
          .findOne({ _id: userId })
          .session(session);
        if (!user) throw new ResourceNotFoundError('User not found.');

        const project = await this.projectModel
          .findOne({ _id: projectId })
          .session(session);
        if (!project) throw new ResourceNotFoundError('Project not found.');

        const userProjects = user.projects.map((item) => item._id);
        if (!userProjects.includes(project._id))
          throw new Error('Project is not owned by user');

        await this.resourcesService.overwriteResource(
          userId,
          project.file.prototype._id,
          file,
        );

        return await project.save({ session });
      });

      this.logger.log(`Project saved: ${updatedProject.id}.`);
      return updatedProject;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
