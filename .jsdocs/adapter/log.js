/**
 * The log adapter
 *
 * @memberof Cizn.Adapter
 * @namespace Log
 * @typedef Log
 *
 * @property {any} PROGRAM
 * @property {number} LEVEL
 * @property {Adapter.Log.Api} API
 */


/**
 * @memberOf Cizn.Adapter.Log
 * @namespace API
 * @typedef Adapter.Log.API
 *
 * @property {function} init inits the log api
 * @property {function} indent globally indents or unindents log messages
 * @property {function} info prints an info message
 * @property {function} warn prints a warning message
 * @property {function} error prints an error message
 * @param {Cizn.Application} app  Platform Web Application
 */