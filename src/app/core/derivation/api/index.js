import make from '@cizn/core/derivation/api/make.js'
import has from '@cizn/core/derivation/api/has.js'
import init from '@cizn/core/derivation/api/init.js'

const derivationApi = app => Object.create({}, {
  init: {
    value: init(app),
    iterable: true,
    enumerable: true,
  },
  make: {
    value: make(app),
    iterable: true,
    enumerable: true,
  },
  has: {
    value: has(app),
    iterable: true,
    enumerable: true,
  },
})

export default derivationApi
