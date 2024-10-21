import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { Serializer } from '@lib/serializers'

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
  const parser = new XMLParser()
  const builder = new XMLBuilder()

  const combinedContent = {
    ...existingContent ? parser.parse(existingContent) : {},
    ...content,
  }

  return builder.build(combinedContent)
}

export default xmlSerializer