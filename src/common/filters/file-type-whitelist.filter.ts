import { InvalidFileTypeError } from '../errors/invalid-file-type.error';

export const FileTypeWhiteListFilter = (fileTypes: string[]) => {
  return (req, file, callback) => {
    if (!file) return callback(null, true);
    const mimeType = fileTypes.some((type) => type === file.mimetype);
    if (mimeType) {
      return callback(null, true);
    } else {
      callback(
        new InvalidFileTypeError(
          `Invalid file type (allowed: ${fileTypes.join(',')})`,
        ),
        false,
      );
    }
  };
};
