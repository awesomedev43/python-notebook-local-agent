import { useParams } from "@solidjs/router";
import { Component, createResource, Match, Show, Switch } from "solid-js";
import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const Report: Component<{}> = () => {
    const params = useParams();

    const [init] = createResource(async () => {
        const htmlfile = await readTextFile(`${params.id}.html`, {
            baseDir: BaseDirectory.AppLocalData,
        });
        return htmlfile;
    })

    return (
        <>
            <Show when={init.loading}>
                <h1 class="text-lg">Loading...</h1>
            </Show>

            <Switch>
                <Match when={init()}>
                    <iframe srcdoc={init()} class="mr-2 w-full h-full pb-30 overflow-hidden">{ }</iframe>
                </Match>
            </Switch>
        </>
    );
};

export default Report;