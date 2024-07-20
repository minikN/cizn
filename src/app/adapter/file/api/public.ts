import write from '@cizn/adapter/file/api/public/write'
import { CurriedFunction } from '@lib/util'

export type Props = {
    source: string,
    target: string,
    content: string,
  }

export type fileType = 'plain' | 'ini' | 'json' | 'yaml' | 'toml' | 'xml'

export type Api = {
    write: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    writeIni: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    writeJson: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    writeYaml: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    writeToml: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    writeXml: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
  }

const publicApi = (App: Cizn.Application): Cizn.Adapter.File.PublicApi => Object.create({}, {
  write: {
    value: write(App, 'plain'),
    enumerable: true,
  },
  writeIni: {
    value: write(App, 'ini'),
    enumerable: true,
  },
  writeJson: {
    value: write(App, 'json'),
    enumerable: true,
  },
  writeYaml: {
    value: write(App, 'yaml'),
    enumerable: true,
  },
  writeToml: {
    value: write(App, 'toml'),
    enumerable: true,
  },
  writeXml: {
    value: write(App, 'xml'),
    enumerable: true,
  },
})

export default publicApi
