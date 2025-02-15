// deno-lint-ignore-file no-unused-vars require-await
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { parse, stringify } from '@std/toml'
import { isStr } from '@lib/util/index.ts'

/**
 * Serializes `content` to an toml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 */
const tomlSerializer: Serializer = (app: Cizn.Application) => async (existingContent, content) =>
  asyncPipe(
    Success({ existingContent, content }),
    map(guard((x) => {
      const existingContent = x.existingContent ? parse(x.existingContent) : {}
      const stringifiedContent = stringify({ ...existingContent, ...x.content })
      return Success(stringifiedContent)
    }, { '*': ErrorAs('SERIALIZE_ERROR', { options: [isStr(content) ? content : content?.toString?.()] }) })),
  )

export default tomlSerializer
