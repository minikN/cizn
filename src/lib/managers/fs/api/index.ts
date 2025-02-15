import { Result } from '@lib/composition/result.ts'
import { CiznError } from '@lib/errors/index.ts'
import fsDirectoryApi from '@lib/managers/fs/api/directory/index.ts'
import fsFileApi from '@lib/managers/fs/api/file/index.ts'
import fsLinkApi from '@lib/managers/fs/api/link/index.ts'
import fsPathApi from '@lib/managers/fs/api/path/index.ts'

export type Api = {
  File: FSFileApi
  Directory: FSDirectoryApi
  Path: FSPathApi
  Link: FSLinkApi
}

export type FSFileApi = {
  is: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>,
    string
  >

  remove: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'> | CiznError<'EACCES'>
    >,
    string
  >

  read: (path: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>,
    string
  >

  write: ({
    file,
    content,
    mode,
  }: { file: string; content: string; mode?: number }, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>,
    string
  >

  writeTemp: (
    {
      name,
      hash,
      ext,
      content,
    }: { name: string; hash: string; ext: string; content?: string },
    errors?: { [key: string]: (...args: any) => any },
  ) => Result<
    NonNullable<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NOT_A_FILE'>
      | CiznError<'TEMP_FILE_ERROR'>
    >,
    string
  >

  copy: (a: string, b: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'EACCES'>
    >,
    string
  >

  parseAsJSON: <T>(
    guard: (t: any) => t is T,
  ) => (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>,
    T
  >
}

export type FSDirectoryApi = {
  is: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_DIR'>>,
    string
  >

  make: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>,
    string
  >

  read: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>,
    string[]
  >

  remove: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_DIR'> | CiznError<'EACCES'>
    >,
    string
  >
}

export type FSPathApi = {
  isReadable: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_READABLE_FILE'>>,
    string
  >

  getReal: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>,
    string
  >

  getDirname: (a: string, errors?: { [key: string]: (...args: any) => any }) => Promise<
    Result<
      NonNullable<CiznError<'NO_PATH_GIVEN'>>,
      string
    >
  >

  getCwd: () => Result<CiznError<'NO_CWD_GIVEN'>, string>

  rename: (a: string, b: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NO_TARGET_GIVEN'>
      | CiznError<'EACCES'>
    >,
    string
  >
}

export type FSLinkApi = {
  is: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'>>,
    string
  >

  read: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>,
    string
  >

  isOwn: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      | CiznError<'NO_PATH_GIVEN'>
      | CiznError<'INCORRECT_PATH_GIVEN'>
      | CiznError<'NOT_A_SYMLINK'>
      | CiznError<'NOT_OWN_FILE'>
    >,
    string
  >

  remove: (a: string, errors?: { [key: string]: (...args: any) => any }) => Result<
    NonNullable<
      CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'> | CiznError<'EACCES'>
    >,
    string
  >

  write: (
    t: string,
    p?: 'file' | 'dir' | 'junction',
  ) => (a: string, errors?: { [key: string]: (...args: any) => any }) => Promise<
    Result<
      NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NO_TARGET_GIVEN'>>,
      string
    >
  >
}

const fsApi = (app: Cizn.Application): Cizn.Manager.FS.Api =>
  Object.create({}, {
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
