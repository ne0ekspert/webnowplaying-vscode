// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

/*
 * Copyright (c) 2023
 * WebNowPlaying by keifufu
 * All rights reserved.
 *
 * This code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */
import { WNPRedux } from './WNPRedux';
import { pushCommands } from './commands';

import webview from './webview';
import { updateIcons, updateLyrics } from './WNPCallbacks';

const configuration = vscode.workspace.getConfiguration();
const priority: number = configuration.get("WebNowPlaying.priority") || 0;
const webNowPlaying: WNPRedux = new WNPRedux(configuration.get('WebNowPlaying.host') || "127.0.0.1", configuration.get('WebNowPlaying.port') || 1234, '1.0.0');

const statusBarAlign = configuration.get('WebNowPlaying.alignToRight') ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;
const infoLabel = vscode.window.createStatusBarItem(statusBarAlign, priority);
const volumeLabel = vscode.window.createStatusBarItem(statusBarAlign, priority);
const lyricsLabel = vscode.window.createStatusBarItem(statusBarAlign, priority)
const prevButton = vscode.window.createStatusBarItem(statusBarAlign, priority);
const nextButton = vscode.window.createStatusBarItem(statusBarAlign, priority);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const webctrl = new webview(context);

    infoLabel.text = '$(sync~spin) Connecting to WebNowPlaying-Redux...';
    infoLabel.command = "wnpvscode.togglePlayMusic";
    volumeLabel.text = '$(unmute) 100%';
    volumeLabel.command = "wnpvscode.toggleMute";

    prevButton.text = '$(chevron-left)';
    prevButton.command = "wnpvscode.prevMusic";
    nextButton.text = '$(chevron-right)';
    nextButton.command = "wnpvscode.nextMusic";

    context.subscriptions.push(
        infoLabel,
        volumeLabel,
        prevButton,
        nextButton
    );

    if (configuration.get('WebNowPlaying.showControl')) {
        prevButton.show();
        nextButton.show();
    } else {
        prevButton.hide();
        nextButton.hide();
    }

    infoLabel.show();

    if (configuration.get('WebNowPlaying.showVolume')) {
        volumeLabel.show();
    } else {
        volumeLabel.hide();
    }

    if (configuration.get('WebNowPlaying.showLyrics')) {
        lyricsLabel.show();
    } else {
        lyricsLabel.hide();
    }

    pushCommands(context, webNowPlaying);

    vscode.workspace.onDidChangeConfiguration((e) => {
        console.log("updated configuration: " + e);

        if (e.affectsConfiguration('WebNowPlaying.host') || e.affectsConfiguration('WebNowPlaying.port')) {
            vscode.window.showInformationMessage('Reloading Visual Studio Code is required to apply the configuration.', 'Reload Now')
            .then((value) => {
                if (value === "Reload Now") {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
    
        if (configuration.get('WebNowPlaying.showControl')) {
            prevButton.show();
            nextButton.show();
        } else {
            prevButton.hide();
            nextButton.hide();
        }
    
        if (configuration.get('WebNowPlaying.showVolume')) {
            volumeLabel.show();
        } else {
            volumeLabel.hide();
        }
    });

    webNowPlaying.on('update', () => {
        updateIcons(webNowPlaying, infoLabel, volumeLabel);
        if (configuration.get('WebNowPlaying.showLyrics')) {
            updateLyrics(webNowPlaying, lyricsLabel);
        }

        webctrl.update({
            title: webNowPlaying.mediaInfo.title,
            artist: webNowPlaying.mediaInfo.artist,
            album: webNowPlaying.mediaInfo.album,
            position: webNowPlaying.mediaInfo.position,
            positionSeconds: webNowPlaying.mediaInfo.positionSeconds,
            duration: webNowPlaying.mediaInfo.duration,
            durationSeconds: webNowPlaying.mediaInfo.durationSeconds,
            coverURL: webNowPlaying.mediaInfo.coverURL
        });
    });

}

// This method is called when your extension is deactivated
export function deactivate(): void {
    webNowPlaying.close();
}
