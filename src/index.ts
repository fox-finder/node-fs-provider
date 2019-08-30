/**
 * @file NodeFsProvider
 * @module NodeFsProvider
 * @author Surmon <https://github.com/surmon-china>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { FileType, IFile, IFileStat, FoxFileProvider, transformOctalModeToStat, transformStatModeToOctal } from '@fox-finder/base';

export class NodeFsProvider implements FoxFileProvider {

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
    const fileStatMode = transformOctalModeToStat(String(fileStat.mode));
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
      unix_mode_octal: transformStatModeToOctal(fileStatMode),
      uid: String(fileStat.uid),
      gid: String(fileStat.gid),
    };
  }

  ensureAvailability(): Promise<this> {
    return Promise.resolve(this);
  }

  makeDir(targetPath: string, octalMode?: number): Promise<void> {
    return fse.ensureDir(targetPath, octalMode);
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

  writeFile(targetPath: string, data: Buffer, octalMode?: number): Promise<void> {
    const options = octalMode ? { mode: octalMode } : null;
    return fse.writeFile(targetPath, data, options);
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

  copy(srcPath: string, destPath: string): Promise<void> {
    return fse.copy(srcPath, destPath);
  }

  move(srcPath: string, destPath: string): Promise<void> {
    return fse.move(srcPath, destPath);
  }

  rename(srcPath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.rename(srcPath, destPath, error => {
        error ? reject(error) : resolve();
      });
    });
  }

  remove(targetPath: string) {
    return fse.remove(targetPath);
  }

  chmod(targetPath: string, mode: number): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.chmod(targetPath, mode, error => {
        error ? reject(error) : resolve();
      });
    });
  }
}
