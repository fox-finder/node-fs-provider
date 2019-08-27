
# FoxBase

Base modules for [@fox-finder](https://github.com/fox-finder)

## Usage

```bash
yarn add @fox-finder/base
```

```typescript
import { IFile, FileProvider, utils } from '@fox-finder/base'

export class MyFileProvider implements FileProvider {

  listFile(path: string, keyword?: string): Promise<IFile[]> {

  };
}
```

## Acknowledgements

- [unix-permissions](https://github.com/ehmicky/unix-permissions)
