
import { NodeFsProvider } from '../src/index';

const nodeFsProvider = new NodeFsProvider();

nodeFsProvider.listFile('/Users/surmon/Projects/Javascript/vue2any').then(data => {
  console.log('data', data);
});