import { _dual } from "@lib/composition/pipe"
import {
  Failure,
  isFailure,
  Result, Success,
} from "@lib/composition/result"
import { CiznError } from "@lib/errors"


/**
 * PATTERN MATCHING
 *
 * Matches the result of the last function in the chain and returns the output immediately
 * in case it is an error or passes it on to the next function and returns that output
 *
 * @param nextFunction Next function in the pipe
 * @param input        Output from the last function in the pipe
 * @returns nextValue
 */
const match = <E1, A, E2, B>(nextFunction: (a: A) => Result<E2, B>, input: Result<E1, A>) => {
  switch (input._tag) {
    case 'error':
      return input
    case 'value':
      return nextFunction(input.value)
    default:
      const _exhaustive: never = input
      return _exhaustive
  }
}

/**
 * ERROR PATTERN MATCHING
 *
 * Works similiar to {@link match}, but matches against error types.
 * If `input` is not an error, it will simply return it. If it is,
 * it will match the type of the error against the ones defined in
 * `errors`. It will then execute the callback for that specific
 * error and return its result.
 *
 * @param errors Mapping between error types and callbacks
 * @param input output of previous function
 * @returns nextValue | input
 */
const matchError = <E1, A, E2, B, F extends (...args: any) => Result<E2, B> | void>(errors: {[key: string]: F}, input: Result<E1, A>): Result<E1, A> | Result<E2, B> => {
  switch (input._tag) {
    case 'value':
      return input
    case 'error':
      const error = input.error as CiznError<any>
      return errors?.[error.name]?.() || input
  }
}


/**
 * MAP ADAPTER FUNCTION
 *
 * @note: Based on https://github.com/Effect-TS/effect/blob/main/packages/effect/src/internal/core.ts#L754
 *
 * This function maps a switch function. A switch function is a function that
 * has one input (data) but may return two different things, either data
 * (happy path) or an error (bad path).
 *
 * Map will return a function that accepts the output of the previous function
 * in the pipeline ({@code input}) and will match it (using {@link match}), if
 * it matches the happy case, it will execute {@code nextFunction} with the
 * output. If it matches the bad case, it will return the error immediately and
 * not pass it on to the function it maps.
 *
 * In addition to that, it will also attempt to flatten the output. If
 * {@code input} is a {@link Result}, and the output of {@code nextFunction} is
 * also a {@link Result}, without flattening the return type would be
 * ```
 * Result<Error, Result<previousError, value>>
 * ```
 * By flattening the result, the return type is
 * ```
 * Result<Error | previousError, value>
 * ```
 *
 * @example
 * const app = pipe(
 *   Success({}), // empty object
 *   map(doSomething)
 * )
 *
 * @param {Function} nextFunction the next function to execute
 * @param {Result} input          output of the previous function
 *
 * @constant
 * @name map
 * @kind variable
 * @type {{ <A, E2, B>(nextFunction: (a: A) => Result<E2, B> | Promise<Result<E2, B>>): <E1>(input: Result<E1, A>) => Result<E1 | E2, B>; <E1, A, E2, B>(input: Result<E1, A>, nextFunction: (a: A) => Result<E2, B>): Result<E1 | E2, B>; }}
 * @exports
 */
export const map: {
  <A, E2, B>(nextFunction: (a: A) => Result<E2, B> | Promise<Result<E2, B>>): <E1>(input: Result<E1, A>) => Result<E1 | E2, B>
  <E1, A, E2, B>(input: Result<E1, A>, nextFunction: (a: A) => Result<E2, B>): Result<E1 | E2, B>
} = _dual(2,
  <E1, A, E2, B>(input: Result<E1, A>, nextFunction: (a: A) => Result<E2, B>): Result<E1 | E2, B> => match(
    nextFunction,
    input,
  ))


/**
 * BIND ADAPTER FUNCTION
 *
 * Binds a single function. A single function is a function that has an input and
 * only one possible output. Meaning it cannot fail. It will match the `previousValue`
 * by passing it the output of the single function wrappen in a {@link Success}.
 *
 * @example
 * pipe(
 *   map(...) // previous calculation, returns v
 *   bind((v: number) => v + 1) // it cannot fail
 *   map(...) // gets v + 1 as input
 * )

 * @param {Function} singleFunction
 */
export const bind = <E1, A, B>(singleFunction: (a: A) => B) => (previousValue: Result<E1, A>): Result<E1, B> => match(
  value => Success(singleFunction(value)),
  previousValue,
)

/**
 * ERROR MAPPING OVERRIDE
 *
 * Wraps `switchFunction` like ({@link parseJSON}) and makes it possible to overwrite the
 * default error mapping with `errors`.
 *
 * @example
 * pipe(
 *   ...,
 *   // The ENOENT error handling for fn gets overwritten only for this case
 *   map(withError(fn, { ENOENT: () => console.log('Oops, file not found') }))
 * )
 *
 * @param {Function} switchFunction next function to call
 * @param {object} errors           overriding errors
 */
export const withError = <A, E2, B, F extends (...args: any) => any>(switchFunction: (a: A, b?: {[key: string]: F}) => Result<E2, B>, errors: {[key: string]: F}) => (input: A): Result<E2, B> => {
  return switchFunction(input, errors)
}

