// deno-lint-ignore-file require-await no-unused-vars
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { parse, stringify } from '@std/ini'
import { isStr } from '@lib/util/index.ts'

/**
 * Serializes `content` to an ini format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 */
const iniSerializer: Serializer = (app: Cizn.Application) => async (existingContent, content) =>
  asyncPipe(
    Success({ existingContent, content }),
    map(guard((x) => {
      const existingContent = x.existingContent ? parse(x.existingContent) : {}
      const stringifiedContent = stringify({ ...existingContent, ...x.content })
      return Success(stringifiedContent)
    }, { '*': ErrorAs('SERIALIZE_ERROR', { options: [isStr(content) ? content : content?.toString?.()] }) })),
  )

export default iniSerializer
