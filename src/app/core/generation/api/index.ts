import apply from '@cizn/core/generation/api/apply.ts'
import get from '@cizn/core/generation/api/get.ts'
import make from '@cizn/core/generation/api/make.ts'
import path from '@cizn/core/generation/api/path.ts'
import set from '@cizn/core/generation/api/set.ts'
import { Result } from '@lib/composition/result.ts'
import { CiznError } from '@lib/errors/index.ts'

export type GenerationEnvironment = Extract<Cizn.Application.State.Environment, 'home' | 'system'>

export type Api = {
  make: (props: Cizn.Application.State.Derivation) => Promise<Cizn.Application.State.Generation>
  path: ({ hash }: {hash: Cizn.Application.State.Derivation['hash']}) => Promise<
  Result<
    | CiznError<"NO_PATH_GIVEN">
    | CiznError<"INCORRECT_PATH_GIVEN">,
    Cizn.Application.State.Generation>>
  set: (generation: Cizn.Application.State.Generation) => Promise<
  Result<
    | CiznError<"NOT_A_SYMLINK">
    | NonNullable<CiznError<"NO_PATH_GIVEN">
    | CiznError<"INCORRECT_PATH_GIVEN">
    | CiznError<"NO_TARGET_GIVEN">
    | CiznError<"EACCES">>,
    string>
  >
  get: (generationNumber?: string) => Result<
    | NonNullable<CiznError<"NO_PATH_GIVEN"> | CiznError<"INCORRECT_PATH_GIVEN">>
    | CiznError<'GENERATION_NOT_FOUND'>
    | CiznError<'NO_GENERATIONS'>,
    Cizn.Application.State.Generation
  >
  apply: () => Promise<Result<
  | CiznError<"NO_PATH_GIVEN">
  | CiznError<"INCORRECT_PATH_GIVEN">
  | CiznError<"NOT_A_SYMLINK">
  | CiznError<"NO_TARGET_GIVEN">
  | CiznError<"EACCES">
  | CiznError<"NOT_A_DIR">
  | CiznError<"NOT_OWN_FILE">,
  undefined>>
}

const generationApi = (App: Cizn.Application): Cizn.Application.State.Generation.Api => Object.create({}, {
  make: {
    value: make(App),
    enumerable: true,
  },
  path: {
    value: path(App),
    enumerable: true,
  },
  set: {
    value: set(App),
    enumerable: true,
  },
  get: {
    value: get(App),
    enumerable: true,
  },
  apply: {
    value: apply(App),
    enumerable: true,
  },
})

export default generationApi
