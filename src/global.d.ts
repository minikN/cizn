declare namespace Cizn {
  namespace Utils {
    export type Public = {
      file: Cizn.Adapter.File.PublicApi
    }
  }
  namespace Application {
    export type State = import('@cizn/core/state').State

    namespace State {
      export type Derivation = import('@cizn/core/state').Derivation
      export type Generation = import('@cizn/core/state').Generation
      export type Environment = import('@cizn/core/state').Environment

      export type Config = {
        Current: string | undefined
        State: import('@cizn/core/state').Config
      }

      namespace Derivation {
        export type Api = import('@cizn/core/derivation/api').Api

        type Module = (() => void) | ((
          config: object,
          utils: Cizn.Utils.Public
        ) => ModuleOptions)

        type ModuleOptions = {
          modules: Module[],
          homePackages: string[],
          systemPackages: string[],
          config: object,
          args: object
        }
      }

      namespace Generation {
        export type Api = import('@cizn/core/generation/api').Api
      }
    }
  }

    type Application = import('@cizn/index').Application

    namespace Adapter {
      export type File = import('@cizn/adapter/file').File
      export type Platform = import('@cizn/adapter/platform').Platform
      export type Package = import('@cizn/adapter/package').Package
      export type Service = {} // TBI

      namespace Package {
        export type Api = import('@cizn/adapter/package/api').Api
      }

      namespace Platform {
        export type Api = import('@cizn/adapter/platform/api').Api
      }

      namespace File {
        export type PublicApi = import('@cizn/adapter/file/api/public').Api
        export type InternalApi = import('@cizn/adapter/file/api/internal').Api
      }
    }

    namespace Manager {
      export type FS = import('@lib/managers/fs').FS
      export type Cli = import('@lib/managers/cli').Cli
      export type Log = import('@lib/managers/log').Log
      namespace FS {
        export type Api = import('@lib/managers/fs/api/index').Api
      }
      namespace Cli {
        export type Api = import('@lib/managers/cli/api').Api
      }
      namespace Log {
        export type Api = import('@lib/managers/log/api').Api
      }
    }

    type Manager = import('@cizn/index').Manager
    type Adapter = import('@cizn/index').Adapter
}