const options = {
  foo: 'baz',
}

const module = (config, options, utils) => {
  console.log('waybar')
}

export default args => ({
  name: 'waybar',
  args,
  options,
  module,
})