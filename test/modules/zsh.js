const zsh = args => async (config, utils) => {
  return {
    config: { test: 561 },
    homePackages: [
      'zsh',
    ],
    args,
  }
}

export default args => zsh(args)