import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, For } from "solid-js";

type ScheduledData = {
    id: string,
    job_id: string,
    nb_path: string,
    cron_schedule: string,
}

const Scheduled: Component<{}> = () => {
    let myCancelItems = new Set<string>();

    const [init] = createResource(async (): Promise<ScheduledData[]> => {
        const result: ScheduledData[] = await invoke('get_all_scheduled', {});
        return result;
    });

    const onCancel = (_: any) => {
        alert(`cancelling ${Array.from(myCancelItems)}`);
    }

    return (
        <div class="flex flex-col mr-4">
            <table class="table-fixed w-full pl-4 mb-4">
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
                                }} /></td>
                                <td>{item.nb_path}</td>
                                <td>{item.cron_schedule}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
            <button class="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-32 self-end" onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
};

export default Scheduled;