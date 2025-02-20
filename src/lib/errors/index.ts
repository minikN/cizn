export type DefaultErrorTypes =
    // Generic errors
    | 'ENOENT'
    | 'ERR_INVALID_ARG_TYPE'
    | 'EACCES'
    | 'EEXIST'
    // Application errors
    | 'NO_CWD_GIVEN'
    | 'NO_PATH_GIVEN'
    | 'NO_TARGET_GIVEN'
    | 'NO_CONTENT_GIVEN'
    | 'INVALID_CONTENT_GIVEN'
    | 'INCORRECT_PATH_GIVEN'
    | 'NOT_READABLE_FILE'
    | 'NOT_A_FILE'
    | 'NOT_A_DIR'
    | 'NOT_A_SYMLINK'
    | 'NOT_OWN_FILE'
    | 'NOT_KNOWN_ENVIRONMENT'

    | 'NO_GENERATIONS'
    | 'GENERATION_NOT_FOUND'

    | 'DERIVATION_NOT_FOUND'
    | 'MALFORMED_DERIVATION_HASH'

    | 'MODULE_ERROR'
    | 'TEMP_FILE_ERROR'
    | 'GENERIC_ERROR'
    | 'SERIALIZE_ERROR'

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
  NO_CWD_GIVEN: 'No CWD given',

  INVALID_CONTENT_GIVEN: 'Invalid content given',
  INCORRECT_PATH_GIVEN: 'Incorrect path given',

  ENOENT: 'No such file or directory',
  EACCES: 'Insufficient file permissions',
  EEXIST: 'Target already exists',

  ERR_INVALID_ARG_TYPE: 'Invalid number of arguments',

  NOT_READABLE_FILE: 'File doesn\'t exist or isn\'t readable',
  NOT_A_FILE: 'Given path is not a file',
  NOT_A_DIR: 'Given path is not a directory',
  NOT_A_SYMLINK: 'Given path is not a symbolic link',
  NOT_OWN_FILE: 'Given path is not managed by cizn',
  NOT_KNOWN_ENVIRONMENT: 'Given environment is not supported',

  NO_GENERATIONS: 'There are no generations',
  GENERATION_NOT_FOUND: 'Generation %d doesn\'t exist',

  DERIVATION_NOT_FOUND: 'Derivation %d doesn\'t exist',
  MALFORMED_DERIVATION_HASH: 'Derivation %d doesn\'t contain a valid hash',
  MODULE_ERROR: 'Evaluating a module caused an error',
  TEMP_FILE_ERROR: 'Creating a temporary file caused an error',
  GENERIC_ERROR: 'Generic error',
  SERIALIZE_ERROR: 'Could not properly serialize file content. Got: %d'
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

/**
 * Instantiates a new {@link CiznError} of `type` with `options`.
 *
 * @param {DefaultErrorTypes} name      name of the rror
 * @param {OptionalErrorProps} options  options for the error
 * @returns {CiznError}
 */
export const Error: <E extends DefaultErrorTypes>(name: E, options?: OptionalErrorProps) => CiznError<E> = _error

/**
 * Allows to override the `options` of an existing error by returning a function that
 * will accept the underyling `options` for the original error and merge them with
 * `overrides`.
 *
 * @param {DefaultErrorTypes} name        name of the rror
 * @param {OptionalErrorProps} overrrides options for the error
 * @returns {(a: OptionalErrorProps): CiznError}
 */
export const ErrorAs = <E extends DefaultErrorTypes>(name: E, overrides?: OptionalErrorProps) =>
  (options: OptionalErrorProps) => _error(name, { ...options, ...overrides })