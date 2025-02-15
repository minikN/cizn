// deno-lint-ignore-file ban-types
import { CiznError, DefaultErrorTypes } from '@lib/errors/index.ts'
import path from 'node:path'

export const def = (x: unknown): x is object => !!x
export const isFn = <T>(x: Function | T): x is Function => typeof x === 'function'
export const isNum = <T>(x: number | T): x is number => typeof x === 'number'
export const isBool = <T>(x: boolean | T): x is boolean => typeof x === 'boolean'
export const isStr = <T>(x: string | T): x is string => def(x) && x.constructor === String
export const isObj = <T>(x: object | T): x is object => def(x) && x.constructor === Object
export const isArr = <T, A>(x: Array<A> | T): x is Array<A> => def(x) && x.constructor === Array

/**
 * Functional composition from left to right
 *
 * @param {...Function} functions
 * @returns {function(*): *}
 */
export const pipe = <T>(...functions: Array<(a: T) => T>) => (data: ReturnType<(a: T) => T>) =>
  functions.reduce(
    (value, func) => func(value),
    data,
  )

/**
 * Asynchronous functional composition from left to right
 *
 * @param  {...Function} functions
 * @returns {function(*): *}
 */
export const pipeAsync = <T>(...functions: Array<(a: T) => T>) => (param: ReturnType<(a: T) => Promise<T>>) =>
  functions.reduce(
    async (result, next) => next(await result),
    param,
  )

/**
 * Helper function to log an incoming error
 * @param {Cizn.Application} app the application
 */
export const logError = (app: Cizn.Application) => <E extends DefaultErrorTypes>(error: CiznError<E>) => {
  app.Manager.Log.Api?.error?.({
    message: error.label,
    options: error.options,
    error,
  })
}

/**
 * Helper function to log an incoming string.
 * @param {Cizn.Application} app the application
 */
export const logString =
  (app: Cizn.Application) => (level: keyof Cizn.Manager.Log.Api, message: string) => (input: string) => {
    app.Manager.Log.Api?.[level]?.({ message, ...input && { options: [input] } })
  }

type PartialTuple<TUPLE extends any[], EXTRACTED extends any[] = []> =
  // If the tuple provided has at least one required value
  TUPLE extends [infer NEXT_PARAM, ...infer REMAINING]
    // recurse back in to this type with one less item
    // in the original tuple, and the latest extracted value
    // added to the extracted list as optional
    ? PartialTuple<REMAINING, [...EXTRACTED, NEXT_PARAM?]>
    // else if there are no more values,
    // return an empty tuple so that too is a valid option
    : [...EXTRACTED, ...TUPLE]

type PartialParameters<FN extends (...args: any[]) => any> = PartialTuple<Parameters<FN>>

type RemainingParameters<PROVIDED extends any[], EXPECTED extends any[]> =
  // if the expected array has any required items…
  EXPECTED extends [infer E1, ...infer EX]
    // if the provided array has at least one required item
    ? PROVIDED extends [infer P1, ...infer PX]
      // if the type is correct, recurse with one item less
      //in each array type
      ? P1 extends E1 ? RemainingParameters<PX, EX>
        // else return this as invalid
      : never
      // else the remaining args is unchanged
    : EXPECTED
    // else there are no more arguments
    : []

type CurriedFunctionOrReturnValue<PROVIDED extends any[], FN extends (...args: any[]) => any> =
  RemainingParameters<PROVIDED, Parameters<FN>> extends [any, ...any[]] ? CurriedFunction<PROVIDED, FN>
    : ReturnType<FN>

export type CurriedFunction<PROVIDED extends any[], FN extends (...args: any[]) => any> = <
  NEW_ARGS extends PartialTuple<RemainingParameters<PROVIDED, Parameters<FN>>>,
>(...args: NEW_ARGS) => CurriedFunctionOrReturnValue<[...PROVIDED, ...NEW_ARGS], FN>

/**
 * Typed currying function.
 *
 * @param targetFn the function to eventually execute
 * @param existingArgs already curried arguments
 * @returns {CurriedFunctionOrReturnValue}
 */
export function curry<
  FN extends (...args: any[]) => any,
  STARTING_ARGS extends PartialParameters<FN>,
>(targetFn: FN, ...existingArgs: STARTING_ARGS): CurriedFunction<STARTING_ARGS, FN> {
  return function (...args) {
    const totalArgs = [...existingArgs, ...args]
    if (totalArgs.length >= targetFn.length) {
      return targetFn(...totalArgs)
    }
    return curry(targetFn, ...totalArgs as PartialParameters<FN>)
  }
}

type TempFileProps = {
  name: string
  hash?: string | null
  ext?: string
}

/**
 * Will parse the name of the file given by {@param filePath}
 * and return it
 *
 * @param {string} filePath the path to get the filename from
 * @returns {string}
 */
export const getFileName = (filePath: string) => path.basename(`${filePath}`).split('.')[0]
