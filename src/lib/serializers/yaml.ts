// deno-lint-ignore-file no-unused-vars require-await
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { Serializer } from '@lib/serializers/index.ts'
import { parse, stringify } from '@std/yaml'

/**
 * Serializes `content` to an yaml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 * @returns {Promise<string>}
 */
const yamlSerializer: Serializer = (app: Cizn.Application) => async (existingContent, content) =>
  asyncPipe(
    Success({ existingContent, content }),
    map(guard((x) => {
      const existingContent = x.existingContent ? parse(x.existingContent) : {}
      return Success({ ...<object> existingContent, ...content })
    }, { 'GENERIC_ERROR': ErrorAs('SERIALIZE_ERROR') })),
    map((x) => Success(stringify(x))),
  )

export default yamlSerializer
