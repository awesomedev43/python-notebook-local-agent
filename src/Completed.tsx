import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, For } from "solid-js";
import { IconExternalLink, IconReport, IconX } from '@tabler/icons-solidjs';
import { listen } from "@tauri-apps/api/event";
import { A } from "@solidjs/router";
import { createToastComponent, ToastType } from "./Toast";

type CompletedJobData = {
    id: string,
    job_id: string,
    output_path: string,
    nb_path: string,
    completed: number,
}

const Completed: Component<{}> = () => {

    let [showNoteToast, noteToastComponent] = createToastComponent(ToastType.Note);

    const [init, { refetch }] = createResource(async (): Promise<CompletedJobData[]> => {
        const result: CompletedJobData[] = await invoke('get_all_completed', {});
        return result.reverse();
    });

    listen<string>('notebook_run_complete', (_event: any) => {
        refetch();
    });

    const convertToDateString = (timestamp: number): string => {
        let d = new Date(timestamp * 1000);
        return d.toLocaleString()
    };

    const openFileExplorer = async (path: string) => {
        invoke('show_output_directory', { "dir": path }).then(() => { })
    };

    const removeCompletedEntry = async (id: string) => {
        invoke('remove_completed_entry', { "id": id }).then(() => {
            showNoteToast(`Removed completed entry ${id}`);
            refetch();
        })
    };

    return (
        <div class="flex flex-col mr-4">
            <table class="table-auto w-full pl-4 mb-4">
                <thead>
                    <tr class="bg-gray-200 text-black text-xl">
                        <th class="py-1 pl-2">Remove</th>
                        <th class="py-1">Notebook</th>
                        <th class="py-1">Output Path</th>
                        <th class="py-1">Report</th>
                        <th class="py-1">Completed</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={init()}>
                        {(item, _) => (
                            <tr class="text-center border p-3 text-md">
                                <td class="py-1"><button onClick={() => { removeCompletedEntry(item.id) }} class="border-solid border-2 border-black rounded shadow-sm shadow-gray-400 hover:bg-red-500 hover:text-white" >
                                    <IconX size={17} />
                                </button>
                                </td>
                                <td class="py-1">{item.nb_path}</td>
                                <td class="py-1">
                                    <button onClick={() => { openFileExplorer(item.output_path) }} class="mr-2">
                                        <IconExternalLink />
                                    </button>
                                </td>
                                <td class="py-1">
                                    <A href={`/completed/${item.id}`} class="inline-block">
                                        <IconReport />
                                    </A>
                                </td>
                                <td class="py-1">{convertToDateString(item.completed)}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
            {noteToastComponent}
        </div>

    );
};

export default Completed;