import G from '@cizn/constants.ts'
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { FSFileApi } from '@lib/managers/fs/api/index.ts'
import crypto from 'node:crypto'
import { tmpdir } from 'node:os'
import path from 'node:path'

type TempFileProps = {
  name: string
  hash: string
  ext?: string
  content?: string
  tempPath?: string
  tempFilename?: string
}

/**
 * Tries to create a file at `path` with `mode` permissions and writes
 * `content` to it.
 *
 * @param {string} file the file to write
 * @param {string} content content to write
 * @param {number} mode permissions for the file
 * @private
 */
const _writeTempFile = (app: Cizn.Application) => async ({ tempFilename: file = '', content = '' }: TempFileProps) =>
  await app.Manager.FS.Api.File.write({ file, content })

/**
 * Assembles the path for the temporary file and returns it alongside `data`.
 *
 * @param {TempFileProps} data incoming data
 */
const collectTempPath = (data: TempFileProps) => {
  const tempPath = path.join(tmpdir(), G.APP_NAME)

  return Success({
    ...data,
    tempPath,
    tempFilename: path.join(
      tempPath,
      `${data.name}-${data.hash || crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${
        data.ext ? `.${data.ext}` : ''
      }`,
    ),
  })
}

/**
 * Creates a temporay file with `content`.
 *
 * @param {Cizn.Application} app the application
 */
export const writeTemp = (app: Cizn.Application): FSFileApi['writeTemp'] => (data, errors) =>
  asyncPipe(
    Success(data),
    map(guard(collectTempPath, { '*': ErrorAs('TEMP_FILE_ERROR') })),
    map(async (data) => {
      const folder = await app.Manager.FS.Api.Directory.make(data.tempPath, errors)
      return isSuccess(folder) ? Success(data) : Failure(folder.error)
    }),
    map(guard(_writeTempFile(app), {
      ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
      ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
      EISDIR: errors?.EISDIR ?? ErrorAs('NOT_A_FILE'),
      EACCES: errors?.EACCES ?? ErrorAs('EACCES'),
    })),
  )
