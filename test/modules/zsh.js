const options = {
  zsh: true,
}

const module = (config, options, utils) => {
  console.log('zsh')
}

export default args => ({
  name: 'zsh',
  args,
  options,
  module,
})