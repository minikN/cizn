export default args => (config, utils) => {
  utils.withFile('.config/zsh', `\
hello1
world  
`)

  return {
    config: {
      test: 56,
    },
    packages: [
      'zsh',
    ],
    args,
  }
}