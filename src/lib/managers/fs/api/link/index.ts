import { remove } from '@lib/managers/fs/api/link/remove'
import { is } from '@lib/managers/fs/api/link/is'
import { write } from '@lib/managers/fs/api/link/write'
import { FSLinkApi } from '@lib/managers/fs/api'

const fsDirectoryApi = (app: Cizn.Application): FSLinkApi => Object.create({}, {
  remove: {
    value: remove(app),
    enumerable: true,
  },
  is: {
    value: is(app),
    enumerable: true,
  },
  write: {
    value: write(app),
    enumerable: true,
  },
})

export default fsDirectoryApi