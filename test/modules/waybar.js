export default args => (config, utils) => {
  utils.file.write('.config/test', `\
hello
world  
`)

  utils.file.writeIni('.config/test.ini', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  utils.file.writeYaml('.config/test.yaml', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  utils.file.writeToml('.config/test.toml', {
    test: {
      num: 2,
      another: 'test',
    },
  })

  utils.file.writeJson('.config/test.json', {
    hello: {
      great: 'world1',
      foo: 'baz',
    },
  })

  utils.file.writeXml('.config/test.xml', {
    hello: {
      great: 'world1',
      foo: 'baz',
    },
  })

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