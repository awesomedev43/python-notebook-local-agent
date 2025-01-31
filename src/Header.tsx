import { Component } from "solid-js";

const Header: Component<{}> = () => {
  
  return (
    <header class="w-full bg-gray-200 pt-2 pb-2 border-b-[1px] border-gray-300 font-bold">
        <h1 class="text-3xl text-gray-700 tracking-tighter text-center">Python Notebook Local Agent</h1>
    </header>
  );
};

export default Header;