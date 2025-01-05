import { Serializer } from '@lib/serializers/index.ts'

/**
 * Serializes `content` to an json format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 * @returns {Promise<string>}
 */
const jsonSerializer: Serializer = async (existingContent, content) => {
  const combinedContent = {
    // TODO: Use our `parseJSON` here.
    ...existingContent ? JSON.parse(existingContent) : {},
    ...content,
  }

  return JSON.stringify(combinedContent)
}

export default jsonSerializer