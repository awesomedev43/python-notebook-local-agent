import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, For } from "solid-js";
import cronstrue from 'cronstrue';

type ScheduledData = {
    id: string,
    job_id: string,
    nb_path: string,
    cron_schedule: string,
}

type CancelScheduledData = {
    id: string,
    job_id: string,
}

const Scheduled: Component<{}> = () => {
    let myCancelItems = new Set<CancelScheduledData>();

    const [init, { refetch }] = createResource(async (): Promise<ScheduledData[]> => {
        const result: ScheduledData[] = await invoke('get_all_scheduled', {});
        return result;
    });

    const onCancel = (_: any) => {
        if (myCancelItems.size == 0) {
            return;
        }
        invoke("cancel_scheduled_job", {
            'cancelArgs':
                Array.from(myCancelItems)
        }).then(() => {
            refetch();
        });
    }

    return (
        <div class="flex flex-col mr-4">
            <table class="table-auto w-full pl-4 mb-4">
                <thead>
                    <tr class="bg-gray-200 text-black text-xl">
                        <th class="py-1"></th>
                        <th class="py-1">Notebook</th>
                        <th class="py-1">Cron Schedule</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={init()}>
                        {(item, _) => (
                            <tr class="text-center border p-3 text-md">
                                <td class="py-1"><input type="checkbox" id={item.job_id} onClick={(e) => {
                                    if (e.currentTarget.checked) {
                                        myCancelItems.add({
                                            "id": item.id,
                                            "job_id": item.job_id,
                                        });
                                    }
                                    else {
                                        myCancelItems.delete({
                                            "id": item.id,
                                            "job_id": item.job_id,
                                        });
                                    }
                                }} /></td>
                                <td class="py-1">{item.nb_path}</td>
                                <td class="py-1">{cronstrue.toString(item.cron_schedule)}</td>
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