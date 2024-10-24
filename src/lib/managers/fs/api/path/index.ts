import { FSPathApi } from '@lib/managers/fs/api'
import { isReadable } from '@lib/managers/fs/api/path/isReadable'
import { getReal } from '@lib/managers/fs/api/path/getReal'
import { getCwd } from '@lib/managers/fs/api/path/getCwd'

const fsPathApi = (app: Cizn.Application): FSPathApi => Object.create({}, {
  isReadable: {
    value: isReadable(app),
    enumerable: true,
  },
  getReal: {
    value: getReal(app),
    enumerable: true,
  },
  getCwd: {
    value: getCwd(app),
    enumerable: true,
  },
})

export default fsPathApi