import crypto from 'crypto'
import { tmpdir } from 'os'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'path'
import G from '@cizn/global'

/**
 * Functional composition
 *
 * @param {...Function} functions
 * @returns {function(*): *}
 */
export const pipe = <T>(...functions: Array<(a: T) => T>) => (data: ReturnType<(a: T) => T>) => functions.reduce(
  (value, func) => func(value),
  data,
)

/**
 * Asynchronous functional composition
 *
 * @param  {...Function} functions
 * @returns {function(*): *}
 */
export const composeAsync = (...functions: Function[]) => (param: any) => functions.reduce(
  async (result, next) => next(await result),
  param,
)

type PartialTuple<TUPLE extends any[],EXTRACTED extends any[] = []> =
  // If the tuple provided has at least one required value
  TUPLE extends [infer NEXT_PARAM, ...infer REMAINING]
    // recurse back in to this type with one less item 
    // in the original tuple, and the latest extracted value
    // added to the extracted list as optional
    ? PartialTuple<REMAINING, [...EXTRACTED, NEXT_PARAM?]>
    // else if there are no more values, 
    // return an empty tuple so that too is a valid option
    : [...EXTRACTED, ...TUPLE]

type PartialParameters<FN extends (...args: any[]) => any> =
  PartialTuple<Parameters<FN>>;

type RemainingParameters<PROVIDED extends any[], EXPECTED extends any[]> =
  // if the expected array has any required items…
  EXPECTED extends [infer E1, ...infer EX]
    // if the provided array has at least one required item
  ? PROVIDED extends [infer P1, ...infer PX]
      // if the type is correct, recurse with one item less
      //in each array type
    ? P1 extends E1
      ? RemainingParameters<PX, EX>
          // else return this as invalid
      : never
    // else the remaining args is unchanged
    : EXPECTED
  // else there are no more arguments
  : []


type CurriedFunctionOrReturnValue<PROVIDED extends any[], FN extends (...args: any[]) => any> =
  RemainingParameters<PROVIDED, Parameters<FN>> extends [any, ...any[]]
    ? CurriedFunction<PROVIDED, FN>
    : ReturnType<FN>

type CurriedFunction<PROVIDED extends any[], FN extends (...args: any[]) => any> =
<NEW_ARGS extends PartialTuple<RemainingParameters<PROVIDED, Parameters<FN>>>>(...args: NEW_ARGS) =>
    CurriedFunctionOrReturnValue<[...PROVIDED, ...NEW_ARGS], FN>

/**
 * Typed currying function.
 * 
 * @param targetFn the function to eventually execute
 * @param existingArgs already curried arguments
 * @returns {CurriedFunctionOrReturnValue}
 */
export function curry<
  FN extends (...args: any[]) => any,
  STARTING_ARGS extends PartialParameters<FN>
>(targetFn: FN, ...existingArgs: STARTING_ARGS):
  CurriedFunction<STARTING_ARGS, FN>
{
  return function(...args) {
    const totalArgs = [...existingArgs, ...args]
    if(totalArgs.length >= targetFn.length) {
      return targetFn(...totalArgs)
    }
    return curry(targetFn, ...totalArgs as PartialParameters<FN>)
  }
}

type TempFileProps = {
  name: string,
  hash?: string | null,
  ext?: string,
}

/**
 * Will attempt to create a temporary file with the {@param props.name},
 * {@param props.hash} and {@param props.ext} given. If the hash is not
 * present, it will create one.
 *
 * Will return the path to the temporary file.
 *
 * @param {Object} props            props
 * @param {string} props.name       the name to use
 * @param {string} [props.hash]     the hash to use
 * @param {string} [props.ext='js'] the extension to use
 * @returns {string}
 */
export const mkTempFile = async ({ name, hash = null, ext = G.EXT }: TempFileProps) => {
  const tempDir = path.join(tmpdir(), 'cizn')
  await mkdir(tempDir, { recursive: true })

  const tempFile = path.join(tempDir, `${name}-${hash || crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext ? `.${ext}` : ''}`)

  await writeFile(tempFile, '')

  return tempFile
}

/**
 * Will parse the name of the file given by {@param filePath}
 * and return it
 *
 * @param {string} filePath the path to get the filename from
 * @returns {string}
 */
export const getFileName = (filePath: string) => path.basename(`${filePath}`).split('.')[0]
