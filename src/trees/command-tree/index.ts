import * as vscode from 'vscode';
import fs from 'fs-extra';
import path from 'path';
import setting from '@/models/setting';
import { codeName } from '@/common/const';

export interface CommandData {
    name: string;
    command?: vscode.Command;
    value?: string;
}

class CommandItem extends vscode.TreeItem {
    constructor(option: CommandData) {
        super(option.name, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('rocket');
        this.command = option.command;
    }
}

export class CommandTree implements vscode.TreeDataProvider<CommandItem> {
    static commandTree: CommandTree;
    static commandTreeProvider: vscode.TreeView<CommandData>;
    static create() {
        if (!this.commandTree) {
            this.commandTree = new CommandTree();
            this.commandTreeProvider = vscode.window.createTreeView(
                `${codeName}.command`,
                {
                    treeDataProvider: this.commandTree,
                },
            );
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<CommandData | undefined> =
        new vscode.EventEmitter<CommandData | undefined>();

    readonly onDidChangeTreeData: vscode.Event<CommandData | undefined> =
        this._onDidChangeTreeData.event;

    public _refresh(project?: CommandData) {
        this._onDidChangeTreeData.fire(project);
    }

    getTreeItem(element: CommandData) {
        return new CommandItem(element);
    }

    async getChildren(project: CommandData): Promise<CommandData[]> {
        let dirPath;
        if (!project) {
            dirPath = setting.getGitDir();
        }

        if (!dirPath) {
            return [
                {
                    name: 'The current file address is not recognized',
                },
            ];
        }

        let packagePath = path.resolve(dirPath, 'package.json');

        try {
            let packageInfo = await fs.readFile(packagePath, 'utf-8');
            let { scripts } = JSON.parse(packageInfo);
            const scriptList: CommandData[] = [];
            for (const script of Object.keys(scripts)) {
                scriptList.push({
                    name: script,
                    value: scripts[script],
                    command: {
                        command: `${codeName}.runScript`,
                        title: 'run script',
                        arguments: [scripts[script]],
                    },
                });
            }
            return scriptList;
        } catch (error) {
            return [
                {
                    name: 'not exist package.json',
                },
            ];
        }
    }
}

export function createCommandTree() {
    CommandTree.create();
}
