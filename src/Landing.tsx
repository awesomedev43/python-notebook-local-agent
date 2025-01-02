import { Component, createResource, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { checkStoreValue } from "./Store";

const Landing: Component<{}> = () => {

    const [isStoreValueSet] = createResource(async () => {
        const isSet = await checkStoreValue('executable-path')
            && checkStoreValue('run-directory');
        return isSet;
    });

    return (
        <>
            <Show when={isStoreValueSet() ?? false}>
                <Navigate href="/run" />
            </Show>

            <h1 class="text-2xl mb-2">Welcome to Python Notebook Runner</h1>
            <h1 class="text-lg mb-2">To get started please enter the below configuration: </h1>
            <hr />

            <form>
                <div class="grid grid-cols-2 gap-4">
                    <label>Python Executable Path</label>
                    <input type={"text"} />
                </div>
            </form>

        </>
    );
};

export default Landing;