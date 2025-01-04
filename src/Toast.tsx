import { IconInfoCircle, IconAlertCircle } from "@tabler/icons-solidjs";
import { Component } from "solid-js";

const Toast: Component<{ message: string, visible: boolean, error: boolean }> = (props) => {

    let bg = props.error ? "bg-red-600" : "bg-blue-600";

    return (
        <div class={`transition ease-in-out delay-1000 flex flex-row items-center p-3 text-2xl text-white ${bg} border-[1px] border-gray-400 rounded absolute bottom-3 right-3 ${props.visible ? "" : 'hidden'}`}>
            {props.error ? <IconAlertCircle class="mr-2" /> : <IconInfoCircle class="mr-2" />}
            {props.message}
        </div>
    );
};

export default Toast;