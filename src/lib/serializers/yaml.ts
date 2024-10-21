import { parse, stringify } from 'smol-toml'
import { Serializer } from '@lib/serializers'


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