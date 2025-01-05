import { Result, Success } from "@lib/composition/result.ts"

const init = (app: Cizn.Application) => (): Result<never, Cizn.Application> => Success(app)

export default init