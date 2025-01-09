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
                    <div innerHTML={init()} class="mr-2">{ }</div>
                </Match>
            </Switch>
        </>
    );
};

export default Report;