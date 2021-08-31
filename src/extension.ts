import * as vscode from 'vscode';

import logger from '@/models/logger';
import Context from '@/common/utils/context';
import { initRepo } from '@/commands/repo';
import { createFileTree } from '@/trees/file-tree';
import { createCommandTree } from '@/trees/command-tree';
import registerCommand from '@/commands';
import { codeName } from './common/const';

export async function activate(context: vscode.ExtensionContext) {
    console.log(`[${codeName}]: activated`);
    // save context
    Context.saveContext(context);

    // init repo
    logger.log('start check repo status');
    const status = await initRepo();
    Context.saveProjectStatus(status);

    // new file tree
    createFileTree();
    createCommandTree();

    // register command
    registerCommand();
}
