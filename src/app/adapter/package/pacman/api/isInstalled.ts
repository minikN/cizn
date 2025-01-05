/**
 * Checks whether {@code x} is installed on the system.
 *
 * @param app {Cizn.Application} the application
 * @returns {Promise<boolean>}
 */
const isInstalled = (app: Cizn.Application) => async (x: string): Promise<boolean> => {
  const { Platform: { Package } } = app.Adapter
  const { stdout } = await Package.Run(['-Qet'])

  const installedPackages = stdout.split('\n')

  return installedPackages.includes(x)
}

export default isInstalled