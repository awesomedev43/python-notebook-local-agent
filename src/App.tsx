import { listen } from "@tauri-apps/api/event";
import "./App.css";
import Header from "./Header.tsx"
import Navbar from "./Navbar.tsx";
import { createToastComponent, ToastType } from "./Toast.tsx";
import { useLogContext } from "./LogStore.tsx";

function App(props: any) {

    let [showSuccessToast, successToastComponent] = createToastComponent(ToastType.Success);
    const { state, setState } = useLogContext();
    listen<string>('notebook_run_complete', (event) => {
        showSuccessToast(`Notebook execution is complete for ID: ${event.payload}`);
    });

    listen<string>('notebook_log', (event) => {
        console.log(event.payload)
        setState("records", state.records.length, {
            uuid: "",
            date: 0,
            log: event.payload
        });
        console.log(state);
    });

    return (
        <main class="hscreen overflow-auto">
            <div class="flex flex-col h-screen overflow-auto">
                <div class="grow-0">
                    <Header />
                </div>
                <div class="grow overflow-auto">
                    <div class="flex flex-row h-full overflow-auto">
                        <div class="grow-0 shrink-0 w-24 bg-gray-200 border-r-[1px] border-gray-300 border-solid">
                            <Navbar />
                        </div>
                        <div class="grow pl-3 pt-2 bg-white overflow-auto">
                            {props.children}
                        </div>

                    </div>
                </div>
            </div>
            {successToastComponent}
        </main>
    );
}

export default App;
