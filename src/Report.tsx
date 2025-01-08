import { useParams } from "@solidjs/router";
import { Component, createResource } from "solid-js";
import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const Report: Component<{}> = () => {
    const params = useParams();

    const [init] = createResource(async () => {
        const htmlfile = await readTextFile(`${params.id}.html`, {
            baseDir: BaseDirectory.AppLocalData,
        });
        return htmlfile;
    })

    return <div innerHTML={init()} class="mr-2">{ }</div>;
};

export default Report;