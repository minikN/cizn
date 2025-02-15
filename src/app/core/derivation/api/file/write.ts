// deno-lint-ignore-file require-await
import { WriteProps, WriteState, WriteType } from '@cizn/core/derivation/api/file/index.ts'
import { Derivation } from '@cizn/core/state.ts'
import { bind, map, tap, tapError } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { Error } from '@lib/errors/index.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { getFileName } from '@lib/util/index.ts'

/**
 * @param {cizn.application} app          the main application
 * @param {serializer | null} serializer  the serializer to use
 * @param {Derivation[]} inputs           input derivations
 * @param {WriteProps} args               user-provided args
 * @returns
 */
const buildDerivation =
  (app: Cizn.Application, serializer: Serializer | null, inputs: Derivation[], { content, path, props }: WriteProps) =>
  async (data: WriteState) =>
    asyncPipe(
      Success(data),
      bind((x) =>
        Object.assign(x, {
          previousContent: x.derivation
            // deno-fmt-ignore
            ? !props.override
              ? x.derivation.env.content || null
              : null
            : null,
        })
      ),
      map(async (x) => {
        const fileContent = serializer
          ? await serializer(app)(x.previousContent, <object> content)
          : Success(`${x.previousContent || ''}${content}`)

        return isSuccess(fileContent)
          ? Success(Object.assign(x, { fileContent: fileContent.value }))
          : Failure(fileContent.error)
      }),
      map(async (x) => {
        const derivation = await app.State.Derivation.Api.make({
          module: { module: () => <Cizn.Application.State.Derivation.ModuleOptions> {}, name: x.name },
          data: { content: x.fileContent, path, name: x.name },
          builder: 'file',
        })

        return isSuccess(derivation) ? Success({ derivation: derivation.value }) : Failure(derivation.error)
      }),
      tap((x) => inputs.push(x.derivation)),
      bind((x) => Object.assign(x, { outPath: x.derivation.env.out })),
    )

/**
 * Builds a derivation, optionally with the given `serializer` and returns
 * the derivations `outPath`. This function is called from a user-provided
 * module.
 *
 * In case and error occures, the execution will be stopped immediately.
 * Upon success, the function needs to return the output path for the
 * build derivation (a string), so the user can use it in the module
 * (e.g. use it in another file they want to create)
 *
 * @example <caption>Writing an ini file</caption>
 * await utils.file.writeIni('.config/test-ini.ini', {
 *   test: {
 *     num: 2,
 *     another: 'test',
 *   },
 * })
 *
 * @param {cizn.application} app          the main application
 * @param {serializer | null} serializer  the serializer to use
 */
const write =
  (app: Cizn.Application, serializer: Serializer | null = null): WriteType =>
  (inputs) =>
  async (path, content, props = {}) =>
    asyncPipe(
      Success(undefined),
      bind(() => {
        const buildDerivation = app.State.Derivation.State.Built.find((d) => d.env.path === path)
        return { derivation: buildDerivation }
      }),
      bind((x) => Object.assign(x, { name: getFileName(`${path}`) })),
      map(
        async (x) =>
          await buildDerivation(app, serializer, inputs, {
            content,
            path,
            props: { override: props.override },
          })(x),
      ),
      tapError((e) => app.Manager.Log.Api.error({ message: e.label })),
      (x) => isSuccess(x) ? x.value.outPath : '',
    )

export default write
