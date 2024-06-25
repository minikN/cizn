const options = {
  foo: 'baz',
}

const module = (config, options, utils, args) => {
}

export default args => ({
  name: 'waybar',
  args,
  options,
  module,
})