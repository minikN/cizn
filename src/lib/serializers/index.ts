import ini from '@lib/serializers/ini.ts'
import json from '@lib/serializers/json.ts'
import toml from '@lib/serializers/toml.ts'
import xml from '@lib/serializers/xml.ts'
import yaml from '@lib/serializers/yaml.ts'
import { Result } from '@lib/composition/result.ts'
import { CiznError } from '@lib/errors/index.ts'

type SerializerProps = {
  existingContent: string | null
  content: object
}

export type Serializer = (
  app: Cizn.Application,
) => (
  a: SerializerProps['existingContent'],
  b: SerializerProps['content'],
) => Promise<
  Result<
    | CiznError<'INVALID_CONTENT_GIVEN'>
    | CiznError<'NO_CONTENT_GIVEN'>
    | CiznError<'SERIALIZE_ERROR'>,
    string
  >
>

export default {
  ini,
  json,
  yaml,
  toml,
  xml,
}
