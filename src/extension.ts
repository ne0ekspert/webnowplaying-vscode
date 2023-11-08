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

const configuration = vscode.workspace.getConfiguration();
let webNowPlaying: WNPRedux = new WNPRedux(configuration.get('WebNowPlaying.host') || "127.0.0.1", configuration.get('WebNowPlaying.port') || 1234, '1.0.0');

const statusBarAlign = configuration.get('WebNowPlaying.alignToRight') ?
vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;
const infoLabel = vscode.window.createStatusBarItem(statusBarAlign, configuration.get('WebNowPlaying.priority'));
const volumeLabel = vscode.window.createStatusBarItem(statusBarAlign, configuration.get('WebNowPlaying.priority'));
const prevButton = vscode.window.createStatusBarItem(statusBarAlign, configuration.get('WebNowPlaying.priority'));
const nextButton = vscode.window.createStatusBarItem(statusBarAlign, configuration.get('WebNowPlaying.priority'));

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let previousVolume = webNowPlaying.mediaInfo.volume;

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

	// Commands
	let disposable: vscode.Disposable;

	disposable = vscode.commands.registerCommand("wnpvscode.prevMusic", () => {
		webNowPlaying.control.previous();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.togglePlayMusic", () => {
		switch (webNowPlaying.mediaInfo.state) {
			case "PLAYING":
				vscode.window.showInformationMessage(`Pausing ${webNowPlaying.mediaInfo.title}`);
				break;
			case "PAUSED":
				vscode.window.showInformationMessage(`Playing ${webNowPlaying.mediaInfo.title}`);
				break;
		}
		webNowPlaying.control.togglePlaying();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.nextMusic", () => {
		webNowPlaying.control.next();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.changeVolume", () => {
		vscode.window.showInputBox({
			placeHolder: '0-100 Volume...',
			value: String(webNowPlaying.mediaInfo.volume)
		}).then((volume) => {
			webNowPlaying.control.setVolume(Number(volume));
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.toggleRepeat", () => {
		switch (webNowPlaying.mediaInfo.repeatState) {
			case "NONE":
				vscode.window.showInformationMessage(`Enabling loop on ${webNowPlaying.mediaInfo.title}`);
			default:
				vscode.window.showInformationMessage(`Disabling loop on ${webNowPlaying.mediaInfo.title}`);
		}
		webNowPlaying.control.toggleRepeat();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.toggleShuffle", () => {
		webNowPlaying.control.toggleShuffle();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.toggleThumbsUp", () => {
		if (webNowPlaying.mediaInfo.rating === 5) {
			vscode.window.showInformationMessage(`You removed Thumbs up on ${webNowPlaying.mediaInfo.title}`);
		} else {
			vscode.window.showInformationMessage(`You gave Thumbs up on ${webNowPlaying.mediaInfo.title}`);
		}
		webNowPlaying.control.toggleThumbsUp();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand("wnpvscode.toggleThumbsDown", () => {
		if (webNowPlaying.mediaInfo.rating === 1) {
			vscode.window.showInformationMessage(`You removed Thumbs down on ${webNowPlaying.mediaInfo.title}`);
		} else {
			vscode.window.showInformationMessage(`You gave Thumbs down on ${webNowPlaying.mediaInfo.title}`);
		}
		webNowPlaying.control.toggleThumbsDown();
	});
	context.subscriptions.push(disposable);

	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('WebNowPlaying.host')) {
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
		const soundIcon = webNowPlaying.mediaInfo.volume > 0 ? '$(unmute)' : '$(mute)';
		const playIcon = webNowPlaying.mediaInfo.state === 'PLAYING' ? '$(play)' : '$(debug-pause)';
		const loopIcon = (() => {
			switch (webNowPlaying.mediaInfo.repeatState) {
				case 'ONE':
					return "$(issue-reopened)";
				case 'ALL':
					return "$(sync)";
				default:
					return "";
			}
		})();
		const shuffleIcon = webNowPlaying.mediaInfo.shuffle ? "$(remote)" : "";

		let text: string = configuration.get('WebNowPlaying.infoFormat') || "{artist} - {title}";
		text = text.replace('{play-icon}', playIcon)
				   .replace('{sound-icon}', soundIcon)
				   .replace('{loop-icon}', loopIcon)
				   .replace('{shuffle-icon}', shuffleIcon)

				   .replace('{artist}', webNowPlaying.mediaInfo.artist)
				   .replace('{album}', webNowPlaying.mediaInfo.album)
				   .replace('{title}', webNowPlaying.mediaInfo.title)
				   .replace('{duration}', webNowPlaying.mediaInfo.duration)
				   .replace('{position}', webNowPlaying.mediaInfo.position)
				   .replace('{volume}', String(webNowPlaying.mediaInfo.volume))
				   .replace('{rating}', String(webNowPlaying.mediaInfo.rating));

		if (configuration.get('WebNowPlaying.showControl')) {
			prevButton.show();
			nextButton.show();
		} else {
			prevButton.hide();
			nextButton.hide();
		}

		infoLabel.text = text;
		infoLabel.show();

		if (configuration.get('WebNowPlaying.showVolume')) {
			volumeLabel.show();
		} else {
			volumeLabel.hide();
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate(): void {
	webNowPlaying.close();
}
