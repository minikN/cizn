import write from '@cizn/adapter/file/api/internal/write'
import include from '@cizn/adapter/file/api/internal/include'
import { CurriedFunction } from '@lib/util'

export type Props = {
    source: string,
    target: string,
    content: string,
    name: string,
  }
  
  export type Api = {
    // write: (source: Props['source'], target: Props['target'], content: Props['content']) => void
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
  