import { OutputChannel, window } from 'vscode';
import * as chalk from 'chalk';
import { codeName } from '@/common/const';

/**
 * Print log processing
 */
class LoggerModel {
    static logger: LoggerModel;
    static create() {
        if (!this.logger) {
            this.logger = new LoggerModel();
        }
        return this.logger;
    }

    outputPanel: OutputChannel;
    constructor() {
        this.outputPanel = window.createOutputChannel(codeName);
    }

    async clear() {
        this.outputPanel.clear();
    }

    async showPanel() {
        this.outputPanel.show();
    }

    async log(text: string) {
        this.outputPanel.appendLine(`[${codeName}]:${text}`);
    }

    async logError(text: string) {
        this.outputPanel.appendLine(chalk.red(`${codeName}: ${text}`));
    }

    async info(text: string) {
        return window.showInformationMessage(`${codeName}: ${text}`);
    }

    async prompt(text: string) {
        return window.showInformationMessage(`${codeName}: ${text}`, {
            modal: true,
        });
    }

    async warn(text: string) {
        return window.showWarningMessage(`${codeName}: ${text}`);
    }

    async error(text: string) {
        return window.showErrorMessage(`${codeName}: ${text}`);
    }

    async infoInStatus(msg: string) {
        let handle = window.setStatusBarMessage(msg);
        setTimeout(() => {
            handle.dispose();
        }, 2000);
        return handle;
    }
}

export default LoggerModel.create();
