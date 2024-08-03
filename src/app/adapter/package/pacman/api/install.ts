import { NotFoundError } from '@lib/util/error'
import { ExecaError, execa } from 'execa'

/**
 * Installs {@code x} on the system if not already installed.
 *
 * @param app {Cizn.Application} the application
 * @returns {Promise<boolean>}
 */
const install = (app: Cizn.Application) => async (x: string): Promise<void> => {
  const { Platform: { Package }, Log: { Api: log } } = app.Adapter
  const isInstalled = await Package.Api.isInstalled(x)

  if (!isInstalled) {
    try {
      log.info({ message: 'Installing %d package ...', options: [x] })
      const { failed } = await execa('sudo', ['-n', 'true'], { reject: false })
      failed && process.stdout.write('Enter password: ')

      const { stderr } = await Package.Run(['-S', x], { stdout: 'ignore' })

      if (stderr.includes('No AUR package found')) {
        throw NotFoundError([x])
      }
    } catch (e) {
      if (
      // Checking if either packman or helper reported that the package
      // wasn't found
        (e as Error).name === 'CiznNotFoundError'
        || (e as ExecaError).failed === true && (e as ExecaError)?.stderr?.includes(<never>'target not found')
      ) {
        log.error({ message: 'Package %d not found', options: [x] })
      } else {
        log.error({
          message: 'Installing %d package failed. Output: %d',
          options: [x, (e as ExecaError)?.stderr || (e as Error).message],
        })
      }
    }
  }
}

export default install