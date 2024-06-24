const options = {
  foo: 'bar',
}

const module = (config, options, utils) => {
  console.log('sway')
}

export default args => ({
  name: 'sway',
  args,
  options,
  module,
})