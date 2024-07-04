import swaySubModule from './sway/sway-subModule.js'

export default args => (config, utils) => {
  console.log('sway', args,config, utils)
  utils.withFile('.config/test', `\
hello
world1 2 
`)
  const modules = [
    swaySubModule({ wayland: true }),
  ]

  return {
    modules,
    config: {
      test: 11111,
    },
    packages: [
      'sway',
    ],
  }
}