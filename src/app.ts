import appComposition from '@cizn/index'
import { guard, map } from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Success } from '@lib/composition/result'

asyncPipe(
  appComposition,
  map(guard((app) => {
    app.Manager.Cli.Program.parseAsync(process.argv)
    return Success(app)
  })),
)

