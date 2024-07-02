import { ArgumentMetadata, ParseFilePipe, PipeTransform } from "@nestjs/common";


export class OptionalValidationPipe implements PipeTransform {
  constructor(private readonly filePipe: ParseFilePipe) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;
    return await this.filePipe.transform(value);
  }
}