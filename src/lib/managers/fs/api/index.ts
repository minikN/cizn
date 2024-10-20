import { Result } from "@lib/composition/result"
import { CiznError } from "@lib/errors"
import fsDirectoryApi from "@lib/managers/fs/api/directory"
import fsFileApi from "@lib/managers/fs/api/file/index"
import fsPathApi from "@lib/managers/fs/api/path/index"

export type Api = {
  File: FSFileApi,
  Directory: FSDirectoryApi,
  Path: FSPathApi,
}

export type FSFileApi = {
  is: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string>
  read: (path: string, errors?: {[key: string]: (...args: any) => any}) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string>,
  write: () => Promise<void>
  parseAsJSON: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>, object>,
}

export type FSDirectoryApi = {
   make: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string>
}

export type FSPathApi = {
   isReadable: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_READABLE_FILE'>>, string>
   getReal: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string>
   getCwd: () => Result<CiznError<'NO_PATH_GIVEN'>, string>
}

const fsApi = (app: Cizn.Application): Cizn.Manager.FS.Api => Object.create({}, {
  File: {
    value: fsFileApi(app),
    enumerable: true,
    configurable: false,
  },
  Directory: {
    value: fsDirectoryApi(app),
    enumerable: true,
    configurable: false,
  },
  Path: {
    value: fsPathApi(app),
    enumerable: true,
    configurable: false,
  },
})

export default fsApi
