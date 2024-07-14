import { Module } from '@nestjs/common';
import { OptionalValidationPipe } from './pipe/optional-file-validation.pipe';

@Module({
  providers: [OptionalValidationPipe],
  exports: [OptionalValidationPipe],
})
export class SharedModule {}
