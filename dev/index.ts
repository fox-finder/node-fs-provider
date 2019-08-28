
import { NodeFsProvider } from '../src/index';

const nodeFsProvider = new NodeFsProvider();

nodeFsProvider.listFile('/Users/surmon/Projects/Javascript/vue2any').then(data => {
  console.log('\n - list data \n', data);
});

nodeFsProvider.stat('/Users/surmon/Projects/Javascript/vue2any').then(data => {
  console.log('\n - stat data \n', data);
});

nodeFsProvider.readFile('/Users/surmon/Projects/Javascript/vue2any')
  .then(data => {
    console.log('\n - readFile data \n', data);
  })
  .catch(error => {
    console.warn('\n - readFile error \n', error);
  });

nodeFsProvider.readFile('/Users/surmon/Projects/Javascript/vue2any/package.json')
  .then(data => {
    console.log('\n - readFile data \n', data.toString());
  })
  .catch(error => {
    console.warn('\n - readFile error \n', error);
  });