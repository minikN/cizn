import { Derivation } from "@cizn/core/state"
import { getFileName } from "@lib/util"

const write = (App: Cizn.Application) => (inputs: Derivation[]) => async (path: string, content: string) => {
  const { Derivation, Environment: environment } = App.State

  const name = getFileName(`${path}`)

  const derivation = await Derivation.Api.make(() => {}, 'file', {
    content, path, name,
  })

  inputs.push(derivation)
  const out = derivation.env?.out

  return `${Derivation.Root}/${out}`
}

export default write