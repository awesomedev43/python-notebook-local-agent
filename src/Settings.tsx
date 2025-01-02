import { Component } from "solid-js";

const Settings: Component<{}> = () => {

    return (
        <>
            <div class="w-full max-w-xl">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-4 mb-2">

                    <h1 class="text-xl mb-4 font-bold">Notebook Run Configuration</h1>
                    <div class="mb-1">
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
                    <div class="mb-1">
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

export default Settings;