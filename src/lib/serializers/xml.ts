import { Serializer } from '@lib/serializers/index.ts'
import { parse, stringify } from '@libs/xml'

/**
 * Serializes `content` to an xml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 * @returns {Promise<string>}
 */
const xmlSerializer: Serializer = async (existingContent, content) => {
  const combinedContent = {
    ...existingContent ? parse(existingContent) : {},
    ...content,
  }

  return stringify(combinedContent)
}

export default xmlSerializer