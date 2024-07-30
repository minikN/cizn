import init from '@cizn/adapter/package/pacman/api/init'

const api = (App: Cizn.Application): Cizn.Adapter.Package.Api => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default api
