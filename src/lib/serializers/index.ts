import ini from "@lib/serializers/ini.ts"
import json from "@lib/serializers/json.ts"
import toml from "@lib/serializers/toml.ts"
import xml from "@lib/serializers/xml.ts"
import yaml from "@lib/serializers/yaml.ts"

type SerializerProps = {
  existingContent: string | null,
  content: object,
}

export type Serializer = (a: SerializerProps['existingContent'], b: SerializerProps['content']) => Promise<string>

export default {
  ini,
  json,
  yaml,
  toml,
  xml,
}