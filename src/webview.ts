import * as vscode from 'vscode';

interface OptType {
    title: string,
    artist: string,
    album: string,
    position: string,
    positionSeconds: number,
    duration: string,
    durationSeconds: number,
    coverURL: string
}

class WebviewController {
    opt: OptType = {
        title: 'TITLE',
        artist: 'ARTIST',
        album: 'ALBUM',
        position: '0:00',
        positionSeconds: 0,
        duration: '0:00',
        durationSeconds: 0,
        coverURL: '',
    };

    private readonly context: vscode.ExtensionContext;
    private panel?: vscode.WebviewPanel;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        context.subscriptions.push(
            vscode.commands.registerCommand('wnpvscode.toggleWebViewControl', () => {
                const panel = vscode.window.createWebviewPanel(
                    'wnpctrl',
                    'Media Controller',
                    vscode.ViewColumn.Active,
                    {}
                    );

                this.panel = panel;

                this.panel.webview.html = this.getWebviewContent();
            })
        );
    }

    getWebviewContent() {
        if (!this.panel) {
            return "";
        }
        const styleMainPath = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'style.css');
        const styleMainUri = this.panel.webview.asWebviewUri(styleMainPath);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} https:; script-src ${this.panel.webview.cspSource}; style-src ${this.panel.webview.cspSource};" />
    
    <title>Media Controller</title>

    <link rel='stylesheet' href='${styleMainUri}'>
</head>
<body>
    <div class='album-art-container'>
        <img class='album-art' src="${this.opt.coverURL}">
        <img class='album-art-blur' src="${this.opt.coverURL}">
    </div>

    <h1 class='title'>${this.opt.title}</h1>
    <h2 class='artist'>${this.opt.artist}</h2>
    <h3 class='album'>${this.opt.album}</h3>
    
    <div class='seek'>
        <span class='position'>${this.opt.position}</span>
        <input type='range' class='bar' min='0' max='${this.opt.durationSeconds}' value='${this.opt.positionSeconds}'>
        <span class='duration'>${this.opt.duration}</span>
    </div>
</body>
</html>`;
    }
    
    public update(value: OptType) {
        if (!this.panel) {
            return;
        }
        this.opt = value;
        this.panel.webview.html = this.getWebviewContent();
    }
}

export default WebviewController;