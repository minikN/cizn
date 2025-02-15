// deno-lint-ignore-file require-await
import { map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { isObj } from '@lib/util/index.ts'

/**
 * Serializes `content` to an json format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent  exising file content
 * @param {object} content          new file content
 */
const jsonSerializer: Serializer = (app: Cizn.Application) => async (existingContent, content) =>
  asyncPipe(
    Success({ existingContent, content }),
    map((x) => {
      const existingContent = x.existingContent
        ? app.Manager.FS.Api.File.parseAsJSON(isObj)(x.existingContent)
        : Success({})
      return isSuccess(existingContent) ? Success({ ...existingContent.value, ...content }) : Failure(existingContent.error)
    }),
    map((x) => Success(JSON.stringify(x))),
  )

export default jsonSerializer
