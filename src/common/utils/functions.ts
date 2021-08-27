import * as vscode from 'vscode';
import Context from '@/common/utils/context';

export function getNonce() {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function isValidateFileName(fileName: string) {
    return !fileName.match(/@"^[^\\/:\*\?""<>|]{1,120}$"/);
}

export function commandRegister(name: string, handle: (...args: any[]) => any) {
    let context = Context.getContext();
    if (context) {
        return context.subscriptions.push(
            vscode.commands.registerCommand(name, handle),
        );
    } else {
        return false;
    }
}
