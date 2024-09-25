const indent = (App: Cizn.Application, remove: boolean) => () => {
  const { Log } = App.Manager
  const { Level: level } = Log

  Log.Level = remove
    ? level.length <= 1
      ? ''
      : level.substring(0, level.length - 1)
    : `${level} `
}

export default indent