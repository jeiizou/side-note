export enum ProjectStatus {
    noLocalRepo = 1,
    noRemote,
    noGitInit,
    initFinished,
    unkown,
}

export const ProjectStatusInfo = {
    [ProjectStatus.initFinished]: {
        label: 'Item Verification succeeded',
    },
    [ProjectStatus.noGitInit]: {
        label: 'The Repo did not initialize git',
    },
    [ProjectStatus.noRemote]: {
        label: 'The Repo is not configured with a remote address',
    },
    [ProjectStatus.noLocalRepo]: {
        label: 'No Local Repo Addr',
    },
    [ProjectStatus.unkown]: {
        label: 'Unknow status',
    },
};
