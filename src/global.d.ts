declare namespace Cizn {
  namespace Application {
    export type State = import('@cizn/core/state').State

    namespace State {
      export type Derivation = import('@cizn/core/state').Derivation
      export type Generation = import('@cizn/core/state').Generation

      namespace Derivation {
        export type Api = import('@cizn/core/derivation/api').Api

        type Module = (config: Cizn.Application.State['config']) => ModuleOptions
        type ModuleOptions = {
          modules: Module[],
          packages: string[],
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
      export type Cli = import('@cizn/adapter/cli').Cli
      export type Log = import('@cizn/adapter/log').Log

      namespace Cli {
        export type Api = import('@cizn/adapter/cli/api').Api
      }
      namespace Log {
        export type Api = import('@cizn/adapter/log/api').Api
      }
    }

    type Adapter = import('@cizn/index').Adapter
}