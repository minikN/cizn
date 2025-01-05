declare namespace Cizn {
  namespace Utils {
    export type Public = {
      file: Cizn.Adapter.File.PublicApi
    }
  }
  namespace Application {
    export type State = import('@cizn/core/state.ts').State

    namespace State {
      export type Derivation = import('@cizn/core/state.ts').Derivation
      export type DerivationData = import('@cizn/core/state.ts').DerivationData
      export type DerivationEnvironment = import('@cizn/core/state.ts').DerivationEnvironment

      export type Generation = import('@cizn/core/state.ts').Generation
      export type Environment = import('@cizn/core/state.ts').Environment

      export type Config = {
        Current: string | undefined
        State: import('@cizn/core/state.ts').Config
      }

      namespace Derivation {
        export type Api = import('@cizn/core/derivation/api/index.ts').Api

        type FileModule = {
          name: string,
          args?: Object,
          module: Module,
        }

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
        export type Api = import('@cizn/core/generation/api/index.ts').Api
      }
    }
  }

    type Application = import('@cizn/index.ts').Application

    namespace Adapter {
      export type File = import('@cizn/adapter/file/index.ts').File
      export type Platform = import('@cizn/adapter/platform/index.ts').Platform
      export type Package = import('@cizn/adapter/package/index.ts').Package
      export type Service = {} // TBI

      namespace Package {
        export type Api = import('@cizn/adapter/package/api/index.ts').Api
      }

      namespace Platform {
        export type Api = import('@cizn/adapter/platform/api/index.ts').Api
      }

      namespace File {
        export type PublicApi = import('@cizn/adapter/file/api/public.ts').Api
        export type InternalApi = import('@cizn/adapter/file/api/internal.ts').Api
      }
    }

    namespace Manager {
      export type FS = import('@lib/managers/fs/index.ts').FS
      export type Cli = import('@lib/managers/cli/index.ts').Cli
      export type Log = import('@lib/managers/log/index.ts').Log
      namespace FS {
        export type Api = import('@lib/managers/fs/api/index.ts').Api
      }
      namespace Cli {
        export type Api = import('@lib/managers/cli/api/index.ts').Api
      }
      namespace Log {
        export type Api = import('@lib/managers/log/api/index.ts').Api
      }
    }

    type Manager = import('@cizn/index.ts').Manager
    type Adapter = import('@cizn/index.ts').Adapter
}