export default args => (config, utils) => {
  console.log('zsh', args, config, utils)
  utils.withFile('.config/test', `\
hello1
world  
`)

  return {
    config: {
      test: 3,
    },
    packages: [
      'zsh',
    ],
  }
}