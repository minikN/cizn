import make from '@cizn/core/derivation/api/make.js'
import get from '@cizn/core/derivation/api/get.js'

const derivationApi = app => Object.create({}, {
  make: {
    value: make(app),
    iterable: true,
    enumerable: true,
  },
  get: {
    value: get(app),
    iterable: true,
    enumerable: true,
  },
})

export default derivationApi
