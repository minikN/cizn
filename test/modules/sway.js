/**
 * TODO:
 *   const script = utils.file.writeScript('./myscript.sh', `\
 *   ${await utils.pkg.echo} "Hello world"
 *   `)
 */

// Test overwriting ability
export default args => async (config, utils) => {
  await utils.file.write('.config/test', `\
hello
world1 2 
`)

  await utils.file.write('.config/test', `\
and foo
`, { override: true })

  await utils.file.write('.config/test2', `\
hello6
world1 2 
`)

  return {
    config: { err: 'hello1' },
    homePackages: [
      'sway',
    ],
    systemPackages: [
      'chromium',
    ],
    args,
  }
}