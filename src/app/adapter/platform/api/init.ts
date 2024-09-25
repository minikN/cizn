import packageAdapter from "@cizn/adapter/package"
import packageApi from "@cizn/adapter/package/api"
import { Result, Success } from "@lib/composition/result"

const init = (app: Cizn.Application) => async (): Promise<Result<never, Cizn.Application>> => {
  const { Platform } = app.Adapter

  Platform.Package = await packageAdapter(app)
  Platform.Package.Api = await packageApi(app).init()

  return Success(app)
}

export default init