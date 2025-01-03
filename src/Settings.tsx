import { Component, createResource, createSignal, onMount } from "solid-js";
import { open } from '@tauri-apps/plugin-dialog';
import { KVStore, KVStoreKeys } from "./Store";
import { IconInfoCircle } from "@tabler/icons-solidjs";

const SaveToast: Component<{ visible: boolean }> = (props) => {
    return (
        <div class={`transition ease-in-out delay-1000 flex flex-row items-center p-3 text-2xl text-white bg-blue-600 border-[1px] border-gray-400 rounded absolute bottom-3 right-3 ${props.visible ? "" : 'hidden'}`}>
            <IconInfoCircle class="mr-2" />
            Saved Configuration
        </div>
    );
};

const Settings: Component<{}> = () => {

    const [executablePath, setExecutablePath] = createSignal<string>("");
    const [dataDirectory, setDataDirectory] = createSignal<string>("");
    const [showToast, setShowToast] = createSignal<boolean>(false);
    const [init] = createResource(async () => {
        setExecutablePath(await KVStore.getStoreValue(KVStoreKeys.EXECUTABLE_PATH));
        setDataDirectory(await KVStore.getStoreValue(KVStoreKeys.DATA_DIRECTORY));
    });

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
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    }

    return (
        <>
            <div class="w-full max-w-xl">
                <form class="bg-white rounded pb-4 mb-2">

                    <h1 class="text-xl mb-4 font-bold">Notebook Run Configuration</h1>
                    <div class="mb-1">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Python Executable
                        </label>
                        <div class="flex flex-row gap-2">
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="executable-path" type="text" value={executablePath()} />
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
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="data-directory" type="text" value={dataDirectory()} />
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
                <SaveToast visible={showToast()} />
            </div>
        </>
    );
};

export default Settings;