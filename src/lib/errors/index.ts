export type DefaultErrorTypes =
    // Generic errors
    | 'ENOENT'
    | 'ERR_INVALID_ARG_TYPE'
    | 'EACCESS'
    | 'EEXIST'
    // Application errors
    | 'NO_PATH_GIVEN'
    | 'NO_TARGET_GIVEN'
    | 'NO_CONTENT_GIVEN'
    | 'INVALID_CONTENT_GIVEN'
    | 'INCORRECT_PATH_GIVEN'
    | 'NOT_READABLE_FILE'
    | 'NOT_A_FILE'
    | 'NOT_A_DIR'
    | 'NOT_A_SYMLINK'

export type CiznError<E extends DefaultErrorTypes> = {
    readonly name: E,
    readonly label: string,
    readonly message?: string,
    readonly stack?: string
    readonly options?: string[]
}

const defaultErrorMessages = Object.freeze({
  NO_PATH_GIVEN: 'No path given',
  NO_TARGET_GIVEN: 'No target given',
  NO_CONTENT_GIVEN: 'No content given',

  INVALID_CONTENT_GIVEN: 'Invalid content given',
  INCORRECT_PATH_GIVEN: 'Incorrect path given',

  ENOENT: 'No such file or directory',
  EACCESS: 'Insufficient file permissions',
  EEXIST: 'Target already exists',

  ERR_INVALID_ARG_TYPE: 'Invalid number of arguments',

  NOT_READABLE_FILE: 'File doesn\'t exist or isn\'t readable',
  NOT_A_FILE: 'Given path is not a file',
  NOT_A_DIR: 'Given path is not a directory',
  NOT_A_SYMLINK: 'Given path is not a symbolic link',
})

type OptionalErrorProps = {
    label?: string,
    reasons?: string[],
    message?: string,
    stack?: string,
    options?: string[]
}
const _error = <E extends DefaultErrorTypes>(name: E, props?: OptionalErrorProps): CiznError<E> => ({
  name,
  label: props?.label || defaultErrorMessages[name],
  ...props?.reasons && { reasons: props.reasons },
  ...props?.message && { message: props.message },
  ...props?.options && { options: props.options },
  ...props?.stack && { stack: props.stack },
})

export const Error: <E extends DefaultErrorTypes>(name: E) => CiznError<E> = _error
export const ErrorWith: <E extends DefaultErrorTypes>(name: E, options: OptionalErrorProps) => CiznError<E> = _error
export const ErrorAs = <E extends DefaultErrorTypes>(name: E, overrides?: OptionalErrorProps) =>
  (options: OptionalErrorProps) => _error(name, { ...options, ...overrides })


