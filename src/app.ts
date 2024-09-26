import appComposition, { getApp } from '@cizn/index'
import {
  guard, map,
  tapError,
} from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Success } from '@lib/composition/result'
import { logError as logE } from '@lib/util'

// `appInstance` allows us to access the application, and therefore
// the log manager even if the application fails at the first
// possible point
const appInstance = await getApp()
const logError = logE(appInstance)

// Application lifecycle
asyncPipe(
  appComposition,
  map(guard(async (app) => {
    await app.Manager.Cli.Program.parseAsync(process.argv)
    return Success(app)
  })),
  // We reached the end of the application's lifecycle. If we
  // have an error here, lets tap into it and log it.
  tapError(logError),
)


