import { make } from '@lib/managers/fs/api/directory/make'
import { read } from '@lib/managers/fs/api/directory/read'
import { remove } from '@lib/managers/fs/api/directory/remove'
import { is } from '@lib/managers/fs/api/directory/is'
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
  remove: {
    value: remove(app),
    enumerable: true,
  },
  is: {
    value: is(app),
    enumerable: true,
  },
})

export default fsDirectoryApi