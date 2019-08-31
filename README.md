
# node-fs-provider

node-fs provider for [@fox-finder](https://github.com/fox-finder)

## Usage

```bash
yarn add @fox-finder/node-fs-provider
```

```typescript
import { IFile, FileProvider } from '@fox-finder/base'
import { NodeFsProvider } from '@fox-finder/node-fs-provider';

const nodeFsProvider = new NodeFsProvider();

nodeFsProvider.listFile('/Users/mypath/somefiles').then(data => {
  console.log('\n - list data \n', data);
});
```

## Acknowledgements

- [fs-extra](https://github.com/jprichardson/node-fs-extra)
- [get-folder-size](https://github.com/alessioalex/get-folder-size)
