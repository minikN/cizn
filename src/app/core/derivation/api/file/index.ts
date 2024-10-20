import write from '@cizn/core/derivation/api/file/write'
import { DerivationFileApi } from '@cizn/core/derivation/api'

const derivationFileApi = (app: Cizn.Application): DerivationFileApi => Object.create({}, {
  write: {
    value: write(app),
    enumerable: true,
  },
})

export default derivationFileApi
