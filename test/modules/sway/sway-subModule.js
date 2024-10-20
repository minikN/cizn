

export default args => (config, utils) => {
  return {
    config: { test: 3 },
    homePackages: [
      'sway-subpackage',
    ],
    args,
  }
}