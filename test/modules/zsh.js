export default args => async (config, utils) => {
  return {
    config: { test: 561 },
    homePackages: [
      'zsh',
    ],
    args,
  }
}