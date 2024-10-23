import { make } from '@lib/managers/fs/api/directory/make'
import { read } from '@lib/managers/fs/api/directory/read'
import { FSDirectoryApi } from '@lib/managers/fs/api'

const fsDirectoryApi = (app: Cizn.Application): FSDirectoryApi => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  read: {
    value: read(app),
    enumerable: true,
  },
})

export default fsDirectoryApi