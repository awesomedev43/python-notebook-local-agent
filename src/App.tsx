import "./App.css";
import Header from "./Header.tsx"
import Navbar from "./Navbar.tsx";

function App(props: any) {


  return (
    <main>
      <div class="flex flex-col">
        <div class="flex-none">
          <Header />
        </div>
        <div class="grow">
          <div class="flex flex-row">
            <div class="flex-none w-24 h-screen bg-gray-200 border-r-[1px] border-gray-300 border-solid">
              <Navbar />
            </div>
            <div class="grow p-2 bg-white">
              {props.children}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
