// deno-lint-ignore-file no-unused-vars require-await
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { ErrorAs, Error } from '@lib/errors/index.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { parse, stringify } from '@libs/xml'
import { isStr } from '@lib/util/index.ts'

/**
 * Serializes `content` to an xml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 */
const xmlSerializer: Serializer = (app: Cizn.Application) => async (existingContent, content) =>
  asyncPipe(
    Success({ existingContent, content }),
    map(guard((x) => {
      const existingContent = x.existingContent ? parse(x.existingContent) : {}
      const stringifiedContent = stringify({ ...existingContent, ...x.content })
      return Success(stringifiedContent)
    }, { '*': ErrorAs('SERIALIZE_ERROR', { options: [isStr(content) ? content : content?.toString?.()] }) })),
  )

export default xmlSerializer
