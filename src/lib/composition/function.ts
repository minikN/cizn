import { _dual } from "@lib/composition/pipe"
import {
  Failure,
  isFailure,
  Result, Success,
  SuccessType,
} from "@lib/composition/result"
import { CiznError } from "@lib/errors"


/**
 * RESULT PATTERN MATCHING
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
  * MAP IF ADAPTER FUNCTION
  *
  * This function is a special version of {@link map}. It takes a `predicate` function
  * and a `nextFunction`. The predicate function is supposed to return a boolean. If the
  * result is `true`, `nextFunction` will be executed with `input` and its output will be
  * returned.
  *
  * The signature of `nextFunction` isn't changed. This means that the type of `input`'s
  * value and the parameter of `nextFunction` need to be of the same type. If
  * `nextFunction` should only be executed if `input`'s value is of a certain type, use
  * {@link mapType}.
  *
  * @param {Function} predicateFn  function to return a boolean
  * @param {Function} nextFunction next function to execute
  * @exports
  */
export const mapIf = <A, E2, B>(
  predicateFn: (a: A) => boolean, nextFunction: (a: A) => Result<E2, B> | Promise<Result<E2, B>>,
) => <E1>(input: Result<E1, A>): Result<E1 | E2, A | B> =>
    input._tag === 'value' && predicateFn(input.value)
      ? map(nextFunction)(input)
      : input

/**
 * MAP TYPE ADAPTER FUNCTION
 *
 * This function is a special version of {@link map}. It takes a `predicate` function
 * and a `nextFunction`. The predicate function is supposed to return a boolean of type
 * `a is P`, like {@link isStr}. If `true` is returned, `nextFunction` will be executed
 * with the given input.
 *
 * Given an `input` of type `string | Derivation`, and a function `doSomething`, which
 * has the signature `(a: string) => Result<FooError, boolean>`, one can execute
 * `doSomething` only if `input` is of type `string` like so:
 *
 * @example
 * const t = pipe(
 *   Success(input) // <Result<never, string | Derivation>>
 *   mapType(isStr, doSomething) // doSomething only accepts strings!
 *   map(x => ...) // x, the return value of the previous call now has the type
 *                 // <Result<FooError, boolean | Derivation>, because it's either
 *                 // <Result<FooError, boolean>> if the predicate returned true or
 *                 // <Derivation> if it didn't
 * )
 *
 * @param {Function} predicateFn  function to return a boolean
 * @param {Function} nextFunction next function to execute
 * @exports
 */
export const mapType = <A, N, E2, B>(
  predicate: (a: A) => boolean, nextFunction: (a: N) => Result<E2, B> | Promise<Result<E2, B>>,
) => <E1>(input: Result<E1, A>): Result<E1 | E2, Exclude<A, N> | B> =>
    input._tag === 'value' && predicate(input.value)
      ? map(nextFunction)(input as unknown as SuccessType<N>)
      : input as Result<E1, Exclude<A, N>>

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
 * TODO: Fix return types
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
      const r = await switchFunction(previousValue)
      if (isFailure(r)) throw r.error

      return r
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
export const recover = <E1, A, F extends (...args: any) => any>(errors: {[key: string]: F}) => (input: Result<E1, A>): Result<E1, A | ReturnType<F>> => {
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

/**
 * Mimic `Array.forEach`, but works with {@link Result} in a pipe.
 *
 * If an iteration returns a {@link Failure}, it'll return that. Otherwise, it'll return
 * `undefined`.
 *
 * @param {Function} fn callback for each iteration
 */
export const forEach = <E2, A, B>(fn: (a: A) => Promise<Result<E2, B>>) => async (previousValue: Array<A>): Promise<
  Result<E2, undefined>
> => {
  for (let i = 0; i < previousValue.length; i++) {
    const el = previousValue[i]
    const r = await fn(el)

    if (r._tag === 'error') {
      return r
    }
  }

  return Success(undefined)
}