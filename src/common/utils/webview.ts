import { getNonce } from '@/common/utils/functions';
import { Uri, Webview } from 'vscode';
import Context from '@/common/utils/context';
import { codeName } from '../const';
import indexContent from './index.html';
import Mustache from 'mustache';

export function getWebViewContent(script: string, webview: Webview) {
    const scriptContent = ['out', 'views', script + '.js'];
    const styleContent = ['out', 'views', script + '.css'];
    const reactScript = ['out', 'assets', 'react.production.min.js'];
    const reactDomScript = ['out', 'assets', 'react-dom.production.min.js'];

    const { extensionUri } = Context.getContext();
    const getPath = (pathList: string[]) =>
        webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));

    const contentData: {
        [key: string]: any;
    } = {
        title: codeName,
        styles: [],
        scripts: [],
        cspSource: webview.cspSource,
        nonce: getNonce(),
        content: '<div id="root"></div> ',
    };

    contentData.styles.push(getPath(styleContent));
    contentData.scripts.push(getPath(reactScript));
    contentData.scripts.push(getPath(reactDomScript));
    contentData.scripts.push(getPath(scriptContent));

    let renderHtml = Mustache.render(indexContent, contentData);
    return renderHtml;
}
