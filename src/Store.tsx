import { invoke } from '@tauri-apps/api/core';
import { load } from '@tauri-apps/plugin-store';

export enum KVStoreKeys {
    EXECUTABLE_PATH = "executable-path",
    DATA_DIRECTORY = "data-directory,"
}

export class KVStore {
    static async getStoreValue(key: string): Promise<string> {
        const store = await load('store.json', { autoSave: false });
        const value = await store.get<string>(key) ?? '';
        return value;
    }


    static async isStoreValueSet(key: string): Promise<boolean> {
        const value = await KVStore.getStoreValue(key);
        return value !== '';
    }

    static async setStoreValue(key: string, value: string): Promise<void> {
        const store = await load('store.json', { autoSave: false });
        await store.set(key, value);
        await store.save();
    }

    static async configureBackend() {
        await invoke('configure_app',
            {
                "config": {
                    "executable_path": await KVStore.getStoreValue(KVStoreKeys.EXECUTABLE_PATH),
                    "data_directory": await KVStore.getStoreValue(KVStoreKeys.DATA_DIRECTORY),
                }
            }
        );
    }
};