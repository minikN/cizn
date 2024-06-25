import { curry } from '@lib/util/index.js'

export const createFile = curry((target, file, destination) => {
  console.log('target', target)
  console.log('file', file)
  console.log('destination', destination)
})