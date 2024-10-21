import ini from "@lib/serializers/ini"
import json from "@lib/serializers/json"
import toml from "@lib/serializers/toml"
import xml from "@lib/serializers/xml"
import yaml from "@lib/serializers/yaml"

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