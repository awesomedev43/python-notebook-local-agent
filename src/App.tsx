import "./App.css";
import Header from "./Header.tsx"

function App() {


  return (
    <main>
      <div class="flex flex-col">
        <div class="flex-none">
          <Header />
        </div>
        <div class="grow">
          <div class="flex flex-row">
            <div class="flex-none w-1/6 h-screen bg-gray-300 border-r-[1px] border-gray-300"></div>
            <div class="grow p-1">Main Content</div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
