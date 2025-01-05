const zsh = args => async (config, utils) => {
  return {
    config: { test: 561 },
    homePackages: [
      'zsh',
    ],
  }
}

export default (args) => ({
  args,
  name: 'zsh',
  module: zsh(args)
})
