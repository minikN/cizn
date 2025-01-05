import { parse, stringify } from '@std/yaml'
import { Serializer } from '@lib/serializers/index.ts'

/**
 * Serializes `content` to an yaml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 * @returns {Promise<string>}
 */
const yamlSerializer: Serializer = async (existingContent, content) => {
  const combinedContent = {
    ...existingContent ? parse(existingContent) : {},
    ...content,
  }

  return stringify(combinedContent)
}

export default yamlSerializer