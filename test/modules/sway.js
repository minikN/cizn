const options = {
  foo: 'babb1',
}

const module = (config, options, utils, args) => {
  utils.withFile('.config/test', `\
hello
world  
`)

  return {
    config: {
      test: 1,
    },
    packages: [
      'sway',
    ],
  }
}

export default args => ({
  name: 'sway',
  args,
  options,
  module,
})