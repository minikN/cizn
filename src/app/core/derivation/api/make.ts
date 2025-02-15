// deno-lint-ignore-file require-await
import G from '@cizn/constants.ts'
import { DerivationPath, DerivationPublicFileApi } from '@cizn/core/derivation/api/index.ts'
import { Derivation, DerivationEnvironment, FileDerivation } from '@cizn/core/state.ts'
import { bind, guard, map, mapEach, mapIf, mapIfElse, tap, tapIf } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { getFileName, isFn, isStr } from '@lib/util/index.ts'
import { getHash, makeHash } from '@lib/util/string.ts'

type DerivationState = {
  derivation: {
    hash?: string
    filePath?: string
    info: DerivationPath
  }
  module: {
    content: Cizn.Application.State.Derivation.ModuleOptions
  }
}
type DerivationContent = {
  name: Derivation['name']
  path: DerivationState['derivation']['filePath']
  hash: DerivationState['derivation']['hash']
  builder: Derivation['builder']
  env: DerivationEnvironment
  inputs: Derivation[]
}

/**
 * Binds the `inputDerivations` to the file API.
 *
 * We need to 'bind' the list of `inputDerivations` each of the functions the file api
 * exports. `fn.(inputDerivations)` will return a function that accepts the args the user
 * calls them with in the module (e.g. `(path, content)` for `Derivation.Api.file.write`).
 * Also see {@link inputDerivations}.
 *
 * @param {Cizn.Application} app          the application
 * @param {Derivation[]} inputDerivations the input derivations
 */
const getBoundFileApi = (app: Cizn.Application, inputDerivations: Derivation[]) => () =>
  Object.entries(app.State.Derivation.Api.file).reduce((acc, [key, fn]) => {
    const k = key as keyof DerivationPublicFileApi
    acc[k] = fn?.(inputDerivations)
    return acc
  }, <DerivationPublicFileApi> {})

/**
 * Executes the user module, providing it the `boundFileApi`.
 *
 * The call to this function is wrapped with a {@link guard}. In case the module contains
 * an error, we'll catch it and return a `MODULE_ERROR`.
 *
 * @param {Cizn.Application} app                            the application
 * @param {Cizn.Application.State.Derivation.Module} module the user module
 */
const executeModule =
  (app: Cizn.Application, module: Cizn.Application.State.Derivation.Module) =>
  async (boundFileApi: DerivationPublicFileApi) => {
    const moduleContent = await module?.(app.State.Derivation.State.Config || {}, { file: boundFileApi })
    return Success({ module: { content: moduleContent } })
  }

/**
 * Sets the name of the executed `module` as `true` in the derivation state config.
 *
 * If the module is called `sway`, it'll add `'sway': true` to the config, so that the
 * next module to be executed gets this information.
 *
 * @param {Cizn.Application} app  the application
 * @param {string} name           name of the executed module
 */
const setDerivationConfig = (app: Cizn.Application, name: string) =>
(
  { module: { content } }: { module: { content: Cizn.Application.State.Derivation.ModuleOptions } },
) => {
  app.State.Derivation.State.Config = {
    ...app.State.Derivation.State.Config || {},
    ...getFileName(`${app.State.Source.Current}`) !== name ? { [name]: true } : {},
    ...content.config || {},
  }
}

/**
 * Executes {@link make} for each module provided.
 *
 * @param {Cizn.Application} app  the application
 */
const makeInputDerivations =
  (app: Cizn.Application) => async (module: Cizn.Application.State.Derivation.ModuleOptions) => (
    asyncPipe(
      Success(module.modules),
      map(mapEach(async (subModule) => await app.State.Derivation.Api.make({ module: subModule, builder: 'module' }))),
    )
  )

/**
 * Computes the hash for the current derivation and returns it alongside the incoming data.
 *
 * @param {DerivationState} state state for the current derivation
 */
const collectDerivationHash = (state: DerivationState) => ({
  ...state,
  derivation: { ...state.derivation, hash: getHash(state.derivation.info.path) },
})

/**
 * Assembles the path for the current derivation and returns it alongside the incoming data.
 *
 * @param {DerivationState} state state for the current derivation
 */
