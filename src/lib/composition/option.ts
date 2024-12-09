/**
 * None type
 *
 * @typedef
 * @name NoneType
 */
type NoneType = { readonly _tag: 'none' } // left side of either

/**
 * Some Type
 *
 * @typedef
 * @name SomeType
 * @param {V} value
 */
export type SomeType<V> = { readonly _tag: 'some', readonly value: V } // right side of either

/**
 * Option Type
 *
 * @typedef
 * @name Option
 * @param {V} value
 */
export type Option<V> = NoneType | SomeType<V>


/**
 * None type instantiator
 *
 * @constant
 * @name None
 */
export const None: Option<never> = { _tag: 'none' }

/**
 * Some type instantiator
 *
 * @name Some
 */
export const Some = <A>(o: A): Option<A> => ({ _tag: 'some', value: o })

/**
 * Return an option based on the truthiness of `a`.
 *
 * @param {unknown} a incoming value
 * @returns
 */
export const BoolOption = (a: unknown) => a ? Some(a) : None

/**
 * isNone predicate

 * @param {Option<unknown>} o incoming option
 * @returns boolean
 */
export const isNone = (o: Option<unknown>): boolean => o._tag === 'none'

export const ifNone = <A>(nextFunction: () => Option<A>) => (o: Option<unknown>) => isNone(o)
  ? nextFunction()
  : o

/**
 * isSome predicate
 *
 * @param {Option<A>} o incoming option
 * @returns boolean
 */
export const isSome = <A>(o: Option<A>): boolean => o._tag === 'some'

