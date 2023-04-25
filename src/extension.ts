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
	const configuration = vscode.workspace.getConfiguration();
	const webNowPlaying = new WNPRedux(configuration.get('wnpvscode.port') || 1234, '1.0.0');
	const textLabelAlign = configuration.get('wnpvscode.alignToRight') ?
		vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;
	const textLabel = vscode.window.createStatusBarItem(textLabelAlign);
	textLabel.command = "wnpvscode.togglePlayMusic";

	vscode.commands.registerCommand("wnpvscode.prevMusic", () => {
		webNowPlaying.control.previous();
	});

	vscode.commands.registerCommand("wnpvscode.togglePlayMusic", () => {
		webNowPlaying.control.togglePlaying();
	});

	vscode.commands.registerCommand("wnpvscode.nextMusic", () => {
		webNowPlaying.control.next();
	});

	webNowPlaying.on('update', () => {
		let sound = webNowPlaying.mediaInfo.volume > 0 ? '$(unmute)' : '$(mute)';
		let play = webNowPlaying.mediaInfo.state === 'PLAYING' ? '$(play)' : '$(debug-pause)';
		textLabel.text = `${play} ${webNowPlaying.mediaInfo.artist} - ${webNowPlaying.mediaInfo.title} [${webNowPlaying.mediaInfo.album}] ${webNowPlaying.mediaInfo.position} / ${webNowPlaying.mediaInfo.duration} ${sound} ${webNowPlaying.mediaInfo.volume}%`;
	});
	
	textLabel.show();

	context.subscriptions.push(textLabel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
