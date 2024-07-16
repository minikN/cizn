/**
 * Checks whether {@param object} doesn't have any property of its own.
 *
 * @param {Object} object  the object to check
 * @returns {boolean}   {@code true} if {@param object} doesn't have any property of its own
 */
export const empty = (object: Object) => {
  for (const property in object) {
    if (object.hasOwnProperty(property)) {
      return false
    }
  }
  return true
}