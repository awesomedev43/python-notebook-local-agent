/* @refresh reload */
import "./index.css"
import { render } from "solid-js/web";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Landing from "./Landing"
import Settings from "./Settings";
import Run from "./Run";

render(() => {
    return <Router root={App}>
        <Route path="/" component={Landing} />
        <Route path="/scheduled" component={() => <div class="text-2xl">Scheduled</div>} />
        <Route path="/completed" component={() => <div class="text-2xl">Completed</div>} />
        <Route path="/settings" component={Settings} />
        <Route path="/run" component={Run} />
    </Router>
}, document.getElementById("root") as HTMLElement);
