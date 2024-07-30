import init from '@cizn/adapter/platform/api/init'

export type Api = {
    init: () => void
  }

const api = (App: Cizn.Application): Cizn.Adapter => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default api
