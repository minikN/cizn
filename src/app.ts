import appComposition from '@cizn/index'
import G from '@lib/static'

const { ADAPTER, CLI, PROGRAM } = G

/** @type {Cizn.Application} */
const app = await appComposition({})

// eslint-disable-next-line no-undef
await app[ADAPTER][CLI][PROGRAM].parseAsync(process.argv)
