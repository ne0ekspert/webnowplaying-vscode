import * as vscode from 'vscode';
interface OptType {
    title: string,
    artist: string,
    album: string,
    position: string,
    duration: string,
    coverURL: string
}

class WebviewController {
    opt: OptType = {
        title: 'TITLE',
        artist: 'ARTIST',
        album: 'ALBUM',
        position: '0:00',
        duration: '0:00',
        coverURL: '',
    };

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('wnpvscode.toggleWebViewControl', () => {
                const panel = vscode.window.createWebviewPanel(
                    'wnpctrl',
                    'Media Controller',
                    vscode.ViewColumn.Active,
                    {}
                    );

                panel.webview.html = this.getWebviewContent();
            })
        );
    }

    getWebviewContent() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Controller</title>
</head>
<body>
    <img class='album-art' src="${this.opt.coverURL}">
    <h1 class='title'>${this.opt.title}</h1>
    <h2 class='artist'>${this.opt.artist}</h2>
    <h3 class='album'>${this.opt.album}</h3>
    <div>
        <span class='position'>${this.opt.position}</span>
        <span class='duration'>${this.opt.duration}</span>
    </div>
</body>
</html>`;
    }
}

export default WebviewController;