import * as vscode from 'vscode';
import * as fs from 'fs';

import { WNPRedux } from "./WNPRedux";

const configuration = vscode.workspace.getConfiguration();

function replaceMacros(wnp: WNPRedux, text: string) {
    const soundIcon = wnp.mediaInfo.volume > 0 ? '$(unmute)' : '$(mute)';
    const playIcon = wnp.mediaInfo.state === 'PLAYING' ? '$(play)' : '$(debug-pause)';
    const loopIcon = (() => {
        switch (wnp.mediaInfo.repeatState) {
            case 'ONE':
                return "$(issue-reopened)";
            case 'ALL':
                return "$(sync)";
            default:
                return "";
            }
    })();
    const shuffleIcon = wnp.mediaInfo.shuffle ? "$(remote)" : "";
        
    let newText = text;
    newText = newText.replace('{play-icon}', playIcon)
                .replace('{volume-icon}', soundIcon)
                .replace('{loop-icon}', loopIcon)
                .replace('{shuffle-icon}', shuffleIcon)

                .replace('{artist}', wnp.mediaInfo.artist)
                .replace('{album}', wnp.mediaInfo.album)
                .replace('{title}', wnp.mediaInfo.title)
                .replace('{duration}', wnp.mediaInfo.duration)
                .replace('{position}', wnp.mediaInfo.position)
                .replace('{volume}', String(wnp.mediaInfo.volume))
                .replace('{rating}', String(wnp.mediaInfo.rating));

    return newText;
}

export function updateIcons(wnp: WNPRedux, mainLabel: vscode.StatusBarItem, volumeLabel: vscode.StatusBarItem) {
    const infoText: string = configuration.get('WebNowPlaying.infoFormat') || "{artist} - {title}";
    const volumeText: string = configuration.get('WebNowPlaying.volumeFormat') || "{sound-icon} {volume}%";

    mainLabel.text = replaceMacros(wnp, infoText);
    mainLabel.show();

    volumeLabel.text = replaceMacros(wnp, volumeText);
    if (configuration.get('WebNowPlaying.showVolume')) {
        volumeLabel.show();
    } else {
        volumeLabel.hide();
    }
}

function parseLrc(content: string) {
    const lines = content.split('\n');
    const parsedLines: Array<{ timestamp: number; lyric: string }> = [];

    lines.forEach(line => {
        const match = line.match(/^\[(\d{2}):(\d{2})\.(\d+)\]/);
        if (match) {
            const [, minutes, seconds, milliseconds] = match;
            const timestamp = parseInt(minutes)*60 + parseInt(seconds);
            parsedLines.push({timestamp, lyric: line.replace(/^\[.*\]/, '')});
        }
    });

    return parsedLines;
}

function findClosestLyric(parsedLyrics: Array<{ timestamp: number; lyric: string }>, currentTime: number): string {
  let closestLyric = '';
  let minDiff = Infinity;

  parsedLyrics = parsedLyrics.filter((lyric) => lyric.timestamp <= currentTime);

  parsedLyrics.forEach(lyric => {
    const diff = Math.abs(currentTime - lyric.timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closestLyric = lyric.lyric;
    }
  });

  return closestLyric;
}

export function updateLyrics(wnp: WNPRedux, label: vscode.StatusBarItem) {
    const lyricsFolder = configuration.get('WebNowPlaying.lyricsFolder') || "";
    const lrcPath = `${lyricsFolder}${wnp.mediaInfo.artist} - ${wnp.mediaInfo.title}.lrc`;
    try {
        console.log(`Reading ${lrcPath}`);
        const lrcContent = fs.readFileSync(lrcPath, 'utf-8');
        
        console.log("Parsing LRC");
        const parsedLrc = parseLrc(lrcContent);
        console.log(parsedLrc);

        const closestLyric = findClosestLyric(parsedLrc, wnp.mediaInfo.positionSeconds);

        if (closestLyric) {
            label.text = closestLyric;
            label.show();
        } else {
            label.hide();
        }
    } catch {
        label.hide();
    }
}