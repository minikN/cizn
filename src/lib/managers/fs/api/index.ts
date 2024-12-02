import { Result } from "@lib/composition/result"
import { CiznError } from "@lib/errors"
import fsDirectoryApi from "@lib/managers/fs/api/directory"
import fsFileApi from "@lib/managers/fs/api/file/index"
import fsLinkApi from "@lib/managers/fs/api/link/index"
import fsPathApi from "@lib/managers/fs/api/path/index"

export type Api = {
  File: FSFileApi,
  Directory: FSDirectoryApi,
  Path: FSPathApi,
  Link: FSLinkApi,
}

export type FSFileApi = {
  is: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string
  >

  remove: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'> | CiznError<'EACCESS'>
  >, string>

  read: (path: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string
  >,

  write: ({
    file, content, mode,
  }: {file: string, content: string, mode?: number}, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string
  >

  parseAsJSON: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>, object
  >,
}

export type FSDirectoryApi = {
  is: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_DIR'>>, string
  >

  make: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string
  >

  read: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string[]
  >

  remove: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_DIR'> | CiznError<'EACCESS'>
  >, string>
}

export type FSPathApi = {
  isReadable: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_READABLE_FILE'>>, string
  >

  getReal: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string
  >

  getDirname: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'>>, string
  >

   getCwd: () => Result<CiznError<'NO_CWD_GIVEN'>, string>

  rename: (a: string, b: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'EACCESS'>
  >, string>
}

export type FSLinkApi = {
  is: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'>>, string
  >

  read: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string
  >

  isOwn: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<
    | CiznError<'NO_PATH_GIVEN'>
    | CiznError<'INCORRECT_PATH_GIVEN'>
    | CiznError<'NOT_A_SYMLINK'>
    | CiznError<'NOT_OWN_FILE'>
    >, string
  >

  remove: (a: string, errors?: {[key: string]: (...args: any) => any}) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'> | CiznError<'EACCESS'>
  >, string>

  write: (t: string, p?: 'file' | 'dir' | 'junction') => (a: string, errors?: {[key: string]: (...args: any) => any}) =>
    Result<
      NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NO_TARGET_GIVEN'>>, string
    >
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
  Link: {
    value: fsLinkApi(app),
    enumerable: true,
    configurable: false,
  },
})

export default fsApi
