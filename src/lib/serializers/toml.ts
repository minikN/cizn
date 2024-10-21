import { Serializer } from '@lib/serializers'
import { parse, stringify } from 'yaml'

/**
 * Serializes `content` to an toml format.
 *
 * Merges with `existingContent` if available.
 *
 * @param {object} existingContent exising file content
 * @param {object} content new file content
 * @returns {Promise<string>}
 */
const tomlSerializer: Serializer = async (existingContent, content) => {
  const combinedContent = {
    ...existingContent ? parse(existingContent) : {},
    ...content,
  }

  return stringify(combinedContent)
}

export default tomlSerializer