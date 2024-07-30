import init from '@cizn/adapter/package/api/init'

export type Api = {
  init: () => void
}

const api = (App: Cizn.Application): {init: () => Cizn.Adapter.Package.Api } => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default api
