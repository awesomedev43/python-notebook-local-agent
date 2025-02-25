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
import { LogStoreProvider } from "./LogStore";

render(() => {

    return (
        <LogStoreProvider>
            <Router root={App}>
                <Route path="/" component={Landing} />
                <Route path="/scheduled" component={Scheduled} />
                <Route path="/completed" component={Completed} />
                <Route path="/completed/:id" component={Report} />
                <Route path="/settings" component={Settings} />
                <Route path="/run" component={Run} />
                <Route path="/logging" component={Logs} />
            </Router>
        </LogStoreProvider>
    )
}, document.getElementById("root") as HTMLElement);
