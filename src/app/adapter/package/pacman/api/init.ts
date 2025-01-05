import { execa } from 'npm:execa'

const init = (app: Cizn.Application) => async () => {
  const { Platform: { Package } } = app.Adapter

  // Setting up package manager
  Package.Manager.Arguments = ['--noconfirm']
  Package.Manager.Root = true

  // Setting up helper
  if (Package.Helper.Exec) {
    Package.Helper.Arguments = ['--noconfirm', '--quiet', '--sudoflags="-S"']
    Package.Helper.Root = false
  }

  Package.Run = async (args: string[], options = {}) => {
    const targetExec = Package.Helper.Exec
      ? Package.Helper
      : Package.Manager

    const result = await execa(`${targetExec.Root ? 'sudo -S ' : ''}${targetExec.Exec}`, [...targetExec.Arguments.concat(args)], {
      shell: true,
      stdin: 'inherit',
      ...options,
    })

    return result
  }
}

export default init