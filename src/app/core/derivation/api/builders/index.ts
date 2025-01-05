import file from '@cizn/core/derivation/api/builders/file.ts'
import module from '@cizn/core/derivation/api/builders/module.ts'
import generation from '@cizn/core/derivation/api/builders/generation.ts'
import { DerivationBuilderApi } from '@cizn/core/derivation/api/index.ts'

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
