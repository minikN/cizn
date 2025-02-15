import { FSFileApi } from '@lib/managers/fs/api/index.ts'
import { is } from '@lib/managers/fs/api/file/is.ts'
import { parseAsJSON, read } from '@lib/managers/fs/api/file/read.ts'
import { remove } from '@lib/managers/fs/api/file/remove.ts'
import { write } from '@lib/managers/fs/api/file/write.ts'
import { writeTemp } from '@lib/managers/fs/api/file/writeTemp.ts'
import { copy } from '@lib/managers/fs/api/file/copy.ts'

const fsFileApi = (app: Cizn.Application): FSFileApi => Object.create({}, {
  write: {
    value: write(app),
    enumerable: true,
  },
  writeTemp: {
    value: writeTemp(app),
    enumerable: true,
  },
  read: {
    value: read(app),
    enumerable: true,
  },
  copy: {
    value: copy(app),
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