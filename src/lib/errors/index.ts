
type DefaultErrorTypes =
    // Generic errors
    | 'ENOENT'
    | 'ERR_INVALID_ARG_TYPE'
    // Application errors
    | 'NO_PATH_GIVEN'
    | 'NO_CONTENT_GIVEN'
    | 'INVALID_CONTENT_GIVEN'
    | 'INCORRECT_PATH_GIVEN'
    | 'NOT_READABLE_FILE'
    | 'NOT_A_FILE'

export type CiznError<E extends DefaultErrorTypes> = {
    readonly name: E,
    readonly label: string,
    readonly message?: string,
    readonly stack?: string
}

const defaultErrorMessages = Object.freeze({
  NO_PATH_GIVEN: 'No path given',
  NO_CONTENT_GIVEN: 'No content given',
  INVALID_CONTENT_GIVEN: 'Invalid content given',
  INCORRECT_PATH_GIVEN: 'Incorrect path given',
  ENOENT: 'No such file or directory',
  ERR_INVALID_ARG_TYPE: 'Invalid number of arguments',
  NOT_READABLE_FILE: 'File doesn\'t exist or isn\'t readable',
  NOT_A_FILE: 'Given path is not a file',
})

type OptionalErrorProps = {
    label?: string,
    explanation?: string,
    message?: string,
    stack?: string,
}
const _error = <E extends DefaultErrorTypes>(name: E, options?: OptionalErrorProps): CiznError<E> => ({
  name,
  label: options?.label || defaultErrorMessages[name],
  ...options?.explanation && { explanation: options.explanation },
  ...options?.message && { message: options.message },
  ...options?.stack && { stack: options.stack },
})

export const Error: <E extends DefaultErrorTypes>(name: E) => CiznError<E> = _error
export const ErrorWith: <E extends DefaultErrorTypes>(name: E, options: OptionalErrorProps) => CiznError<E> = _error
export const ErrorAs = <E extends DefaultErrorTypes>(name: E, explanation?: string) => (options: OptionalErrorProps) => _error(name, { ...options, explanation })


