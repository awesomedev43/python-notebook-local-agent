
/**
 * Log Store contains mapping of UUID -> Log
 */

import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";


export type LogRecord = {
    uuid: string | undefined,
    date: number | undefined,
    log: string
};

export type LogStoreState = {
    logmap: Map<string, Array<LogRecord>>
}

const LogStoreContext = createContext();

export function LogStoreProvider(props: any) {
    const [state, setState] = createStore<LogStoreState>({ logmap: new Map() });


    return (
        <LogStoreContext.Provider value={{ state, setState }}>
            {props.children}
        </LogStoreContext.Provider>
    );
}

export function useLogContext(): any {
    return useContext(LogStoreContext);
};
