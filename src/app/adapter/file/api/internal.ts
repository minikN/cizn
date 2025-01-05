import write from '@cizn/adapter/file/api/internal/write.ts'
import include from '@cizn/adapter/file/api/internal/include.ts'
import { CurriedFunction } from '@lib/util/index.ts'

export type Props = {
    source: string,
    target: string,
    content: string | object,
    name: string,
  }

export type Api = {
    write: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
    include: CurriedFunction<[], (source: Props['source'], target: Props['name'], content: Props['target']) => void>
  }

const internalApi = (App: Cizn.Application): Cizn.Adapter.File.InternalApi => Object.create({}, {
  write: {
    value: write(App),
    enumerable: true,
  },
  include: {
    value: include(App),
    enumerable: true,
  },
})

export default internalApi
