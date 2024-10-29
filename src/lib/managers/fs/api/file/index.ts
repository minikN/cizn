import { FSFileApi } from '@lib/managers/fs/api'
import { is } from '@lib/managers/fs/api/file/is'
import { parseAsJSON, read } from '@lib/managers/fs/api/file/read'
import { remove } from '@lib/managers/fs/api/file/remove'
import { write } from '@lib/managers/fs/api/file/write'

const fsFileApi = (app: Cizn.Application): FSFileApi => Object.create({}, {
  write: {
    value: write(app),
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
  parseAsJSON: {
    value: parseAsJSON(app),
    enumerable: true,
  },
  is: {
    value: is(app),
    enumerable: true,
  },
})

export default fsFileApi