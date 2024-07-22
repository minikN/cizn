export default args => (config, utils) => {
  utils.file.write('.config/zsh', `\
hello1
world  
`)

  utils.file.write('/etc/test', `\
hello1
world  
`)

  return {
    config: { test: 56 },
    homePackages: [
      'zsh',
    ],
    args,
  }
}