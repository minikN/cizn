import write from '@cizn/adapter/file/api/public/write'
import { CurriedFunction } from '@lib/util'

export type Props = {
    source: string,
    target: string,
    content: string,
  }
  
  export type Api = {
    write: CurriedFunction<[], (source: Props['source'], target: Props['target'], content: Props['content']) => void>
  }
  
  const publicApi = (App: Cizn.Application): Cizn.Adapter.File.PublicApi => Object.create({}, {
    write: {
      value: write(App),
      enumerable: true,
    },
  })
  
  export default publicApi
  