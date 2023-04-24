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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const webNowPlaying = new WNPRedux(1234, '1.0.0');
	const textLabel = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	textLabel.command = "wnpvscode.togglePlayMusic";

	vscode.commands.registerCommand("wnpvscode.prevMusic", () => {
		console.log('previous music');
		webNowPlaying.control.previous();
	});

	vscode.commands.registerCommand("wnpvscode.togglePlayMusic", () => {
		console.log('play/pause music');
		webNowPlaying.control.togglePlaying();
	});

	vscode.commands.registerCommand("wnpvscode.nextMusic", () => {
		console.log('next music');
		webNowPlaying.control.next();
	});

	setInterval(() => {
		textLabel.text = `$(play) ${webNowPlaying.mediaInfo.artist} - ${webNowPlaying.mediaInfo.title} [${webNowPlaying.mediaInfo.album}] ${webNowPlaying.mediaInfo.position} / ${webNowPlaying.mediaInfo.duration}`;
	}, 250);
	
	textLabel.show();

	context.subscriptions.push(textLabel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
