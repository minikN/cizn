import swaySubModule from './sway/sway-subModule.js'

export default args => (config, utils) => {
  utils.file.write('.config/test', `\
hello
world1 2 
`)
  utils.file.writeIni('.config/test.ini', {
    foo: 'bar',
    test: {
      hello: 'world',
      num: 1,
    },
  })

  utils.file.writeYaml('.config/test.yaml', {
    foo: 'bar',
    test: {
      hello: 'world',
      num: 1,
    },
  })

  utils.file.writeToml('.config/test.toml', {
    foo: 'bar',
    test: {
      hello: 'world',
      num: 1,
    },
  })

  utils.file.writeJson('.config/test.json', {
    foo: 'bar',
    hello: {
      great: 'world',
    },
  })

  utils.file.writeXml('.config/test.xml', {
    foo: 'bar',
    hello: {
      great: 'world',
    },
  })
  const modules = [
    swaySubModule({ wayland: true }),
  ]

  return {
    modules,
    config: {
      err: 'hello1',
    },
    packages: [
      'sway',
    ],
    args,
  }
}