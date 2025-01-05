import { make } from '@lib/managers/fs/api/directory/make.ts'
import { read } from '@lib/managers/fs/api/directory/read.ts'
import { remove } from '@lib/managers/fs/api/directory/remove.ts'
import { is } from '@lib/managers/fs/api/directory/is.ts'
import { FSDirectoryApi } from '@lib/managers/fs/api/index.ts'

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