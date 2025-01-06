import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, onMount } from "solid-js";

const Scheduled: Component<{}> = () => {

    const [init] = createResource(async () => {
        const result = await invoke('get_all_scheduled', {});
        console.log(result);
    });

    onMount(() => {
        init();
    });

    return (
        <>
            <h1 class="text-xl mb-4 font-bold">Scheduled</h1>
        </>
    );
};

export default Scheduled;