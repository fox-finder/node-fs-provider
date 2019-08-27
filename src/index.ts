
import * as fs from 'fs';
import fse from 'fs-extra';
import { IFile, FileProvider, utils } from '@fox-finder/base';

// implements FileProvider
export class NodeFsProvider {

  listFile(path: string, keyword?: string) {
    return new Promise((resolve, reject) => {
      return fs.readdir(path, (error, fileList) => {
        resolve(fileList);
        // resolve(fileList.map(file => ({
        //   // ...
        // })));
      });
    });
  }
}
