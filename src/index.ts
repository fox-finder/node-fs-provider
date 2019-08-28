/**
 * @file NodeFsProvider
 * @module NodeFsProvider
 * @author Surmon <https://github.com/surmon-china>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { FileType, IFile, IFileStat, FileProvider, FileActionResult, FileActionStatus, utils } from '@fox-finder/base';

export class NodeFsProvider implements FileProvider {

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

  private getFileStat(fullPath: string): IFile {
    const fileStat = fs.statSync(fullPath);
    const fileStatMode = utils.transformOctalModeToStat(String(fileStat.mode));
    const isDirectory = fileStat.isDirectory();
    return {
      type: isDirectory
        ? FileType.Directory
        : FileType.File,
      name: path.basename(fullPath),
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
  }

  makeDir(targetPath: string, octalMode?: number): Promise<FileActionResult> {
    return fse.ensureDir(targetPath, octalMode).then(() => ({
      status: FileActionStatus.Success,
    }));
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
          return this.getFileStat(path.join(targetPath, fileName));
        }));
      });
    });
  }

  writeFile(targetPath: string, data: Buffer, octalMode?: number): Promise<FileActionResult> {
    const options = octalMode ? { mode: octalMode } : null;
    return fse.writeFile(targetPath, data, options).then(() => ({
      status: FileActionStatus.Success,
    }));
  }

  readFile(targetPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(targetPath, (error, data) => {
        error ? reject(error) : resolve(data);
      });
    });
  }

  stat(targetPath: string): Promise<IFileStat> {
    return new Promise((resolve, reject) => {
      try {
        const stat: IFileStat = this.getFileStat(targetPath);
        if (stat.type === FileType.Directory) {
          stat.file_count = 0;
          stat.directory_count = 0;
          fs.readdirSync(targetPath).forEach(item => {
            if (fs.statSync(path.join(targetPath, item)).isDirectory()) {
              stat.directory_count ++;
            } else {
              stat.file_count++;
            }
          });
        }
        resolve(stat);
      } catch (error) {
        reject(error);
      }
    });
  }

  copy(srcPath: string, destPath: string): Promise<FileActionResult> {
    return fse.copy(srcPath, destPath).then(() => ({
      status: FileActionStatus.Success,
    }));
  }

  move(srcPath: string, destPath: string): Promise<FileActionResult> {
    return fse.move(srcPath, destPath).then(() => ({
      status: FileActionStatus.Success,
    }));
  }

  rename(srcPath: string, destPath: string): Promise<FileActionResult> {
    return new Promise((resolve, reject) => {
      fs.rename(srcPath, destPath, error => {
        error
          ? reject(error)
          : resolve({ status: FileActionStatus.Success });
      });
    });
  }

  remove(targetPath: string): Promise<FileActionResult> {
    return fse.remove(targetPath).then(() => ({
      status: FileActionStatus.Success,
    }));
  }

  chmod(targetPath: string, mode: number): Promise<FileActionResult> {
    return new Promise((resolve, reject) => {
      fs.chmod(targetPath, mode, error => {
        error
          ? reject(error)
          : resolve({ status: FileActionStatus.Success });
      });
    });
  }
}
