import { withFile, withRealFile, include } from '@cizn/utils/file.js'

export const publicUtils = {
  withFile,
}

export const internalUtils = {
  withRealFile,
  include,
}

export default {
  internalUtils,
  publicUtils,
}