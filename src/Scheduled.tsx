import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, createSignal, For, Index, onMount } from "solid-js";

type ScheduledData = {
    id: string,
    job_id: string,
    nb_path: string,
    cron_schedule: string,
}

const Scheduled: Component<{}> = () => {
    const [cancelItems, setCancelItems] = createSignal<Set<string>>(new Set<string>());
    let myCancelItems = new Set<string>();

    const [init] = createResource(async (): Promise<ScheduledData[]> => {
        const result: ScheduledData[] = await invoke('get_all_scheduled', {});
        return result;
    });

    return (
        <>
            <table class="table-auto w-11/12 pl-4">
                <thead>
                    <tr class="bg-gray-200 text-black p-3 text-xl">
                        <th></th>
                        <th>Notebook</th>
                        <th>Cron Schedule</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={init()}>
                        {(item, _) => (
                            <tr class="text-center border p-3 text-md">
                                <td><input type="checkbox" id={item.job_id} onClick={(e) => {
                                    if (e.currentTarget.checked) {
                                        myCancelItems.add(e.currentTarget.id);
                                    }
                                    else {
                                        myCancelItems.delete(e.currentTarget.id);
                                    }
                                    console.log(myCancelItems);
                                    
                                    setCancelItems((prev: Set<string>) => {
                                        let newSet = new Set<string>(prev); 
                                        if (e.currentTarget.checked) {
                                            newSet.add(e.currentTarget.id);
                                        }
                                        else {
                                            newSet.delete(e.currentTarget.id);
                                        }
                                        return newSet;
                                    });
                                }} /></td>
                                <td>{item.nb_path}</td>
                                <td>{item.cron_schedule}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
            <h1>Items</h1>
            <>
                <For each={[...cancelItems().values()]}>
                    {(item, _) =>
                        <p>{item}</p>
                    }
                </For>
            </>
        </>
    );
};

export default Scheduled;