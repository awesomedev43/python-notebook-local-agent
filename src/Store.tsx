import { load } from '@tauri-apps/plugin-store';

export async function checkStoreValue(value: string): Promise<boolean> {
    const store = await load('store.json', { autoSave: false });
    const executablePath = await store.get<string>(value);

    if (executablePath == undefined || executablePath === '') {
        return false;
    }
    else {
        return true;
    }
}