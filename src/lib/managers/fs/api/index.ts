import { Result } from "@lib/composition/result"
import { CiznError } from "@lib/errors"
import {
  isFile, parseJSON, readFile,
} from "./file"
import { makeDirectory } from "./folder"
import {
  getCwd, getRealPath, isPathReadable,
} from "./path"

export type Api = {
   isFile: (a: string) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string>
   readFile: (a: string) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string>,
   parseJSON: (a: string) => Result<CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>, object>,
   isPathReadable: (a: string) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_READABLE_FILE'>>, string>
   getRealPath: (a: string) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string>
   getCwd: () => Result<CiznError<'NO_PATH_GIVEN'>, string>
   makeDirectory: (a: string) => Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string>
  }

const fsApi = (app: Cizn.Application): Cizn.Manager.FS.Api => Object.create({}, {
  isFile: {
    value: isFile(app),
    enumerable: true,
    configurable: false,
  },
  isPathReadable: {
    value: isPathReadable(app),
    enumerable: true,
    configurable: false,
  },
  getRealPath: {
    value: getRealPath(app),
    enumerable: true,
    configurable: false,
  },
  readFile: {
    value: readFile(app),
    enumerable: true,
    configurable: false,
  },
  parseJSON: {
    value: parseJSON(app),
    enumerable: true,
    configurable: false,
  },
  getCwd: {
    value: getCwd(app),
    enumerable: true,
    configurable: false,
  },
  makeDirectory: {
    value: makeDirectory(app),
    enumerable: true,
    configurable: false,
  },
})

export default fsApi
