import packageAdapter from "@cizn/adapter/package"

const init = (app: Cizn.Application) => () => {
  const{ Platform } = app.Adapter

  Platform.Package = packageAdapter(app)
}

export default init