export default args => (config, utils) => {
  utils.file.write('.config/test', `\
hello
world  
`)

  return {
    config: {
      test: 2,
      waybar: {
        foo: 'bar2',
      },
    },
    packages: [
      'waybar',
    ],
    args,
  }
}