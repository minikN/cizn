import appComposition, { getApp } from '@cizn/index'
import {
  guard, map,
  tapError,
} from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Success } from '@lib/composition/result'
import { logError as logE } from '@lib/util'

// TODO: combine Error, ErrorAs, ErrorWith into one function
// TODO: remove isError, we have isFailure/isSuccess in result.js

// `appInstance` allows us to access the application, and therefore
// the log manager even if the application fails at the first
// possible point
const appInstance = await getApp()
const logError = logE(appInstance)

// Application lifecycle
asyncPipe(
  appComposition,
  map(guard(async (app) => {
    // Executing action handler for the given args
    await app.Manager.Cli.Program.parseAsync(process.argv)

    /**
     * With {@link Commander}, there is no way to return something from an action handler.
     * `parseAsync` will just return the `Command` again. We need to access the result of
     * the operation here to log possible errors. Therefore, each action handler will save
     * its result in {@link app.Manager.Cli.Result} so that we can access it here.
     */
    return app.Manager.Cli.Result ?? Success(undefined)
  })),
  // We reached the end of the application's lifecycle. If we
  // have an error here, lets tap into it and log it.
  tapError(logError),
)
