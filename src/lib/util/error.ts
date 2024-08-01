export interface CiznError extends Error {
    name: string,
    options: string[] | undefined
}

const createError = (name: string) => (options: string[] = []) => {
  const error = Error() as CiznError
  error.name = `Cizn${name}Error`
  error.options = options
  return error
}

const isErrorType = (error: Error, type: string): boolean => error.name === type

const NotFoundError = createError('NotFound')
const NotReadableError = createError('NotReadable')
const NotSupportedError = createError('NotSupported')

export {
  isErrorType,
  NotFoundError,
  NotReadableError,
  NotSupportedError,
}

