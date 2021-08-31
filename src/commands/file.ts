import { codeName } from '@/common/const';
import { FileObject } from '@/common/types/files';
import { commandRegister, isValidateFileName } from '@/common/utils/functions';
import prompt from '@/models/prompt';
import fs from 'fs-extra';
import path from 'path';
import logger from '@/models/logger';
import setting from '@/models/setting';
import { FileData, FileNodeType } from '@/trees/file-tree';
import { refreshFileTree } from './common';
import * as vscode from 'vscode';

/**
 * get file tree
 * @param dirPath
 */
export async function getFileTree(dirPath: string) {
    let files: FileObject[] = [];

    function getFiles(curPath: string, curFolderList: FileObject[]) {
        const fsStat = fs.statSync(curPath);

        const baseName = path.basename(curPath);
        if (fsStat.isDirectory()) {
            const dir = {
                name: baseName,
                path: curPath,
                children: [],
            };
            curFolderList.unshift(dir);

            let files = fs.readdirSync(curPath);
            files.map((file) =>
                getFiles(path.join(curPath, file), dir.children),
            );
        } else if (fsStat.isFile()) {
            curFolderList.push({
                name: baseName,
                path: curPath,
            });
        }
    }

    getFiles(dirPath, files);
    return files?.[0].children ?? [];
}

export async function newFile(targetFile?: FileData) {
    try {
        let targetPath;
        if (!targetFile) {
            targetPath = setting.getGitDir();
        } else {
            if (targetFile.type === FileNodeType.file) {
                targetPath = path.dirname(targetFile.path ?? '');
            } else {
                targetPath = targetFile.path;
            }
        }
        if (!targetPath) {
            return;
        }
        let fileName = await prompt.input('Please enter a file name');
        if (!fileName) {
            return;
        }
        if (!isValidateFileName(fileName)) {
            logger.error('Illegal name');
            return;
        }
        let filePath = path.join(targetPath, fileName);
        let fsStat = fs.existsSync(filePath);
        if (fsStat) {
            logger.info('File already exist');
            return;
        }
        await fs.writeFile(filePath, '');
        refreshFileTree();
    } catch (error) {}
}

export async function newDirectory(targetFile?: FileData) {
    let targetPath;
    if (!targetFile) {
        targetPath = setting.getGitDir();
    } else {
        if (targetFile.type === FileNodeType.file) {
            targetPath = path.dirname(targetFile.path ?? '');
        } else {
            targetPath = targetFile.path;
        }
    }
    if (!targetPath) {
        return;
    }

    let directionName = await prompt.input('Please enter a folder name');
    if (!directionName) {
        return;
    }
    if (!isValidateFileName(directionName)) {
        logger.error('Illegal name');
        return;
    }
    let directionPath = path.join(targetPath, directionName);
    let fsStat = fs.existsSync(directionPath);
    if (fsStat) {
        logger.info('Floder already exist');
        return;
    }
    await fs.ensureDir(directionPath);
    refreshFileTree();
}

export async function deleteTarget(targetFile?: FileData) {
    if (!targetFile || !targetFile.path) {
        return;
    }
    await fs.remove(path.resolve(targetFile.path));
    refreshFileTree();
}

export async function rename(targetFile?: FileData) {
    if (!targetFile || !targetFile.path) {
        return;
    }
    let newName = await prompt.input('Input new name', targetFile.name);
    if (!newName) {
        return;
    }

    let oldPath = path.resolve(targetFile.path);
    let newPath = path.resolve(path.dirname(targetFile.path), newName);
    await fs.rename(oldPath, newPath);
    refreshFileTree();
}

export async function openFile(filePath?: string) {
    if (!filePath) {
        return;
    }
    let fileUri = vscode.Uri.file(filePath);
    vscode.workspace.openTextDocument(fileUri).then((doc) => {
        vscode.window.showTextDocument(doc);
    });
}

export default () => {
    commandRegister(`${codeName}.newFile`, newFile);
    commandRegister(`${codeName}.newDirectory`, newDirectory);
    commandRegister(`${codeName}.delete`, deleteTarget);
    commandRegister(`${codeName}.rename`, rename);
    commandRegister(`${codeName}.openFile`, openFile);
};
