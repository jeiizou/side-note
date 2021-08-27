import * as vscode from 'vscode';
import { codeName } from '@/common/const';
import * as os from 'os';

/**
 * VS Code setting manager
 */
class SettingModel {
    static setting: SettingModel;
    static create() {
        if (!this.setting) {
            this.setting = new SettingModel();
        }

        return this.setting;
    }

    config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration(codeName);
        vscode.workspace.onDidChangeConfiguration((e) => {
            this.config = vscode.workspace.getConfiguration(codeName);
        });
    }

    async updateConfig(propName: string, value: any) {
        let res = await this.config.update(
            propName,
            value,
            vscode.ConfigurationTarget.Global,
        );
        this.config = vscode.workspace.getConfiguration(codeName);
        return res;
    }

    getGitDir(): string | undefined {
        if (os.platform() === 'win32') {
            return this.config.get('gitDirOnWin');
        } else {
            return this.config.get('gitDirOnUnix');
        }
    }

    async setGitDir(ph: string) {
        if (os.platform() === 'win32') {
            await this.updateConfig('gitDirOnWin', ph.slice(1));
        } else {
            await this.updateConfig('gitDirOnUnix', ph);
        }
        return true;
    }

    getSync() {
        return this.config.get('autoSync');
    }

    async setSync(open: boolean) {
        return this.updateConfig('autoSync', open);
    }

    async isNoRemote() {
        return this.config.get('noRemote');
    }

    async setNoRemote(value: boolean) {
        return this.updateConfig('noRemote', value);
    }

    async getIgnoreFiles() {
        return this.config.get('ignoreFiles') as string[] | undefined;
    }

    async getIgnoreGitRepo() {
        return this.config.get('ignoreGitRepo');
    }

    async updateIgnoreGitRepo() {
        const dirPath = this.getGitDir();
        if (!dirPath) {
            return;
        }
        let config = vscode.workspace.getConfiguration('git');
        let value = config.get('ignoredRepositories') as string[];
        if (!value.includes(dirPath)) {
            value.push(dirPath);
            return await config.update(
                'ignoredRepositories',
                value,
                vscode.ConfigurationTarget.Global,
            );
        }
    }

    async deleteIgnoreGitRepo() {
        const dirPath = this.getGitDir();
        if (!dirPath) {
            return;
        }
        let config = vscode.workspace.getConfiguration('git');
        let value = config.get('ignoredRepositories') as string[];
        let index = value.indexOf(dirPath);
        if (index !== -1) {
            value.splice(index, 1);
            return await config.update(
                'ignoredRepositories',
                value,
                vscode.ConfigurationTarget.Global,
            );
        }
    }
}

export default SettingModel.create();
