import { XMLParser, XMLBuilder } from 'fast-xml-parser'

type Props = {
    existingContent: string | null,
    content: object,
}

export default async (existingContent: Props['existingContent'], content: Props['content']): Promise<string> => {
  const parser = new XMLParser()
  const builder = new XMLBuilder()

  const combinedContent = {
    ...existingContent ? parser.parse(existingContent) : {},
    ...content,
  }

  return builder.build(combinedContent)
}