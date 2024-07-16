import G from '@cizn/global'

const indent = (app: Cizn.Application, remove: boolean) => () => {
  const { [G.LOG]: adapter } = app[G.ADAPTER]
  const { [G.LEVEL]: level = '' } = adapter

  adapter[G.LEVEL] = remove
    ? level.length <= 1
      ? ''
      : level.substring(0, level.length - 1)
    : `${level} `
}

export default indent