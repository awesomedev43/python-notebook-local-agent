import { IconInfoCircle, IconAlertCircle } from "@tabler/icons-solidjs";
import { Component, createSignal, JSX } from "solid-js";

export enum ToastType {
    Note = 0,
    Error,
    Success
};

const TOAST_INFO: { bg: string, icon: any }[] = [
    {
        bg: "bg-blue-600",
        icon: IconInfoCircle
    },
    {
        bg: "bg-red-600",
        icon: IconAlertCircle
    },
    {
        bg: "bg-green-600",
        icon: IconInfoCircle
    },
];



const Toast: Component<{ message: string, visible: boolean, toastType: ToastType }> = (props) => {

    let toastInfo = TOAST_INFO[props.toastType]

    return (
        <div class={`transition ease-in-out delay-1000 flex flex-row items-center p-3 
                     text-lg text-white ${toastInfo.bg} border-[1px]
                    border-gray-400 rounded absolute bottom-3 right-3 ${props.visible ? "" : 'hidden'}`}>
            <toastInfo.icon class="mr-2" />
            {props.message}
        </div>
    );
};

export function createToastComponent(toastType: ToastType): [((note: string) => void), JSX.Element] {
    const [toastNote, setToastNote] = createSignal<string | null>(null);
    const setAndClearNote = (note: string) => {
        setToastNote(`${note}`);
        setTimeout(() => {
            setToastNote(null);
        }, 3000);
    }

    const component = (
        <Toast message={toastNote() ?? ""} toastType={toastType} visible={(toastNote() !== null)} />
    );

    return [setAndClearNote, component];
}