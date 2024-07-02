const options = {
  foo: 'baz',
}

const module = (config, options, utils, args) => {
  utils.withFile('.config/test', `\
foo
`)
}

export default args => ({
  name: 'waybar',
  args,
  options,
  module,
})