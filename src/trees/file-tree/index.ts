import * as vscode from 'vscode';
import path from 'path';
import Context from '@/common/utils/context';
import fs from 'fs-extra';
import { ProjectStatus, ProjectStatusInfo } from '@/common/types/common';
import setting from '@/models/setting';
import glob from 'glob';
import { codeName } from '@/common/const';

export enum FileNodeType {
    dir = 'dir',
    file = 'file',
    text = 'text',
}

export interface FileData {
    name: string;
    type: FileNodeType;
    command?: vscode.Command;
    icon?: string;
    path?: string;
}

class FileItem extends vscode.TreeItem {
    constructor(option: FileData) {
        super(
            option.name,
            option.type === FileNodeType.dir
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
        );
        const context = Context.getContext();

        if (option.type === FileNodeType.dir) {
            this.iconPath = vscode.ThemeIcon.Folder;
        } else {
            this.iconPath = vscode.ThemeIcon.File;
        }

        this.command = option.command;
        this.contextValue = option.type;
    }
}

export class FileTree implements vscode.TreeDataProvider<FileItem> {
    static fileTree: FileTree;
    static fileTreeProvider: vscode.TreeView<FileData>;
    static create() {
        if (!this.fileTree) {
            this.fileTree = new FileTree();
            this.fileTreeProvider = vscode.window.createTreeView(
                `${codeName}.workspace`,
                {
                    treeDataProvider: this.fileTree,
                    showCollapseAll: true,
                },
            );
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<FileData | undefined> =
        new vscode.EventEmitter<FileData | undefined>();

    readonly onDidChangeTreeData: vscode.Event<FileData | undefined> =
        this._onDidChangeTreeData.event;

    public _refresh(project?: FileData) {
        this._onDidChangeTreeData.fire(project);
    }

    getTreeItem(element: FileData) {
        return new FileItem(element);
    }

    async getChildren(project: FileData): Promise<FileData[]> {
        let status = await Context.getProjectStatus();
        if (status !== ProjectStatus.noLocalRepo) {
            // read dir files
            return this.getFilesNode(project);
        } else {
            // show repo staus
            return [
                {
                    name: ProjectStatusInfo[status].label,
                    type: FileNodeType.text,
                },
            ];
        }
    }

    async getFilesNode(project?: FileData) {
        let dirPath;
        if (!project) {
            dirPath = setting.getGitDir();
        } else {
            dirPath = project.path;
        }

        if (!dirPath) {
            return [
                {
                    name: 'The current file address is not recognized',
                    type: FileNodeType.text,
                },
            ];
        }

        dirPath = path.resolve(dirPath);
        let files = await fs.readdir(dirPath);

        let ignoreFiles = await setting.getIgnoreFiles();
        if (ignoreFiles && ignoreFiles.length > 0) {
            files = files.filter((i) => !ignoreFiles?.includes(i));
        }

        let directories: FileData[] = [];
        let fileList: FileData[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let filePath = path.resolve(dirPath, file);
            let stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                directories.push({
                    name: file,
                    type: FileNodeType.dir,
                    path: filePath,
                });
            } else {
                fileList.push({
                    name: file,
                    type: FileNodeType.file,
                    path: filePath,
                    command: {
                        command: `${codeName}.openFile`,
                        title: 'openFile',
                        arguments: [filePath],
                    },
                });
            }
        }

        return [...directories, ...fileList];
    }
}

export function createFileTree() {
    FileTree.create();
}
