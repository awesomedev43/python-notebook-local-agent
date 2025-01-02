/* @refresh reload */
import "./index.css"
import { render } from "solid-js/web";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import Landing from "./Landing"
import Settings from "./Settings";

render(() => {
    return <Router root={App}>
        <Route path="/" component={Landing} />
        <Route path="/tasks" component={() => <div class="text-2xl">Tasks</div>} />
        <Route path="/completed" component={() => <div class="text-2xl">Completed</div>} />
        <Route path="/settings" component={Settings} />
        <Route path="/run" component={() => <div class="text-2xl">Run</div>} />
    </Router>
}, document.getElementById("root") as HTMLElement);
