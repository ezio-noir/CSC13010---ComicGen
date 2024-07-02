import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { PasswordCredential } from 'src/schemas/password-credential.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: mongoose.Model<User>,
        @InjectModel(PasswordCredential.name) private passwordCredentialModel: mongoose.Model<PasswordCredential>,
    ) {}

    getUserByUsername(username: string) {
        return this.userModel.findOne({ username });
    }

    async createUser(createUserDto: CreateUserDto) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
        const newPasswordCredential = new this.passwordCredentialModel({
            username: createUserDto.username,
            hashedPassword: hashedPassword,
        });
        const passwordCredential = await newPasswordCredential.save();

        const newUser = new this.userModel({
            username: createUserDto.username,
            displayName: createUserDto.displayName,
            credential: passwordCredential._id,
            avatar: createUserDto.avatar,
        });

        return await newUser.save();
    }
}
