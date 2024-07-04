

export default args => (config, utils) => {
  console.log('sway-sub', args, config, utils)
  utils.withFile('.config/test', `\
hello
world2  
`)

  return {
    config: {
      test: 2,
    },
    packages: [
      'sway-subpackage',
    ],
  }
}