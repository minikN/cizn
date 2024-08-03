import init from '@cizn/adapter/package/api/init'

export type Api = {
  init: () => Promise<void>
  isInstalled: (application: string) => Promise<boolean>
  install: (application: string) => Promise<void>
}

const api = (App: Cizn.Application): {init: () => Cizn.Adapter.Package.Api } => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default api
