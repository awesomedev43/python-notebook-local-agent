import { Component, For } from "solid-js";
import { useLogContext } from "./LogStore";

const Logs: Component<{}> = () => {
    const { state } = useLogContext();
    return (
        <div class="h-full mr-2">
            <h1 class="text-2xl font-bold mb-4">Logs</h1>
            <For each={[...state.logmap.keys()].reverse()} fallback={<div></div>}>
                {(uuid: string) => {
                    return (
                        <>
                            <h2 class="text-xl font-semibold mb-2">{uuid}</h2>
                            <div class="w-full p-3 shadow-lg shadow-gray-400 font-mono text-white bg-gray-800 mb-4">
                                <For each={state.logmap.get(uuid)} fallback={<div></div>}>
                                    {(item) => <p>{item.log}</p>}
                                </For>
                            </div>
                        </>
                    );
                }}
            </For>
        </div>
    );
}

export default Logs;
