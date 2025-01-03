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
            <h1 class="text-lg mb-2">To get started please add the below configuration: </h1>
            <hr class="my-4" />

            <Settings />

        </>
    );
};

export default Landing;