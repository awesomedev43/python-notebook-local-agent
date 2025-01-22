import { listen } from "@tauri-apps/api/event";
import "./App.css";
import Header from "./Header.tsx"
import Navbar from "./Navbar.tsx";
import { createToastComponent, ToastType } from "./Toast.tsx";

function App(props: any) {

  let [showSuccessToast, successToastComponent] = createToastComponent(ToastType.Success);
  listen<string>('notebook_run_complete', (event) => {
    showSuccessToast(`Notebook execution is complete for ID: ${event.payload}`);
  });

  return (
    <main class="h-screen">
      <div class="flex flex-col h-full">
        <div class="grow-0">
          <Header />
        </div>
        <div class="grow">
          <div class="flex flex-row h-full">
            <div class="w-24 bg-gray-200 border-r-[1px] border-gray-300 border-solid">
              <Navbar />
            </div>
            <div class="grow pl-3 pt-2 bg-white">
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
