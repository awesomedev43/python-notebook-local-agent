import { invoke } from "@tauri-apps/api/core";
import { Component, createResource, For } from "solid-js";
import { IconExternalLink } from '@tabler/icons-solidjs';


type CompletedJobData = {
    id: string,
    job_id: string,
    output_path: string,
    nb_path: string,
    completed: number,
}

const Completed: Component<{}> = () => {

    const [init] = createResource(async (): Promise<CompletedJobData[]> => {
        const result: CompletedJobData[] = await invoke('get_all_completed', {});
        return result.reverse();
    });

    const convertToDateString = (timestamp: number): string => {
        let d = new Date(timestamp * 1000);
        return d.toLocaleString()
    };

    const openFileExplorer = async (path: string) => {
        console.log(path);
        invoke('show_output_directory', { "dir": path }).then(() => { })
    };

    return (
        <div class="flex flex-col mr-4">
            <table class="table-auto w-full pl-4 mb-4">
                <thead>
                    <tr class="bg-gray-200 text-black text-xl">
                        <th class="py-1">Notebook</th>
                        <th class="py-1">Output Path</th>
                        <th class="py-1">Completed</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={init()}>
                        {(item, _) => (
                            <tr class="text-center border p-3 text-md">
                                <td class="py-1">{item.nb_path}</td>
                                <td class="py-1">{item.output_path}
                                    <button onClick={() => { openFileExplorer(item.output_path)}} class="mr-2">
                                        <IconExternalLink />
                                    </button>
                                </td>
                                <td class="py-1">{convertToDateString(item.completed)}</td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>

    );
};

export default Completed;