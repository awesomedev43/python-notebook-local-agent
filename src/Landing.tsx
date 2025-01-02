import { Component, createResource, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { checkStoreValue } from "./Store";
import Settings from "./Settings";

const Landing: Component<{}> = () => {

    const [isStoreValueSet] = createResource(async () => {
        const isSet = await checkStoreValue('executable-path')
            && checkStoreValue('report-directory');
        return isSet;
    });

    return (
        <>
            <Show when={isStoreValueSet() ?? false}>
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