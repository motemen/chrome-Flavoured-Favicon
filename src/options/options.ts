/*
class StorageKey {
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
*/

window.onload = function () {
    var saveButton = document.querySelector('#save'),
        rulesText  = <HTMLInputElement>document.querySelector('#rules');

    var storedRules = new StorageKey('options.rules');

    rulesText.value = JSON.stringify(storedRules.get(), null, 2);

    rulesText.addEventListener('keyup', function (ev: Event) {
        try {
            JSON.parse(rulesText.value);
            saveButton.removeAttribute('disabled');
        } catch (e) {
            saveButton.setAttribute('disabled', 'disabled');
        }
    }, true)

    saveButton.addEventListener('click', function (ev: Event) {
        storedRules.set(JSON.parse(rulesText.value));
    }, true);
};
