

export default args => (config, utils) => {
  utils.file.write('.config/test', `\
hello
world2  
`)

  return {
    config: { test: 2 },
    homePackages: [
      'sway-subpackage',
    ],
    args,
  }
}