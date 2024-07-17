import appComposition from '@cizn/index'
import G from '@cizn/global'

const app = await appComposition(<Cizn.Application>{})

await app.Adapter.Cli.Program.parseAsync(process.argv)