import G from '@lib/static.js'

const { LOG, ADAPTER, API, LEVEL, PROGRAM } = G

const indent = (app, remove) => () => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program, [LEVEL]: level = 0 } = adapter

  const indent = [...Array(remove ? level - 1 : level + 1).keys()].map(() => '=').join('')
  const newLevel = remove
    ? level - 1
    : level + 1

  adapter[LEVEL] = newLevel <= 0 ? 0 : newLevel
  adapter[PROGRAM] = program.scope(indent)
}

export default indent