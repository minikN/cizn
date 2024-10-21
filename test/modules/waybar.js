export default args => async (config, utils) => {
//   utils.file.write('.config/test', `\
// hello
// world
// `)

  //   utils.file.writeIni('.config/test.ini', {
  //     test: {
  //       num: 2,
  //       another: 'test',
  //     },
  //   })

  //   utils.file.writeYaml('.config/test.yaml', {
  //     test: {
  //       num: 2,
  //       another: 'test',
  //     },
  //   })

  //   utils.file.writeToml('.config/test.toml', {
  //     test: {
  //       num: 2,
  //       another: 'test',
  //     },
  //   })

  //   utils.file.writeJson('.config/test.json', {
  //     hello: {
  //       great: 'world1',
  //       foo: 'baz',
  //     },
  //   })

  //   utils.file.writeXml('.config/test.xml', {
  //     hello: {
  //       great: 'world1',
  //       foo: 'baz',
  //     },
  //   })


  const testFile2 = await utils.file.write('.config/test3', `\
hello
world1 2 
`)
  
  const testFile4 = await utils.file.write('/etc/testfile', `\
hello
world1 2 
`)

  return {
    config: {
      test: 2,
      waybar: { foo: 'bar2' },
    },
    homePackages: [
      'waybar',
    ],
    systemPackages: [
      'unzip',
    ],
    args,
  }
}