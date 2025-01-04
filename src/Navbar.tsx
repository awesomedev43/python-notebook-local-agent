import { Component, For } from "solid-js";
import { IconProgressCheck, IconSettings, IconPlayerPlay, IconClock } from '@tabler/icons-solidjs';
import { A } from "@solidjs/router";

type ButtonProps = {
    name: string,
    icon: any,
    href: string,
};

const Navbar: Component<{}> = () => {

    const navButtons: ButtonProps[] = [
        {
            name: "Run",
            icon: IconPlayerPlay,
            href: "/run"
        },
        {
            name: "Scheduled",
            icon: IconClock,
            href: "/scheduled"
        },
        {
            name: "Completed",
            icon: IconProgressCheck,
            href: "/completed"
        },
        {
            name: "Settings",
            icon: IconSettings,
            href: "/settings"
        }
    ];


    return (
        <nav>
            <For each={navButtons}>
                {(item, _) =>

                    <A href={item.href} class="group flex flex-col border-b-[0.5px] border-solid border-gray-300 pb-1 pt-1 text-center hover:bg-blue-600 [&.active]:bg-blue-600">

                        <div class="place-self-center">
                            <item.icon size={30} class="group-hover:stroke-white group-[&.active]:stroke-white" />
                        </div>
                        <div class="p-1 text-md group-hover:text-white group-[&.active]:text-white">{item.name}</div>

                    </A>
                }
            </For>
        </nav>
    );
};

export default Navbar;