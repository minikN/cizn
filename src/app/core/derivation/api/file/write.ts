import { Serializer } from "@lib/serializers"
import { getFileName } from "@lib/util"
import { WriteType } from "."

/**
 *
 * @param app
 * @param serializer
 * @returns
 */
const write = (app: Cizn.Application, serializer: Serializer | null = null): WriteType => inputs => async (path, content, props = {}) => {
  const { Derivation } = app.State
  const { override = false } = props

  const alreadyBuiltDerivation = Derivation.State.Built.find(x => x.env.path === path)

  const previousContent = alreadyBuiltDerivation
    ? !override
      ? <string>alreadyBuiltDerivation.env.content
      : null
    : null

  /**
   * Appends {@link content} to the content of the previously built derivation
   * (of the same file) if {@link override} is `true`.
   */
  const fileContent = serializer
    ? await serializer(previousContent, <object>content)
    : `${previousContent || ''}${content}`

  const name = getFileName(`${path}`)

  const derivation = await Derivation.Api.make(() => {}, 'file', {
    content: fileContent, path, name,
  })

  inputs.push(derivation)
  const out = derivation.env?.out

  return `${Derivation.Root}/${out}`
}

export default write