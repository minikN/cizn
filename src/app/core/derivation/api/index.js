import make from '@cizn/core/derivation/api/make.js'

const derivationApi = app => Object.create({}, {
  make: {
    value: make(app),
    iterable: true,
    enumerable: true,
  },
})

export default derivationApi