const collectDerivationFilePath = (app: Cizn.Application) => (state: DerivationState) => ({
  ...state,
  derivation: { ...state.derivation, filePath: `${app.State.Derivation.Root}/${state.derivation.info.path}` },
})

/**
 * Computes the output hash for the current derivation and returns it alongside the
 * incoming data.
 *
 * @param {DerivationState} state state for the current derivation
 */
const collectOutputHash = (app: Cizn.Application) => ({ data }: { data: DerivationContent }) => ({
  data: { ...data, env: { ...data?.env, out: `${app.State.Derivation.Root}/${makeHash(data)}-${data.name}` } },
})

/**
 * Gets the found derivation using {@link get} and returns it.
 *
 * @param {Cizn.Application} app  the application
 */
const returnDerivation = (app: Cizn.Application) => async (state: DerivationState) =>
  asyncPipe(
    Success(state),
    tap((x) => {
      app.Manager.Log.Api.info(
        { message: 'Reusing derivation %d ...', options: [x.derivation.info.path || ''] },
      )
      app.Manager.Log.Api.unindent()
    }),
    map(async (x) => {
      const derivation = await app.State.Derivation.Api.get(x.derivation.hash || '')
      return derivation
    }),
    bind((derivation) => {
      app.State.Derivation.State.Built.push(<Derivation> derivation)
      return derivation
    }),
  )

/**
 * Creates a temporary file for the derivation and returns it alongsside the initial input.
 *
 * @param {Cizn.Application} app the application
 */
const collectTempFile = (app: Cizn.Application) => ({ data }: { data: DerivationContent }) =>
  asyncPipe(
    Success(data.inputs),
    map(mapEach((derivation) =>
      Success({
        path: derivation.path,
        env: { path: derivation.env.path, out: derivation.env.out },
      })
    )),
    bind((inputs) => ({ data, tempFileContent: { ...data, inputs } })),
    map(async ({ data, tempFileContent }) => {
      const tempFile = await app.Manager.FS.Api.File.writeTemp({
        name: data.name,
        hash: <string> data.hash,
        content: JSON.stringify(tempFileContent),
        ext: G.DRV_EXT,
      })

      return isSuccess(tempFile)
        ? Success({ data, tempFile: tempFile.value, tempFileContent })
        : Failure(tempFile.error)
    }),
  )

/**
 * Builds a derivation defined by the incoming `content`.
 *
 * @param {Cizn.Application} app      the application
 * @param {DerivationContent} content content of the derivation to be built
 */
const buildDerivation =
  (app: Cizn.Application, { name, builder, env, inputs }: DerivationContent) => async (state: DerivationState) =>
    asyncPipe(
      Success({
        data: {
          name,
          path: state.derivation.filePath,
          inputs,
          env,
          hash: state.derivation.hash,
          builder,
        },
      }),
      tap(() =>
        app.Manager.Log.Api.info({
          message: 'Creating derivation for %d ...',
          options: [name],
        })
      ),
      tap(app.Manager.Log.Api.unindent),
      bind(collectOutputHash(app)),
      map(collectTempFile(app)),
      map(async (x) => {
        const file = await app.Manager.FS.Api.File.copy(x.tempFile, <string> x.tempFileContent.path)
        return isSuccess(file) ? Success(x) : Failure(file.error)
      }),
      mapIf(
        ({ data: { builder } }) => builder === 'file',
        async (x) => {
          const file = await app.State.Derivation.Api.builders.file(<FileDerivation> x.data)
          return isSuccess(file) ? Success(x) : Failure(file.error)
        },
      ),
      mapIf(
        ({ data: { builder } }) => builder === 'module',
        async (x) => {
          const builder = await app.State.Derivation.Api.builders.module(<Derivation> x.data)
          return isSuccess(builder) ? Success(x) : Failure(builder.error)
        },
      ),
      mapIf(
        ({ data: { builder } }) => builder === 'generation',
        async (x) => {
          const builder = await app.State.Derivation.Api.builders.generation(<Derivation> x.data)
          return isSuccess(builder) ? Success(x) : Failure(builder.error)
        },
      ),
      tap(({ data }) => app.State.Derivation.State.Built.push(<Derivation> data)),
      map(({ data }) => Success(<Derivation> data)),
    )

