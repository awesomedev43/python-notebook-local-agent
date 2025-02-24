/* @refresh reload */
import "./index.css"
import { render } from "solid-js/web";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Landing from "./Landing"
import Settings from "./Settings";
import Run from "./Run";
import Scheduled from "./Scheduled";
import Completed from "./Completed";
import Report from "./Report";
import Logs from "./Logs";
import { listen } from "@tauri-apps/api/event";
import { createSignal } from "solid-js";
import { LogStoreProvider } from "./LogStore";

render(() => {

    const [logData, setLogData] = createSignal<string>("");
    listen<string>('notebook_log', (event) => {
        console.log(event.payload)
        setLogData((data) => data + event.payload + "\n")
    });

    return (
        <LogStoreProvider>
            <Router root={App}>
                <Route path="/" component={Landing} />
                <Route path="/scheduled" component={Scheduled} />
                <Route path="/completed" component={Completed} />
                <Route path="/completed/:id" component={Report} />
                <Route path="/settings" component={Settings} />
                <Route path="/run" component={Run} />
                <Route path="/logging" component={() => { return (<Logs logData={logData()} />) }} />
            </Router>
        </LogStoreProvider>
    )
}, document.getElementById("root") as HTMLElement);
