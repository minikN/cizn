import { FSPathApi } from '@lib/managers/fs/api'
import { isReadable } from '@lib/managers/fs/api/path/isReadable'
import { getReal } from '@lib/managers/fs/api/path/getReal'
import { getDirname } from '@lib/managers/fs/api/path/getDirname'
import { getCwd } from '@lib/managers/fs/api/path/getCwd'
import { rename } from '@lib/managers/fs/api/path/rename'

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