/**
 * Creates or reuses a derivation based on provided `module` function, a
 * `builder` type and some input `data`.
 *
 * Does so by executing the provided `module`function and inspecting its return
 * values. If the `builder` is of type `generation` and the `module` function
 * returns `modules`, it will build derivations for each of the provided modules.
 * It will then add these derivations as inputs for the current one. After that,
 * it builds the actual derivation by calling a builder function based on the
 * `builder` attribute.
 *
 * NOTE: It does NOT take `Environment` into consideration. It will always build
 * one derivation for all proveded inputs. It's the generation's `make` method's
 * job to create a generation based on that derivation for the given environment.
 *
 * @param {Cizn.Application} app the application
 */
const make = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['make'] => async (props) => {
  /**
   * A derivation can have inputs, which themselves are other derivations.
   * We need to create a (for now) empty list of input derivations for this
   * derivation.
   *
   * It will be filled in either of two ways:
   * - the `module` function that we'll call later returns `modules`, which
   *   is a list of input derivations
   * - Inside the `module` function, we inline create a file/service/package.
   *   Those call will run functions (e.g. `Derivation.Api.file.write` for
   *   files) that themselves will create derivations. They are called with
   *   this list in their scope and will add the derivations they create to
   *   it.
   */
  const derivationInputs: Derivation[] = []

  const {
    data = {},
    module: { module: moduleFn, name: moduleName, args: moduleArgs },
    builder,
  } = props

  const derivationEnv: DerivationEnvironment = {
    name: data.name || moduleName,
    path: data.path,
    content: data.content,
    out: '',
  }

  const isGeneration = builder === 'generation'
  const canBeEvaluated = isGeneration || builder === 'module'
  const isInvalid = canBeEvaluated && (!moduleFn || !isFn(moduleFn) || !moduleName || !isStr(moduleName))

  app.Manager.Log.Api.indent()

  return asyncPipe(
    Success(undefined),
    tapIf(() => isInvalid, () => {
      app.Manager.Log.Api.error({
        message: '%d module not correctly exported: Got: name: %d, module: %d',
        options: [
          moduleName,
          moduleName,
          moduleFn,
        ],
      })
    }),
    tapIf(() => canBeEvaluated, () => {
      app.Manager.Log.Api.info({ message: 'Evaluating module %d ...', options: [moduleName] })
    }),
    bind(getBoundFileApi(app, derivationInputs)),
    map(guard(executeModule(app, moduleFn), { '*': ErrorAs('MODULE_ERROR') })),
    tap(({ module: { content: { config = {} } } }) => {
      Object.keys(config).forEach((x) => {
        if (app.State.Derivation.State.Config[x]) {
          app.Manager.Log.Api.warn({
            message: 'Config option %d is overwritten by %d module',
            options: [x, moduleName],
          })
        }
      })
    }),
    tap(setDerivationConfig(app, moduleName)),
    mapIf(() => isGeneration, (data) =>
      asyncPipe(
        Success(data),
        map(async (x) => await makeInputDerivations(app)(x.module.content)),
        tap((x) => derivationInputs.push(...x)),
        map(() => Success(data)),
      )),
    map((prevData) =>
      asyncPipe(
        Success({
          hashParts: {
            module: moduleFn,
            data,
            args: moduleArgs,
            config: app.State.Derivation.State.Config,
            inputs: derivationInputs,
          },
          name: moduleName,
          builder,
        }),
        map(app.State.Derivation.Api.path),
        bind((derivation) => (
          { derivation: { info: derivation }, ...prevData }
        )),
      )
    ),
    bind(collectDerivationHash),
    bind(collectDerivationFilePath(app)),
    mapIfElse(
      ({ derivation: { info } }) => info.exists,
      returnDerivation(app),
      buildDerivation(app, {
        name: moduleName,
        builder,
        env: derivationEnv,
        inputs: derivationInputs,
        path: '',
        hash: '',
      }),
    ),
  )
}

export default make
