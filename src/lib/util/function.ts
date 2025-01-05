import * as mod from 'node:inspector/promises';

declare global {
    type Buffer = typeof import("node:buffer").Buffer;
}

const PREFIX = '__functionLocation__'

const post = async (session, cmd, args) => await new Promise((resolve) => {
  session.post(cmd, args, (err, res) => {resolve(err || res)})
})

export const locate = async (fn: (...args: any) => any) => {

    try {
    const session = new mod.Session()
    session.connect()
    const i = 1

    } catch (e) {
      console.error(e)
    }
}


  // try {
  //   globalThis[PREFIX] = {}
  //   globalThis[PREFIX].fn = fn

  //   const scripts = {}
  //   const session = new Session()
  //   // const post = promisify(session.post).bind(session)
  //   session.connect()
  //   session.on('Debugger.scriptParsed', (res) => { scripts[res.params.scriptId] = res.params })
  //   await post(session, 'Debugger.enable', null)

  //   const evaled = await post(session, 'Runtime.evaluate', {
  //     expression: `globalThis['${PREFIX}']['fn']`,
  //     objectGroup: PREFIX,
  //   })
  //   const props = await post(session, 'Runtime.getProperties', { objectId: evaled.result.objectId })
  //   const location = props.internalProperties.find(prop => prop.name === '[[FunctionLocation]]')
  //   const script = scripts[location.value.value.scriptId]

  //   console.log('s', script.url)

  //   return script.url

  // //   const props = session.post('Runtime.getProperties', { objectId: evaledFn.result.objectId })
  // } catch (e) {
  //   console.error('e', e)
  // }