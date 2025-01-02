import { Component, createResource, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { checkStoreValue } from "./Store";

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
            <hr class="my-3" />


            <div class="w-full max-w-xl">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Python Executable
                        </label>
                        <div class="flex flex-row gap-2">
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="executable-path" type="text" />
                            <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button">
                                Browse
                            </button>
                        </div>
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Report Directory
                        </label>
                        <div class="flex flex-row gap-2">
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="report-directory" type="text" />
                            <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button">
                                Browse
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Save
                        </button>
                    </div>
                </form>
            </div>

        </>
    );
};

export default Landing;