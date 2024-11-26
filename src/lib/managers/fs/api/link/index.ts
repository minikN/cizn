import { remove } from '@lib/managers/fs/api/link/remove'
import { is } from '@lib/managers/fs/api/link/is'
import { isOwn } from '@lib/managers/fs/api/link/isOwn'
import { write } from '@lib/managers/fs/api/link/write'
import { read } from '@lib/managers/fs/api/link/read'
import { FSLinkApi } from '@lib/managers/fs/api'

const fsLinkApi = (app: Cizn.Application): FSLinkApi => Object.create({}, {
  remove: {
    value: remove(app),
    enumerable: true,
  },
  is: {
    value: is(app),
    enumerable: true,
  },
  isOwn: {
    value: isOwn(app),
    enumerable: true,
  },
  write: {
    value: write(app),
    enumerable: true,
  },
  read: {
    value: read(app),
    enumerable: true,
  },
})

export default fsLinkApi