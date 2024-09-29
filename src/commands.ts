import * as vscode from 'vscode';

import { WNPRedux } from './WNPRedux';


export function pushCommands(context: vscode.ExtensionContext, wnp: WNPRedux) {
    let previousVolume = wnp.mediaInfo.volume;

    context.subscriptions.push(
    vscode.commands.registerCommand("wnpvscode.prevMusic", () => {
            wnp.control.previous();
        }),

        vscode.commands.registerCommand("wnpvscode.togglePlayMusic", () => {
            switch (wnp.mediaInfo.state) {
                case "PLAYING":
                    vscode.window.showInformationMessage(`Pausing ${wnp.mediaInfo.title}`);
                    break;
                case "PAUSED":
                    vscode.window.showInformationMessage(`Playing ${wnp.mediaInfo.title}`);
                    break;
            }
            wnp.control.togglePlaying();
        }),

        vscode.commands.registerCommand("wnpvscode.nextMusic", () => {
            wnp.control.next();
        }),

        vscode.commands.registerCommand("wnpvscode.changeVolume", () => {
            vscode.window.showInputBox({
                placeHolder: '0-100 Volume...',
                value: String(wnp.mediaInfo.volume)
            }).then((volume) => {
                wnp.control.setVolume(Number(volume));
            });
        }),

        vscode.commands.registerCommand("wnpvscode.toggleMute", () => {
            if (wnp.mediaInfo.volume === 0) {
                wnp.control.setVolume(previousVolume);
            } else {
                previousVolume = wnp.mediaInfo.volume;
                wnp.control.setVolume(0);
            }
        }),

        vscode.commands.registerCommand("wnpvscode.toggleRepeat", () => {
            switch (wnp.mediaInfo.repeatState) {
                case "NONE":
                    vscode.window.showInformationMessage(`Enabling loop on ${wnp.mediaInfo.title}`);
                default:
                    vscode.window.showInformationMessage(`Disabling loop on ${wnp.mediaInfo.title}`);
            }
            wnp.control.toggleRepeat();
        }),

        vscode.commands.registerCommand("wnpvscode.toggleShuffle", () => {
            wnp.control.toggleShuffle();
        }),

        vscode.commands.registerCommand("wnpvscode.toggleThumbsUp", () => {
            if (wnp.mediaInfo.rating === 5) {
                vscode.window.showInformationMessage(`You removed Thumbs up on ${wnp.mediaInfo.title}`);
            } else {
                vscode.window.showInformationMessage(`You gave Thumbs up on ${wnp.mediaInfo.title}`);
            }
            wnp.control.toggleThumbsUp();
        }),

        vscode.commands.registerCommand("wnpvscode.toggleThumbsDown", () => {
            if (wnp.mediaInfo.rating === 1) {
                vscode.window.showInformationMessage(`You removed Thumbs down on ${wnp.mediaInfo.title}`);
            } else {
                vscode.window.showInformationMessage(`You gave Thumbs down on ${wnp.mediaInfo.title}`);
            }
            wnp.control.toggleThumbsDown();
        })
    )
}