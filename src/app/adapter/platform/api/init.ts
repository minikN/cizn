import packageAdapter from "@cizn/adapter/package"
import packageApi from "@cizn/adapter/package/api"

const init = (app: Cizn.Application) => async (): Promise<void> => {
  const { Platform } = app.Adapter

  Platform.Package = await packageAdapter(app)
  Platform.Package.Api = await packageApi(app).init()
}

export default init