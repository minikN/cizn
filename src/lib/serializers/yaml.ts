import { parse, stringify } from 'smol-toml'

type Props = {
    existingContent: string | null,
    content: object,
}

export default async (existingContent: Props['existingContent'], content: Props['content']): Promise<string> => {
  const combinedContent = {
    ...existingContent ? parse(existingContent) : {},
    ...content,
  }

  return stringify(combinedContent)
}