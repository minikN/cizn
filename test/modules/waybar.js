export default args => (config, utils) => {
  console.log('waybar', args, config, utils)
  utils.withFile('.config/test', `\
hello
world  
`)

  return {
    config: {
      test: 2,
      waybar: {
        foo: 'bar1',
      },
    },
    packages: [
      'waybar',
    ],
    args,
  }
}