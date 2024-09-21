import { _dual } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"


/**
S * PATTERN MATCHING
 * 
 * Matches the result of the last function in the chain and returns the output immediately
 * in case it is an error or passes it on to the next function and returns that output
 * 
 * @param {(a: A): Result<E2, B>} nextFunction Next function in the pipe
 * @param {Result<E1, A>} input                 Output from the last function in the pipe
 * @returns {Result<E2, B> | E1}
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

 * @param {Function} singleFunction
 *
 * @constant
 * @name bind
 * @kind variable
 * @type {<E1, A, B>(singleFunction: (a: A) => B) => (previousValue: Result<E1, A>) => Result<E1, B>}
 * @exports
 */
export const bind = <E1, A, B>(singleFunction: (a: A) => B) => (previousValue: Result<E1, A>): Result<E1, B> => match(
  value => Success(singleFunction(value)),
  previousValue,
)

/**
 * GUARD ADAPTER FUNCTION
 *
 * Wraps the {@param switchFunction} in a try/catch block and if an error is
 * thrown, it will wrap it in a {@link Failure} and return it. Otherwise it
 * will return the result of the function.
 *
 * @param {Function} switchFunction Function to wrap
 * @param {Object} [errors] Mapping between error types and thrown errors
 * @returns
 */
const guard = <L, R, T extends Error>(
  switchFunction: (a: R) => Result<L, R> | Promise<Result<L, R>>,
  errors?: {[key: string]: T},
) => async (previousValue: R) => {
    try {
      return await switchFunction(previousValue)
    } catch (e: any) {
      return Failure(errors?.[e.code] || e as L)
    }
  }

/**
 * TAP ADAPTER FUNCTION
 *
 * Executes a `deadEndFunction`, meaning a function that returns `void`
 * and returns the outpur of the previous function to the next function
 *
 * @param {(a: T) => void} deadEndFunction
 * @returns {T} previousValue
 */
export const tap = <T>(deadEndFunction: (a: T) => void) => (previousValue: T) => {
  deadEndFunction(previousValue)

  return previousValue
}