import swaySubModule from './sway/sway-subModule.js'

export default args => (config, utils) => {
  utils.file.write('.config/test', `\
hello
world1 2 
`)
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