
import { NodeFsProvider } from '../src/index';

const nodeFsProvider = new NodeFsProvider();

nodeFsProvider.listFile('/').then(data => {
  console.log('data', data);
});