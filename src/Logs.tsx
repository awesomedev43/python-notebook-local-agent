import { Component, For } from "solid-js";
import { useLogContext } from "./LogStore";

const Logs: Component<{ logData: string }> = (props) => {
    const { state } = useLogContext();
    return (
        <div class="h-full mr-2">
            <p>{`${JSON.stringify(state.records)}`}</p>
            <h1 class="text-2xl font-bold mb-2">Logging</h1>
            <For each={props.logData.split("Starting").slice(1).reverse()} fallback={<div>Loading...</div>}>
                {(block: string) => {
                    const fixedBlock = "Starting" + block;
                    return (
                        <>
                            <div class="w-full p-3 shadow-lg shadow-gray-400 font-mono text-white bg-gray-500 mb-4">
                                <For each={fixedBlock.split("\n")} fallback={<div>Loading...</div>}>
                                    {(item) => <p>{item}</p>}
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
