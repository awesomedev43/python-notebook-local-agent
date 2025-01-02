import { load } from '@tauri-apps/plugin-store';

const DEFAULT_VALUE: { key: string, value: string }[] = [
    { key: "executable-path", value: "" },
    { key: "data-directory", value: "" },
];

export async function getStoreValue(key: string): Promise<string> {
    const store = await load('store.json', { autoSave: false });
    const value = await store.get<string>(key) ?? '';
    store.close();
    return value;
}


export async function isStoreValueSet(key: string): Promise<boolean> {
    const value = await getStoreValue(key);
    return value !== '';
}

export async function setStoreValue(key: string, value: string): Promise<void> {
    const store = await load('store.json', { autoSave: false });
    await store.set(key, value);
    await store.save();
}