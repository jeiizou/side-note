import { codeName } from '@/common/const';
import { commandRegister } from '@/common/utils/functions';
import { FileTree } from '@/trees/file-tree';
import * as vscode from 'vscode';
import path from 'path';
import setting from '@/models/setting';
import prompt from '@/models/prompt';
import { CommandTree } from '@/trees/command-tree';
import { openFile } from './file';

export function refreshFileTree() {
    FileTree.fileTree._refresh();
}

export function refreshComman() {
    CommandTree.commandTree._refresh();
}

export async function runScript(value: string) {
    let dir = setting.getGitDir();
    if (!dir) {
        return;
    }

    if (vscode.window.activeTerminal?.name === codeName) {
        vscode.window.activeTerminal.show();
        vscode.window.activeTerminal.sendText(value + '\n');
    } else {
        let terminal = vscode.window.createTerminal({
            cwd: dir,
            name: codeName,
            message: value + '\n',
        });
        terminal.show();
    }
}

export async function editScript() {
    let dir = setting.getGitDir();
    if (!dir) {
        return;
    }
    let packagePath = path.join(dir, 'package.json');
    openFile(packagePath);
}

export async function showConfig() {
    vscode.commands.executeCommand('workbench.action.openSettings', codeName);
}

export async function setGitIgnore() {
    let answer = await prompt.select('Ignore warehouse in Git', [
        'ignore',
        'not ignore',
    ]);
    if (answer === 'ignore') {
        setting.updateIgnoreGitRepo();
    } else {
        setting.deleteIgnoreGitRepo();
    }
}

export default () => {
    commandRegister(`${codeName}.refreshFile`, refreshFileTree);
    commandRegister(`${codeName}.refreshComman`, refreshComman);
    commandRegister(`${codeName}.runScript`, runScript);
    commandRegister(`${codeName}.editComman`, editScript);
    commandRegister(`${codeName}.editConfig`, showConfig);
    commandRegister(`${codeName}.setIgnoreInGit`, setGitIgnore);
};
