export default args => (config, utils) => {
  return {
    config: { test: 56 },
    homePackages: [
      'zsh',
    ],
    args,
  }
}