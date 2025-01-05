const waybar = args => async (config, utils) => {
  await utils.file.write('/etc/testfile', `\
hello1
world
`)

  await utils.file.writeIni('.config/test.ini', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  await utils.file.writeYaml('.config/test.yaml', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  await utils.file.writeToml('.config/test.toml', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  await utils.file.writeJson('.config/test.json', {
    hello: {
      great: 'world1',
      foo: 'baz',
    },
  })

  await utils.file.writeXml('.config/test.xml', {
    hello: {
      great: 'world1',
      foo: 'baz',
    },
  })

  return {
    name: 'waybar',
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
  }
}

export default args => ({
  args,
  name: 'waybar',
  module: waybar(args)
})