
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { FileType, IFile, FileProvider, utils } from '@fox-finder/base';

// implements FileProvider
export class NodeFsProvider {

  private checkAccess(filePath: string, mode: number): boolean {
    try {
      fs.accessSync(filePath, mode);
      return true;
    } catch (error) {
      return false;
    }
  }

  private isReadable(filePath: string): boolean {
    return this.checkAccess(filePath, fs.constants.R_OK);
  }

  private isWriteable(filePath: string): boolean {
    return this.checkAccess(filePath, fs.constants.W_OK);
  }

  listFile(targetPath: string, keyword?: string): Promise<IFile[]> {
    return new Promise((resolve, reject) => {
      return fs.readdir(targetPath, (error, filesNames) => {
        if (error) {
          return reject(error);
        }

        keyword = keyword && keyword.trim();
        filesNames = keyword
          ? filesNames.filter(name => name.includes(keyword))
          : filesNames;
        resolve(filesNames.map(fileName => {
          const fullPath = path.join(targetPath, fileName);
          const fileStat = fs.statSync(fullPath);
          const fileStatMode = utils.transformOctalModeToStat(String(fileStat.mode));
          const isDirectory = fileStat.isDirectory();
          return {
            type: isDirectory
              ? FileType.Directory
              : FileType.File,
            name: fileName,
            path: fullPath,
            size: fileStat.size,
            ext: isDirectory
              ? null
              : path.extname(fullPath).substr(1),
            modify_at: fileStat.mtimeMs,
            access_at: fileStat.atimeMs,
            create_at: fileStat.birthtimeMs,
            readable: this.isReadable(fullPath),
            writeable: this.isWriteable(fullPath),
            unix_mode_stat: fileStatMode,
            unix_mode_octal: utils.transformStatModeToOctal(fileStatMode),
            uid: String(fileStat.uid),
            gid: String(fileStat.gid),
          };
        }));
      });
    });
  }

  makeDir() {

  }
}
