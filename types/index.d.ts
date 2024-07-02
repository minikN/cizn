declare namespace Cizn {
    /**
     * The main application
     */
    type Application = {
        _name: string;
        STATE: Cizn.Application.State;
        ADAPTER: Cizn.Adapter;
    };
    type Adapter = {
        CLI: Cizn.Adapter.Cli;
        LOG: Cizn.Adapter.Log;
    };
}
declare namespace Adapter {
    namespace Cli {
        type API = {
            /**
             * inits the cli api
             */
            init: Function;
            /**
             * executes the build command
             */
            build: Function;
        };
    }
}
//# sourceMappingURL=index.d.ts.map