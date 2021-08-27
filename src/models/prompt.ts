import { InputBoxOptions, window } from 'vscode';
import { codeName } from '@/common/const';

/**
 * Dialog processing
 */
class PromptModel {
    static prompt: PromptModel;
    static create() {
        if (!this.prompt) {
            this.prompt = new PromptModel();
        }

        return this.prompt;
    }

    /**
     * Input box to return the entered value
     * @param desc
     * @param value
     * @param opts
     * @returns
     */
    async input(desc: string, value?: string, opts?: InputBoxOptions) {
        return window.showInputBox({
            ignoreFocusOut: true,
            password: false,
            value: value,
            placeHolder: desc,
            title: `[${codeName}] ${desc}`,
            ...opts,
        });
    }

    /**
     * Confirmation box, return Boolean
     * @param desc
     * @param ok
     * @param modal
     * @returns
     */
    async confirm(desc: string, ok: string = '确认', modal: boolean = true) {
        return window
            .showInformationMessage(
                `[${codeName}]${desc}`,
                {
                    modal,
                },
                ok,
            )
            .then((data) => {
                if (data === ok) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    /**
     * Select the box to return the selected value
     * @param desc
     * @param items
     * @returns
     */
    async select(desc: string, items: string[]) {
        return window.showQuickPick(items, {
            placeHolder: desc,
        });
    }

    /**
     * Folder selection box to return to the folder path
     * @param desc
     * @returns
     */
    async directorySelect(desc: string) {
        return window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: desc,
        });
    }
}

export default PromptModel.create();
