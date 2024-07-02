import { compose } from "@lib/util/index.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import { APP_NAME, APP_VERSION } from "@cizn/index.js"
import G from '@lib/static.js'
import { program } from "@commander-js/extra-typings"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import cliApi from "@cizn/adapter/cli/api/index.js"

const { PROGRAM, API } = G

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Cli}
 */
const cliAdapter = (app) => {
  /** @type {Cizn.Adapter.Cli} */
  const adapterComposition = compose(
    defineImmutableProp('_name', APP_NAME),
    defineImmutableProp('_version', APP_VERSION),
    defineImmutableProp(PROGRAM, program),
    defineNamespace(API),
    setNamespace(API, cliApi(app)),
  )({})


  return adapterComposition
}

export default cliAdapter