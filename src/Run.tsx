import { Component, createSignal, Show } from "solid-js";
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { createToastComponent, ToastType } from "./Toast";
import { listen } from '@tauri-apps/api/event';
import cron from "cron-validate";

const Run: Component<{}> = () => {
    const [nbPath, setNbPath] = createSignal<string>("");
    const [scheduled, setScheduled] = createSignal<boolean>(false);
    let [showSuccessToast, successToastComponent] = createToastComponent(ToastType.Success);
    let [showNoteToast, noteToastComponent] = createToastComponent(ToastType.Note);
    let [showFailureToast, failureToastComponent] = createToastComponent(ToastType.Error);


    listen<string>('notebook_run_complete', (event) => {
        showSuccessToast(`Notebook execution is complete for ID: ${event.payload}`);
    });

    const openNbPathDialog = async (event: any) => {
        event.preventDefault();
        const file = await open({
            multiple: false,
            directory: false,
            filters: [{
                extensions: ['ipynb'],
                name: "ipynb"
            }]
        }) ?? '';

        setNbPath(file);
    };

    const submissionAction = async (event: any) => {
        event.preventDefault();
        if (!event.target.nbPath.value) {
            showFailureToast("No Notebook Specified");
            return;
        }
        if (event.target.scheduledCheck.checked) {
            const cronResult = cron(event.target.cronschedule.value, {
                preset: 'default',
                override: {
                    useSeconds: true
                }
            });
            if (!cronResult.isValid() || cronResult.getValue().seconds === undefined) {
                showFailureToast(`Invalid cron expression: ${event.target.cronschedule.value}`);
                return;
            }

            invoke('schedule_notebook', {
                "runArgs": {
                    "nb_path": event.target.nbPath.value,
                    "cron_string": event.target.cronschedule.value
                }
            }).then((message: any) => {
                showNoteToast(` Scheduled Notebook ${message}`);
            });
        }
        else {
            invoke('run_notebook', { "runArgs": { "nb_path": event.target.nbPath.value } }).then((message: any) => {
                showNoteToast(`Started execution for Notebook with ID: ${message}`);
            });
        }

    };

    return (
        <div class="w-full max-w-xl">
            <form class="bg-white rounded pb-4 mb-2 relative" onSubmit={submissionAction}>
                <h1 class="text-xl mb-4 font-bold">Run Notebook</h1>

                <div class="mb-3">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notebook-path">
                        Run Type
                    </label>
                    <div class="flex flex-row gap-2">
                        <input type="radio" checked={scheduled()} onClick={(_) => setScheduled(true)} id="scheduledCheck" />
                        <label class="text-md">Scheduled</label>
                        <input type="radio" checked={!scheduled()} onClick={(_) => setScheduled(false)} />
                        <label class="text-md">One Off</label>
                    </div>
                </div>

                <div class="mb-1">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notebook-path">
                        Notebook Path
                    </label>
                    <div class="flex flex-row gap-2">
                        <input readOnly={true} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="nbPath" type="text" value={nbPath()} />
                        <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button" onClick={openNbPathDialog}>
                            Browse
                        </button>
                    </div>
                </div>

                <Show when={scheduled()} >
                    <div class="mb-1">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="notebook-path">
                            Cron Schedule
                        </label>
                        <div class="flex flex-row gap-2">
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="cronschedule" type="text" />
                        </div>
                    </div>
                </Show>

                <button class="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    {scheduled() ? "Schedule" : "Run"}
                </button>
            </form>

            {successToastComponent}
            {noteToastComponent}
            {failureToastComponent}

        </div>
    );
};

export default Run;