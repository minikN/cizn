import init from '@cizn/core/state/api/init'

export type Api = {
  init: () => Promise<void>
}

const derivationApi = (App: Cizn.Application): Cizn.Application.State.Api => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default derivationApi
