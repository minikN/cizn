import builders from '@cizn/core/derivation/api/builders'
import file from '@cizn/core/derivation/api/file'
import get from '@cizn/core/derivation/api/get'
import make from '@cizn/core/derivation/api/make'
import path from '@cizn/core/derivation/api/path'
import {
  Derivation, DerivationData, FileDerivation,
} from '@cizn/core/state'

export type DerivationPathProps = {
  name: string,
  builder: Derivation['builder']
  hashParts: {
    config?: Object,
    args?: Object,
    env: DerivationData,
    module: Cizn.Application.State.Derivation.Module | string,
    inputs: Derivation[]
  }
}

export type DerivationPath = {
  path: Cizn.Application.State.Derivation['path'],
  exists: boolean,
}

export type DerivationFileApi = {
  write: (inputs: Derivation[]) => (path: string, content: string) => Promise<string>
}

export type DerivationBuilderApi = {
  file: (derivation: FileDerivation) => Promise<void>
  module: (derivation: Derivation) => Promise<void>
  generation: (derivation: Derivation) => Promise<void>
}

export type Api = {
  make: (
    module: Cizn.Application.State.Derivation.Module,
    builder: Cizn.Application.State.Derivation['builder'],
    env?: Cizn.Application.State.DerivationData
  ) => Cizn.Application.State.Derivation
  get: ({ hash }: {hash: Cizn.Application.State.Derivation['hash']}) => Promise<Cizn.Application.State.Derivation | null>
  path: (props: DerivationPathProps) => Promise<DerivationPath>
  file: DerivationFileApi
  builders: DerivationBuilderApi
}

const derivationApi = (app: Cizn.Application): Api => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  path: {
    value: path(app),
    enumerable: true,
  },
  get: {
    value: get(app),
    enumerable: true,
  },
  builders: {
    value: builders(app),
    enumerable: true,
  },
  file: {
    value: file(app),
    enumerable: true,
  },
})

export default derivationApi
