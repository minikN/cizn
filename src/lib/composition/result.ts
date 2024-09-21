
/**
 * Failure type
 *
 * @typedef
 * @name FailureType
 * @kind variable
 * @param {unknown} E
 */
type FailureType<E> = { readonly _tag: 'error', readonly error: E } // left side of either

/**
 * Success Type
 *
 * @typedef
 * @name SuccessType
 * @kind variable
 * @param {unknown} V
 */
type SuccessType<V> = { readonly _tag: 'value', readonly value: V } // right side of either

/**
 * Result Type
 *
 * @typedef
 * @name Result
 * @kind variable
 * @param {unknown} E
 * @param {unknown} V
 */
export type Result<E, V> = FailureType<E> | SuccessType<V>


/**
 * Failure type instantiator
 *
 * @constant
 * @name _failure
 * @kind variable
 * @type {<E, V = never>(e: E) => Result<E, V>}
 * @private
 */
const _failure = <E, V = never>(e: E): Result<E, V> => ({ _tag: 'error', error: e })

/**
 * Success type instantiator
 *
 * @constant
 * @name _success
 * @kind variable
 * @type {<V, E = never>(v: V) => Result<E, V>}
 * @private
 */
const _success = <V, E = never>(v: V): Result<E, V> => ({ _tag: 'value', value: v })


/**
 * Failure type constructor
 *
 * Used to construct a {@link Result} that holds an error.
 *
 * @example
 * ```
 * const failure = Failure(new Error())
 * ```
 *
 * @constant
 * @name Failure
 * @kind variable
 * @type {<E = never, V = never>(e: E) => Result<E, V>}
 * @exports
 */
export const Failure: <E = never, V = never>(e: E) => Result<E, V> = _failure

/**
 * Success type constructor
 *
 * Used to construct a {@link Result} that holds a value.
 *
 * @example
 * ```
 * const myObj = Success({ foo: 'bar' })
 * ```
 *
 * @constant
 * @name Success
 * @kind variable
 * @type {<E = never, V = never>(v: V) => Result<E, V>}
 * @exports
 */
export const Success: <E = never, V = never>(v: V) => Result<E, V> = _success