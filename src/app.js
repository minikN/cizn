import appComposition from '@cizn/index.js'
import G from '@lib/static.js'

const { ADAPTER, CLI, PROGRAM } = G

const app = await appComposition({})

// eslint-disable-next-line no-undef
await app[ADAPTER][CLI][PROGRAM].parseAsync(process.argv)
