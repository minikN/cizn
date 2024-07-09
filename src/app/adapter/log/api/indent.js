import G from '@lib/static.js'

const { LOG, ADAPTER, API, LEVEL, PROGRAM } = G

const indent = (app, remove) => () => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [LEVEL]: level = '' } = adapter

  adapter[LEVEL] = remove
    ? level.length <= 1
      ? ''
      : level.substring(0, level.length - 1)
    : `${level} `
}

export default indent