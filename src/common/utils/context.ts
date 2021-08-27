import * as vscode from 'vscode';
import { ProjectStatus, ProjectStatusInfo } from '../types/common';

class Context {
    constructor() {}
    static context: vscode.ExtensionContext;
    static saveContext(context: vscode.ExtensionContext) {
        this.context = context;
    }
    static getContext() {
        return this.context;
    }

    static projectStatus: ProjectStatus;
    static saveProjectStatus(status: ProjectStatus) {
        this.projectStatus = status;
    }
    static getProjectStatus() {
        return this.projectStatus;
    }
}

export default Context;
