import * as vscode from 'vscode';
import openPath from 'open';
import { commandRegister } from '@/common/utils/functions';
import setting from '@/models/setting';
import logger from '@/models/logger';
import { codeName } from '@/common/const';
import Git from '@/models/git';
import prompt from '@/models/prompt';
import { ProjectStatus } from '@/common/types/common';
import { refreshComman, refreshFileTree } from './common';

/**
 * init repo
 */
export async function initRepo(targetDir?: string) {
    try {
        let dir = targetDir ?? setting.getGitDir();
        if (!dir) {
            // select repo addr
            let enableConfig = await prompt.confirm(
                'The local workspace is not configured. Do you want to configure it now ?',
            );
            if (!enableConfig) {
                return ProjectStatus.noLocalRepo;
            }
            let res = await prompt.directorySelect('select repo');
            if (!res) {
                return ProjectStatus.noLocalRepo;
            }
            dir = res[0].path;
        }
        // config addr
        await setting.setGitDir(dir);

        let git = Git.create(dir);

        // init local repo
        let initGitResult = await git.init();

        if (!initGitResult) {
            return ProjectStatus.noGitInit;
        }

        // config remote repo
        if (!(await git.hasRemote())) {
            let isNoRemote = await setting.isNoRemote();
            if (isNoRemote) {
                return ProjectStatus.noRemote;
            }

            let isInitRemote = await prompt.confirm(
                'It is detected that there is no remote warehouse configuration. Do you want to configure it?',
                'Yes',
                false,
            );
            if (!isInitRemote) {
                let isSkipRemoteCheck = await prompt.confirm(
                    'Skip remote warehouse configuration verification next time',
                    'Yes',
                    false,
                );

                if (isSkipRemoteCheck) {
                    setting.setNoRemote(true);
                }

                return ProjectStatus.noRemote;
            }

            let res = await git.initRemote();
            if (!res) {
                return ProjectStatus.noRemote;
            }
        }
        return ProjectStatus.initFinished;
    } catch (error) {
        logger.logError(error);
        return ProjectStatus.unkown;
    }
}

/**
 * check local repo status
 * @returns
 */
export async function checkRepoStatus() {
    let dir = setting.getGitDir();
    if (!dir) {
        return ProjectStatus.noLocalRepo;
    }
    let git = Git.create(dir);
    if (!(await git.isInit())) {
        return ProjectStatus.noGitInit;
    }
    if (!(await git.hasRemote())) {
        return ProjectStatus.noRemote;
    }

    return ProjectStatus.initFinished;
}

/**
 * sync repo
 */
export async function syncRepo() {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'sync repo...',
        },
        async () => {
            let dir = setting.getGitDir();
            if (!dir) {
                logger.warn('No Local Repo!');
                return;
            }
            let git = Git.create(dir);
            if (!(await git.isInit())) {
                logger.warn('Repo not init git');
                return;
            }
            if (!(await git.hasRemote())) {
                logger.warn('no remote');
                return;
            }

            try {
                let res = await git.sync();
                if (res) {
                    return ProjectStatus.initFinished;
                } else {
                    logger.showPanel();
                    logger.logError(JSON.stringify(res));
                    throw Error('Unknown Error');
                }
            } catch (error) {
                logger.showPanel();
                logger.logError(JSON.stringify(error));
                throw Error('Sync Error');
            }
        },
    );
}

/**
 * reset repo
 */
export async function setRepo() {
    let res = await prompt.directorySelect('Select New Repo');
    if (!res) {
        return;
    }
    const dir = res[0].path;
    let initResult = await initRepo(dir);
    refreshFileTree();
    refreshComman();
    return initResult;
}

/**
 * open repo
 */
export async function openRepo() {
    let dir = setting.getGitDir();
    if (!dir) {
        logger.warn('No local warehouse configured');
        return;
    }
    let selectOptions = ['Open in new Vscode', 'Open in Explorer'];
    let res = await prompt.select('open way', selectOptions);
    if (res === selectOptions[0]) {
        let uri = vscode.Uri.file(dir);
        await vscode.commands.executeCommand('vscode.openFolder', uri, true);
    } else {
        openPath(dir);
    }
}

/**
 * config remote repo
 */
export async function setRemoteRepo() {
    let dir = setting.getGitDir();
    if (!dir) {
        logger.warn('No local warehouse configured');
        return;
    }
    let git = Git.create(dir);
    let remote = await git.initRemote();
    if (remote) {
        logger.info('Configuration remote addr success');
    }
}

export default () => {
    commandRegister(`${codeName}.initRepo`, initRepo);
    commandRegister(`${codeName}.resetRepo`, setRepo);
    commandRegister(`${codeName}.syncRepo`, syncRepo);
    commandRegister(`${codeName}.openRepo`, openRepo);
    commandRegister(`${codeName}.setRemoteRepo`, setRemoteRepo);
};
