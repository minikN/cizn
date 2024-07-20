import appComposition from '@cizn/index'

const app = await appComposition(<Cizn.Application>{})

await app.Adapter.Cli.Program.parseAsync(process.argv)