import init from '@cizn/adapter/platform/api/init.ts'
import { Result } from '@lib/composition/result.ts'

export type Api = {
    init: () => Promise<Result<never, Cizn.Application>>
  }

const api = (App: Cizn.Application): Cizn.Adapter => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default api
