const options = {
  foo: 'bar',
}

const module = (config, options, utils, args) => {
  utils.createFile('.config/test', `\
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