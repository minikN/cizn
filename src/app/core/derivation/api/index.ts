import builders from '@cizn/core/derivation/api/builders/index.ts'
import clean from '@cizn/core/derivation/api/clean.ts'
import file, { WriteType } from '@cizn/core/derivation/api/file/index.ts'
import get from '@cizn/core/derivation/api/get.ts'
import make from '@cizn/core/derivation/api/make.ts'
import path from '@cizn/core/derivation/api/path.ts'
import { Derivation, DerivationData, FileDerivation } from '@cizn/core/state.ts'
import { Result } from '@lib/composition/result.ts'
import { CiznError } from '@lib/errors/index.ts'

export type DerivationPathProps = {
  name: string
  builder: Derivation['builder']
  hashParts: {
    config?: object
    args?: object
    data: DerivationData
    module: Cizn.Application.State.Derivation.Module | string
    inputs: Derivation[]
  }
}

export type DerivationPath = {
  path: Cizn.Application.State.Derivation['path']
  exists: boolean
}

export type DerivationFileApi = {
  write: WriteType
  writeXml: WriteType
  writeJson: WriteType
  writeYaml: WriteType
  writeToml: WriteType
  writeIni: WriteType
}

export type DerivationPublicFileApi = {
  [Property in keyof DerivationFileApi]: ReturnType<DerivationFileApi[Property]>
}

export type DerivationBuilderApi = {
  file: (derivation: FileDerivation) => Promise<
    Result<
      NonNullable<
        | CiznError<'NO_PATH_GIVEN'>
        | CiznError<'INCORRECT_PATH_GIVEN'>
        | CiznError<'NOT_A_FILE'>
      >,
      string
    >
  >
  module: (derivation: Derivation) => Promise<
    Result<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'EACCES'>,
      undefined
    >
  >
  generation: (derivation: Derivation) => Promise<
    Result<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'EACCES'>,
      undefined
    >
  >
}

export type DerivationMakeProps = {
  module: Cizn.Application.State.Derivation.FileModule
  builder: Cizn.Application.State.Derivation['builder']
  data?: Cizn.Application.State.DerivationData
}

export type Api = {
  make: (props: DerivationMakeProps) => Promise<
    Result<
      | CiznError<'MODULE_ERROR'>
      | CiznError<'NO_CONTENT_GIVEN'>
      | CiznError<'INVALID_CONTENT_GIVEN'>
      | CiznError<'MALFORMED_DERIVATION_HASH'>
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'GENERIC_ERROR'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'EACCES'>
      | CiznError<'TEMP_FILE_ERROR'>
      | CiznError<'NOT_A_FILE'>
      | CiznError<'DERIVATION_NOT_FOUND'>,
      Cizn.Application.State.Derivation
    >
  >

  get: (hash: Cizn.Application.State.Derivation['hash']) => Promise<
    Result<
      | CiznError<'MALFORMED_DERIVATION_HASH'>
      | CiznError<'NOT_A_FILE'>
      | CiznError<'NO_CONTENT_GIVEN'>
      | CiznError<'INVALID_CONTENT_GIVEN'>
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'DERIVATION_NOT_FOUND'>,
      Derivation
    >
  >

  path: (props: DerivationPathProps) => Promise<
    Result<
      | CiznError<'INVALID_CONTENT_GIVEN'>
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>,
      DerivationPath
    >
  >
  clean: () => void
  file: DerivationFileApi
  builders: DerivationBuilderApi
}

const derivationApi = (app: Cizn.Application): Api =>
  Object.create({}, {
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
