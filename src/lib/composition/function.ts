/**
 * TEE ADAPTER FUNCTION
 *
 * Converts a dead-end function, meaning a function that returns {@code void}
 * into usable "track-segment" by executing the void function with the output
 * of the previous function and then returns that output to the next function
 *
 * @param deadEndFunction
 * @returns
 */
export const tee = <T>(deadEndFunction: (a: T) => void) => (previousValue: T) => {
  deadEndFunction(previousValue)

  return previousValue
}