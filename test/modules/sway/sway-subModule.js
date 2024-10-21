

export default args => async (config, utils) => {
  const testFile2 = await utils.file.write('.config/test3', `\
hello
world1 2 
`)
  return {
    config: { test: 3 },
    homePackages: [
      'sway-subpackage',
    ],
    args,
  }
}