import { Component, For } from "solid-js";
import { IconProgressCheck, IconBriefcase, IconSettings } from '@tabler/icons-solidjs';

type ButtonProps = {
    name: string,
    icon: any
};

const Navbar: Component<{}> = () => {

    const navButtons: ButtonProps[] = [
        {
            name: "Task",
            icon: IconBriefcase,
        },
        {
            name: "Completed",
            icon: IconProgressCheck
        },
        {
            name: "Settings",
            icon: IconSettings
        }
    ];


    return (
        <nav>
            <For each={navButtons}>
                {(item, _) =>

                    <div class="flex flex-col text-center border-solid border-b-[0.5px] border-gray-300 hover:bg-blue-600 pt-1 pb-1 group">
                        <div class="place-self-center">
                            <item.icon size={30} class="group-hover:stroke-white" />
                        </div>
                        <div class="p-1 text-md group-hover:text-white">{item.name}</div>
                    </div>
                }
            </For>
        </nav>
    );
};

export default Navbar;