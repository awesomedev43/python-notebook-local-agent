import { Component } from "solid-js";

const Run: Component<{}> = () => {

    return (
        <div class="w-full max-w-xl">
            <form class="bg-white rounded pb-4 mb-2 relative">
                <h1 class="text-xl mb-4 font-bold">Run Notebook</h1>
                <div class="mb-1">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="notebook-path">
                        Notebook Path
                    </label>
                    <div class="flex flex-row gap-2">
                        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="executable-path" type="text" value={""} />
                        <button class="bg-blue-500 hover:bg-blue-700 text-white py-0 h-9 px-3 rounded focus:outline-none focus:shadow-outline" type="button" onClick={() => { }}>
                            Browse
                        </button>
                    </div>
                </div>

                <button class="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={() => { }}>
                    Run
                </button>
            </form>

        </div>
    );
};

export default Run;