import { FSPathApi } from '@lib/managers/fs/api/index.ts'
import { isReadable } from '@lib/managers/fs/api/path/isReadable.ts'
import { getReal } from '@lib/managers/fs/api/path/getReal.ts'
import { getDirname } from '@lib/managers/fs/api/path/getDirname.ts'
import { getCwd } from '@lib/managers/fs/api/path/getCwd.ts'
import { rename } from '@lib/managers/fs/api/path/rename.ts'

const fsPathApi = (app: Cizn.Application): FSPathApi => Object.create({}, {
  isReadable: {
    value: isReadable(app),
    enumerable: true,
  },
  getReal: {
    value: getReal(app),
    enumerable: true,
  },
  getDirname: {
    value: getDirname(app),
    enumerable: true,
  },
  getCwd: {
    value: getCwd(app),
    enumerable: true,
  },
  rename: {
    value: rename(app),
    enumerable: true,
  },
})

export default fsPathApi