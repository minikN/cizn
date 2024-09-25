import { Result, Success } from "@lib/composition/result"

const init = (app: Cizn.Application) => (): Result<never, Cizn.Application> => {
  // nothing to do
  return Success(app)
}

export default init