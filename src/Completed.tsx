import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, For, onMount } from "solid-js";

type CompletedJobData = {
    id: string,
    job_id: string,
    output_path: string,
    completed: number,
}


const Completed: Component<{}> = () => {

    const [init] = createResource(async (): Promise<CompletedJobData[]> => {
        const result: CompletedJobData[] = await invoke('get_all_completed', {});
        console.log(result);
        return result;
    });


    return (<>
        <h1>Completed</h1>
        <For each={init()}>
            {(item: CompletedJobData, _) => (
                <p>{item.id}</p>  
                                    
            )}
        </For>
    </>);
};

export default Completed;