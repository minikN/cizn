import make from '@cizn/core/generation/api/make.js'
import get from '@cizn/core/generation/api/get.js'
import set from '@cizn/core/generation/api/set.js'

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
  set: {
    value: set(app),
    iterable: true,
    enumerable: true,
  },
})

export default derivationApi