/**
 * GUARD ADAPTER FUNCTION
 *
 * Wraps the {@param switchFunction} in a try/catch block and if an error is
 * thrown, it will wrap it in a {@link Failure} and return it. Otherwise it
 * will return the result of the function.
 * If `errors` is given, it will return the errors defined in the mapping.
 *
 * @example <caption>Without mapping</caption>
 * pipe(
 *   ...,
 *   // It will return a Failure containing the thrown error
 *   map(guard(functionThatCanThrow))
 *   ...
 * )

 * @example <caption>With mapping</caption>
 * pipe(
 *   ...,
 *   // It will return a Failure containing the mapped error
 *   map(guard(functionThatCanThrow, {
 *     ENOENT: new Error('File not found')
 *     ERR_INVALID_ARG_TYPE: new Error('no arg given')
 *   }))
 *   ...
 * )
 *
 * @param {Function} switchFunction Function to wrap
 * @param {Object} [errors] Mapping between error types and thrown errors
 * @returns
 */
export const guard = <L, R, G, F extends (...args: any) => any>(
  switchFunction: (a: R) => Result<L, G> | Promise<Result<L, G>>,
  errors?: {[key: string]: F},
) => async (previousValue: R) => {
    try {
      return await switchFunction(previousValue)
    } catch (e: any) {
      return Failure(errors?.[e.code || e.name]?.({
        ...e, message: e.message, stack: e.stack,
      }) as ReturnType<F> || e as L)
    }
  }

/**
 * RECOVER ADAPTER FUNCTION
 *
 * Tries to recover from an error. If `input` is not an error, it will simply
 * return it. If it is an error, it will execute the callback in `errors` that
 * matches the error type and returns that return value wrapped in a
 * {@link Success}.
 *
 * @TODO Make recover use map to flatten types, so that we don't have to wrap
 * the result in a Success
 *
 * @example
 * pipe(
 *   map(...) // Previous calculation that may return errors
 *   recover({
 *     ENOENT: () => ({ foo: bar }) // Will return an object if error is ENOENT
 *     NO_PATH_GIVEN: () => '~/.config' // Will return a string if error is NO_PATH_GIVEN
 *   })
 *   map(...) // Using either the object or the string from above
 * )
 *
 * @param errors Mapping between error types and callbacks
 * @returns {SuccessType} newValue
 */
export const recover = <E1, A, F extends (...args: any) => any>(errors: {[key: string]: F}) => (input: Result<E1, A>): Result<E1, ReturnType<F>> | Result<E1, A> => {
  switch (input._tag) {
    case 'error':
      const error = input.error as CiznError<any>
      return errors?.[error.name]
        ? Success(errors?.[error.name]?.(input.error))
        : input
    case 'value':
      return input
    default:
      const _exhaustive: never = input
      return _exhaustive
  }
}

/**
 * TAP ADAPTER FUNCTION
 *
 * Executes `fn` with `previousValue`. Any return value is disregarded and
 * `previousValue` is returned.
 *
 * @example
 * pipe(
 *   map(...) // Previous calculation
 *   tap((v) => { console.log(`Working with: ${v}`) })
 *   map(...) // Using result of map above
 * )
 *
 * @param fn Void function to tap into
 * @returns previousValue
 */
export const tap = <E, V>(fn: (a: E | V) => void) => (previousValue: Result<E, V>) => {
  const content = previousValue._tag === 'value'
    ? previousValue.value
    : previousValue.error

  fn(content)

  return previousValue
}

/**
 * TAP ERROR ADAPTER FUNCTION
 *
 * Executes `deadEndFunction` if and only if the input is an error.
 * Any result from the function is disregarded and the `previousValue`
 * is returned.
 *
 * @example
 * pipe(
 *   map(...) // Previous calculation
 *   tapError((e) => { console.log(`Error: ${e.name}`) })
 *   map(...) // Using result of map above
 * )
 *
 * @param tapFn Void function to tap into
 * @returns previousValue
 */
export const tapError = <E, V>(tapFn: (a: E | V) => void) => (previousValue: Result<E, V>) => {
  if (previousValue._tag === 'error') {
    tapFn(previousValue.error)
  }

  return previousValue
}


/**
 * TAP WITH ERROR ADAPTER FUNCTION
 *
 * If `previousValue` is an error, it will execute {@link matchError} and pass
 * it `errors`. {@link matchError} will execute the closure inside `errors` that
 * matches the error type. The result of the closure is disregarded and
 * `previousValue` is returned.
 *
 * @example
 * pipe(
 *   map(...) // Previous calculation
 *   tapWithError({ ENOENT: () => { console.log('File not found') } })
 *   map(...) // Using result of map above
 * )
 *
 * @param errors Mapping between error types and callbacks
 * @returns previousValue
 */
export const tapWithError = <E1, A, F extends (...args: any) => void>(errors: {[key: string]: F}) => (previousValue: Result<E1, A>): Result<E1, A> => {
  if (isFailure(previousValue)) {
    matchError(errors, previousValue)
  }

  return previousValue
}