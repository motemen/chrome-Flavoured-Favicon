export class StorageKey {
    key: string;

    constructor (key: string) {
        this.key = key;
    }

    get (): any {
        try {
            return JSON.parse(localStorage[this.key]);
        } catch (e) {
            return;
        }
    }

    set (value: any) {
        localStorage[this.key] = JSON.stringify(value);
    }
}
