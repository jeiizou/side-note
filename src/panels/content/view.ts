import { codeName } from '@/common/const';
import { getWebViewContent } from '@/common/utils/webview';
import Context from '@/common/utils/context';
import {
    CancellationToken,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
} from 'vscode';
import { Event } from '@/common/utils/event';
import { ContentEventCenter } from './event';

class ContentPanel implements WebviewViewProvider {
    static readonly viewType = `${codeName}.content`;

    private _view?: WebviewView;
    constructor(
        private readonly _extensionUri: Uri,
        public initCallBack: (ev: Event) => void,
    ) {}

    resolveWebviewView(
        webviewView: WebviewView,
        _context: WebviewViewResolveContext,
        _token: CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        let reciver = this._view?.webview.onDidReceiveMessage;
        let emitter = (data: any) => this._view?.webview.postMessage(data);
        let eventCenter = new Event(reciver, emitter);
        this.initCallBack(eventCenter);
    }

    private _getHtmlForWebview(webview: Webview) {
        return getWebViewContent('content', webview);
    }
}

function createContentPanel(): Promise<ContentPanel> {
    return new Promise((resolve) => {
        const { extensionUri } = Context.getContext();
        const provider = new ContentPanel(extensionUri, (ev: Event) => {
            resolve(provider);
            new ContentEventCenter(ev);
        });
        window.registerWebviewViewProvider(ContentPanel.viewType, provider, {
            webviewOptions: {
                // retainContextWhenHidden: true,
            },
        });
    });
}

export default createContentPanel;
