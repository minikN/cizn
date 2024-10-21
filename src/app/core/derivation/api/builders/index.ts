import file from '@cizn/core/derivation/api/builders/file'
import module from '@cizn/core/derivation/api/builders/module'
import generation from '@cizn/core/derivation/api/builders/generation'
import { DerivationBuilderApi } from '@cizn/core/derivation/api'

const derivationBuilderApi = (app: Cizn.Application): DerivationBuilderApi => Object.create({}, {
  file: {
    value: file(app),
    enumerable: true,
  },
  module: {
    value: module(app),
    enumerable: true,
  },
  generation: {
    value: generation(app),
    enumerable: true,
  },
})

export default derivationBuilderApi
