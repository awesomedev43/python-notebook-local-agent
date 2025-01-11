import { Component, createResource, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { KVStore, KVStoreKeys } from "./Store";
import Settings from "./Settings";

const Landing: Component<{}> = () => {

    const [isConfigured] = createResource(async () => {
        const isSet: boolean = (await KVStore.isStoreValueSet(KVStoreKeys.EXECUTABLE_PATH))
            && (await KVStore.isStoreValueSet(KVStoreKeys.DATA_DIRECTORY));

        if (isSet) {
            await KVStore.configureBackend();
        }

        return isSet;
    });

    return (
        <>
            <Show when={isConfigured() ?? false}>
                <Navigate href="/run" />
            </Show>

            <h1 class="text-2xl mb-2">Welcome to Python Notebook Runner</h1>
            <h1 class="text-lg mb-2">To get started:</h1>
            <ol class="list-decimal ml-4">
                <li>Install a Jupyter python environment. Anaconda or Miniconda is recommended</li>
                <li>Install <code>papermill</code> and <code>nbconvert</code> package through <code>pip install</code></li>
                <li>Install any additional packages that might be used by your own notebook</li>
                <li>Configure the <b>Python Executable</b></li>
                <li>Set the <b>Data Directory</b></li>
                <li>Click <b>Save</b></li>
                <li>Click on <b>Run</b> tab to begin executing your notebook </li>
            </ol>
            <hr class="my-4" />

            <Settings />

        </>
    );
};

export default Landing;