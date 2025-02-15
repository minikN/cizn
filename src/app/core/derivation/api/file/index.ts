import { DerivationFileApi } from '@cizn/core/derivation/api/index.ts'
import write from '@cizn/core/derivation/api/file/write.ts'
import { Derivation } from '@cizn/core/state.ts'
import iniSerializer from '@lib/serializers/ini.ts'
import jsonSerializer from '@lib/serializers/json.ts'
import tomlSerializer from '@lib/serializers/toml.ts'
import xmlSerializer from '@lib/serializers/xml.ts'
import yamlSerializer from '@lib/serializers/yaml.ts'
import { CiznError } from '@lib/errors/index.ts'
import { Result } from '@lib/composition/result.ts'

export type WriteProps = {
  path: string
  content: string | object
  props: {
    override?: boolean
  }
}

export type WriteState = {
  name: string
  derivation?: Derivation
}

export type WriteType = (
  inputs: Derivation[],
) => (
  a: WriteProps['path'],
  b: WriteProps['content'],
  c: WriteProps['props'],
) => Promise<string>

const derivationFileApi = (app: Cizn.Application): DerivationFileApi =>
  Object.create({}, {
    write: {
      value: write(app),
      enumerable: true,
    },
    writeIni: {
      value: write(app, iniSerializer),
      enumerable: true,
    },
    writeJson: {
      value: write(app, jsonSerializer),
      enumerable: true,
    },
    writeToml: {
      value: write(app, tomlSerializer),
      enumerable: true,
    },
    writeXml: {
      value: write(app, xmlSerializer),
      enumerable: true,
    },
    writeYaml: {
      value: write(app, yamlSerializer),
      enumerable: true,
    },
  })

export default derivationFileApi
