import { DerivationFileApi } from '@cizn/core/derivation/api'
import write from '@cizn/core/derivation/api/file/write'
import { Derivation } from '@cizn/core/state'
import iniSerializer from '@lib/serializers/ini'
import jsonSerializer from '@lib/serializers/json'
import tomlSerializer from '@lib/serializers/toml'
import xmlSerializer from '@lib/serializers/xml'
import yamlSerializer from '@lib/serializers/yaml'

type writeProps = {
  path: string,
  content: string | object
  props: {
    override?: boolean
  }
}

export type WriteType = (inputs: Derivation[]) => (a: writeProps['path'], b: writeProps['content'], c: writeProps['props']) => Promise<string>

const derivationFileApi = (app: Cizn.Application): DerivationFileApi => Object.create({}, {
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
