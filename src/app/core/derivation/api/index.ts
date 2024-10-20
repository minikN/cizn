import file from '@cizn/core/derivation/api/file'
import get from '@cizn/core/derivation/api/get'
import make from '@cizn/core/derivation/api/make'
import { Derivation, DerivationEnvironment } from '@cizn/core/state'

export type GetProps = {
  name: string,
  builder: Derivation['builder']
  hashParts: {
    config?: Object,
    args?: Object,
    env: DerivationEnvironment,
    module: Cizn.Application.State.Derivation.Module | string,
    inputs: Derivation[]
  }
}

export type GetType = Promise<{
  path: Cizn.Application.State.Derivation['path'],
  exists: boolean,
}>

export type DerivationFileApi = {
  write: (inputs: Derivation[]) => (path: string, content: string) => Promise<string>
}

export type Api = {
  make: (
    module: Cizn.Application.State.Derivation.Module,
    builder?: Cizn.Application.State.Derivation['builder'],
    env?: Cizn.Application.State.Derivation['env']
  ) => Cizn.Application.State.Derivation
  get: (props: GetProps) => GetType
  file: DerivationFileApi
}

const derivationApi = (app: Cizn.Application): Api => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  get: {
    value: get(app),
    enumerable: true,
  },
  file: {
    value: file(app),
    enumerable: true,
  },
})

export default derivationApi
