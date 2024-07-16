import appComposition from '@cizn/index'
import G from '@cizn/global'

const app = await appComposition({})

await app[G.ADAPTER][G.CLI][G.PROGRAM].parseAsync(process.argv)