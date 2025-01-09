import { Component, createResource, createSignal, onMount } from "solid-js";
import { open } from '@tauri-apps/plugin-dialog';
import { KVStore, KVStoreKeys } from "./Store";
import { createToastComponent, ToastType } from "./Toast";

const Settings: Component<{}> = () => {

    const [executablePath, setExecutablePath] = createSignal<string>("");
    const [dataDirectory, setDataDirectory] = createSignal<string>("");
    const [init] = createResource(async () => {
        setExecutablePath(await KVStore.getStoreValue(KVStoreKeys.EXECUTABLE_PATH));
        setDataDirectory(await KVStore.getStoreValue(KVStoreKeys.DATA_DIRECTORY));
    });

    let [showNoteToast, noteToastComponent] = createToastComponent(ToastType.Success);


    onMount(() => {
        init();
    });

    const openExecutableDialog = async (event: any) => {
        event.preventDefault();
        const file = await open({
            multiple: false,
            directory: false,
        }) ?? '';

        setExecutablePath(file);
    };

    const openDataDirectoryDialog = async (event: any) => {
        event.preventDefault();
        const directory = await open({
            multiple: false,
            directory: true,
        }) ?? ''
        setDataDirectory(directory);
    };

    const onSave = async (e: any) => {
        e.stopPropagation();
        await KVStore.setStoreValue(KVStoreKeys.EXECUTABLE_PATH, executablePath());
        await KVStore.setStoreValue(KVStoreKeys.DATA_DIRECTORY, dataDirectory());
        await KVStore.configureBackend();

        showNoteToast("Settings Saved");
    }

    return (
        <>
            <div class="w-full max-w-xl">
                <form class="bg-white rounded pb-4 mb-2">

                    <h1 class="text-xl mb-4 font-bold">Notebook Run Configuration</h1>

                    <p class="text-md mb-4">Please use either <code>Anaconda</code> or <code>Miniconda</code> environment as it contains most of the required Jupyter software to run notebooks. In addition to Jupyter packages, please ensure that <code>papermill</code>, <code>nbconvert</code> and any additional packages required to run your own notebook.</p>

                    <div class="mb-1">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Python Executable
                        </label>
                        <div class="flex flex-row gap-2">
                            <input readOnly={true} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="executable-path" type="text" value={executablePath()} />
                            <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button" onClick={openExecutableDialog}>
                                Browse
                            </button>
                        </div>
                    </div>
                    <div class="mb-1">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Data Directory
                        </label>
                        <div class="flex flex-row gap-2">
                            <input readOnly={true} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="data-directory" type="text" value={dataDirectory()} />
                            <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button" onClick={openDataDirectoryDialog}>
                                Browse
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={onSave}>
                            Save
                        </button>
                    </div>
                </form>
                {noteToastComponent}
            </div>
        </>
    );
};

export default Settings;