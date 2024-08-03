import init from '@cizn/adapter/package/pacman/api/init'
import isInstalled from '@cizn/adapter/package/pacman/api/isInstalled'
import install from '@cizn/adapter/package/pacman/api/install'

const api = (App: Cizn.Application): Cizn.Adapter.Package.Api => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
  isInstalled: {
    value: isInstalled(App),
    enumerable: true,
  },
  install: {
    value: install(App),
    enumerable: true,
  },
})

export default api
