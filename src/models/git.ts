import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs-extra';
import dayjs from 'dayjs';

import setting from '@/models/setting';
import logger from '@/models/logger';
import prompt from '@/models/prompt';
import { codeName } from '@/common/const';

class GitModel {
    static git: GitModel;
    static create(dir: string) {
        fs.ensureDir(dir);
        if (!this.git) {
            this.git = new GitModel(dir);
        }
        return this.git;
    }

    private simplegit: SimpleGit;

    constructor(dir: string) {
        this.simplegit = simpleGit(dir);
    }

    async instance(dir: string) {
        this.simplegit = simpleGit(dir);
    }

    /**
     * Initialize local warehouse
     */
    async init() {
        try {
            // Determine whether the instance is initialized
            if (await this.isInit()) {
                logger.log('仓库已初始化, 跳过本次初始化');
                return true;
            }
            await this.simplegit.init();
            return true;
        } catch (error) {
            logger.logError(`初始化失败: ${error}`);
            return false;
        }
    }

    /**
     * Check whether the remote warehouse is configured
     */
    async hasRemote() {
        try {
            let remotes = await this.simplegit.getRemotes();
            if (remotes.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            logger.logError(error);
            return false;
        }
    }

    /**
     * Configure remote
     */
    async initRemote() {
        try {
            let remoteUrl = await prompt.input('Enter remote address');
            let remoteName = await prompt.input('Enter remote name');
            if (!remoteName || !remoteUrl) {
                return false;
            }
            let addRemoteResult = await this.simplegit.addRemote(
                remoteName,
                remoteUrl,
            );
            return addRemoteResult;
        } catch (error) {
            logger.logError(error);
            return false;
        }
    }

    /**
     * Set Branch of warehouse
     */
    async setBranch() {
        let branch = await this.simplegit.branch();

        let res = await prompt.select(
            `checkout branch(current:${branch.current})`,
            branch.all,
        );
        if (res) {
            this.simplegit.checkout(res);
        }
    }

    /**
     * Determine whether the warehouse has completed initialization
     * @returns
     */
    async isInit() {
        let dir = setting.getGitDir();
        if (!dir) {
            return false;
        } else {
            return await fs.pathExists(path.resolve(dir, '.git'));
        }
    }

    /**
     * Synchronize warehouse code
     * @param desc
     * @returns
     */
    async sync(desc?: string) {
        try {
            await this.simplegit.pull();
            await this.simplegit.add('.');
            await this.simplegit.commit(
                desc ??
                    `[${codeName}]Sync File(${dayjs().format(
                        'YYYY-MM-DD HH:mm:ss',
                    )})`,
            );
            await this.simplegit.push();
            return true;
        } catch (error) {
            logger.error(`Sync Failed: ${error}`);
            return false;
        }
    }
}

export default GitModel;
