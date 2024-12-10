import builders from '@cizn/core/derivation/api/builders'
import clean from '@cizn/core/derivation/api/clean'
import file from '@cizn/core/derivation/api/file'
import get from '@cizn/core/derivation/api/get'
import make from '@cizn/core/derivation/api/make'
import path from '@cizn/core/derivation/api/path'
import {
  Derivation, DerivationData, FileDerivation,
} from '@cizn/core/state'
import { Result } from '@lib/composition/result'
import { CiznError } from '@lib/errors'

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

  get: (hash: Cizn.Application.State.Derivation['hash']) => Promise<Result<
   | CiznError<"MALFORMED_DERIVATION_HASH">
   | CiznError<"NOT_A_FILE">
   | CiznError<"NO_CONTENT_GIVEN">
   | CiznError<"INVALID_CONTENT_GIVEN">
   | CiznError<"NO_PATH_GIVEN">
   | CiznError<"INCORRECT_PATH_GIVEN">,
   Derivation | undefined
   >>

  path: (props: DerivationPathProps) => Promise<DerivationPath>
  clean: () => void
  file: DerivationFileApi
  builders: DerivationBuilderApi
}

const derivationApi = (app: Cizn.Application): Api => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  clean: {
    value: clean(app),
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
