/* @refresh reload */
import "./index.css"
import { render } from "solid-js/web";
import App from "./App";
import { Navigate, Route, Router } from "@solidjs/router";

render(() => {
    return <Router root={App}>
        <Route path="/" component={() => <Navigate href="/tasks" />} />
        <Route path="/tasks" component={() => <div class="text-2xl">Tasks</div>} />
        <Route path="/completed" component={() => <div class="text-2xl">Completed</div>} />
        <Route path="/settings" component={() => <div class="text-2xl">Settings</div>} />
    </Router>
}, document.getElementById("root") as HTMLElement);
