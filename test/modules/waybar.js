export default args => (config, utils) => {
  utils.withFile('.config/test', `\
hello
world  
`)

  return {
    config: {
      test: 2,
    },
    packages: [
      'waybar',
    ],
  }
}