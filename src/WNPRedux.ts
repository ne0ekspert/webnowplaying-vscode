import { WebSocket, WebSocketServer } from 'ws';

class MediaInfo {
    private _title = '';
    private _state = 'STOPPED';
    private _volume = 0;
    webSocketID = '';
    player = '';
    artist = '';
    album = '';
    coverURL = '';
    duration = '0:00';
    durationSeconds = 0;
    position = '0:00';
    positionSeconds = 0;
    positionPercent = 0;
    rating = 0;
    repeatState = 'NONE';
    shuffle = false;
    timestamp = 0;

    get state() {
        return this._state;
    }

    set state(value: string) {
        this._state = value;
        this.timestamp = new Date().getTime();
    }

    get title() {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        if (value.length) {
            this.timestamp = new Date().getTime();
        } else {
            this.timestamp = 0;
        }
    }

    get volume() {
        return this._volume;
    }

    set volume(value: number) {
        this._volume = value;
        if (this._state === 'PLAYING') {
            this.timestamp = new Date().getTime();
        }
    }
}

export class WNPRedux {
    public mediaInfo = new MediaInfo();
    public clients = 0;
    
    private _mediaInfoDictionary: MediaInfo[] = [];
    private _recipients = [];
    private _version: String;
    private _server;

    public control: {
        togglePlaying: () => void,
        next: () => void,
        previous: () => void,
        setPositionSeconds: (seconds: number) => void,
        revertPositionSeconds: (seconds: number) => void,
        forwardPositionSeconds: (seconds: number) => void,
        setPositionPercent: (percent: number) => void,
        revertPositionPercent: (percent: number) => void,
        forwardPositionPercent: (percent: number) => void,
        setVolume: (volume: number) => void,
        toggleRepeat: () => void,
        toggleShuffle: () => void,
        toggleThumbsUp: () => void,
        toggleThumbsDown: () => void,
        setRating: (rating: number) => void,
    };

    constructor(port: number, version: string) {
        this._version = version;
        this._server = new WebSocket.Server({ port: port });
        this.control = {
            togglePlaying: () => {
                this.sendMessage('TOGGLE_PLAYING');
            },
            next: () => {
                this.sendMessage('NEXT');
            },
            previous: () => {
                this.sendMessage('PREVIOUS');
            },
            setPositionSeconds: (seconds: number) => {
                if (seconds < 0) {
                    seconds = 0;
                }
                if (seconds > this.mediaInfo.durationSeconds) {
                    seconds = this.mediaInfo.durationSeconds;
                }

                const positionInPercent = seconds / (this.mediaInfo.durationSeconds | 1);

                this.sendMessage(`SET_POSITION ${seconds}:${positionInPercent}`);   
            },
            revertPositionSeconds: (seconds: number) => {
                this.control.setPositionSeconds(this.mediaInfo.positionSeconds-seconds);
            },
            forwardPositionSeconds: (seconds: number) => {
                this.control.setPositionSeconds(this.mediaInfo.positionSeconds+seconds);
            },
            setPositionPercent: (percent: number) => {
                const seconds = Math.round((percent / 100) * this.mediaInfo.durationSeconds);
                this.control.setPositionSeconds(seconds);
            },
            revertPositionPercent: (percent: number) => {
                const seconds = Math.round((percent / 100) * this.mediaInfo.durationSeconds);
                this.control.setPositionSeconds(this.mediaInfo.positionSeconds-seconds);
            },
            forwardPositionPercent: (percent: number) => {
                const seconds = Math.round((percent / 100) * this.mediaInfo.durationSeconds);
                this.control.setPositionSeconds(this.mediaInfo.positionSeconds+seconds);
            },
            setVolume: (volume: number) => {
                if (volume < 0) {
                    volume = 0;
                }
                if (volume > 100) {
                    volume = 100;
                }
                this.sendMessage(`SET_VOLUME ${volume}`);
            },
            toggleRepeat: () => {
                this.sendMessage('TOGGLE_REPEAT');
            },
            toggleShuffle: () => {
                this.sendMessage('TOGGLE_SHUFFLE');
            },
            toggleThumbsUp: () => {
                this.sendMessage('TOGGLE_THUMBS_UP');
            },
            toggleThumbsDown: () => {
                this.sendMessage('TOGGLE_THUMBS_DOWN');
            },
            setRating: (rating: number) => {
                this.sendMessage(`SET_RATING ${rating}`);
            }
        };

        this._server.on("connection", ws => {
            this.clients = this._server.clients.size;
            ws.send(`ADAPTER_VERSION ${this._version};WNPRLIB_REVISION 1`);

            ws.on('message', (e) => {
                const message = e.toString();
                if (message.toUpperCase() === 'RECIPIENT') {

                }

                console.log(message);

                const messageType = message.slice(0, message.indexOf(' ')).toUpperCase();
                const info = message.slice(message.indexOf(' ') + 1);

                let currentMediaInfo = new MediaInfo();
                let found = false;

                if (!found) {
                    this._mediaInfoDictionary.push(currentMediaInfo);
                }

                console.log(messageType, info);

                switch (messageType) {
                    case 'PLAYER':
                        this.mediaInfo.player = info;
                        break;
                    case 'STATE':
                        this.mediaInfo.state = info;
                        break;
                    case 'TITLE':
                        this.mediaInfo.title = info;
                        break;
                    case 'ARTIST':
                        this.mediaInfo.artist = info;
                        break;
                    case 'ALBUM':
                        this.mediaInfo.album = info;
                        break;
                    case 'COVER':
                        this.mediaInfo.coverURL = info;
                        break;
                    case 'DURATION':
                        this.mediaInfo.duration = info;
                        this.mediaInfo.durationSeconds = this._convertTimeToSeconds(info);
                        this.mediaInfo.positionPercent = 0;
                        break;
                    case 'POSITION':
                        this.mediaInfo.position = info;
                        this.mediaInfo.positionSeconds = this._convertTimeToSeconds(info);

                        if (this.mediaInfo.durationSeconds > 0) {
                            this.mediaInfo.positionPercent = (this.mediaInfo.positionSeconds / this.mediaInfo.durationSeconds) * 100;
                        } else {
                            this.mediaInfo.positionPercent = 100;
                        }
                        break;
                    case 'VOLUME':
                        this.mediaInfo.volume = Number(info);
                        break;
                    case 'RATING':
                        this.mediaInfo.rating = Number(info);
                        break;
                    case 'REPEAT':
                        this.mediaInfo.repeatState = info;
                        break;
                    case 'SHUFFLE':
                        this.mediaInfo.shuffle = info.toUpperCase() === 'TRUE';
                        break;
                    case 'ERROR':
                        console.error(`WNPRedux - Browser Error: ${info}`);
                        break;
                    case 'ERRORDEBUG':
                        console.log(`WNPRedux - Browser Error Trace: ${info}`);
                        break;
                    default:
                        console.warn(`Unknown message type: ${messageType}; (${message})`);
                        break;
                }
            });
        });
    }

    public sendMessage(message: string) {
        this._server.clients.forEach(client => {
            client.send(message);
        });
    }

    private _convertTimeToSeconds(time: string): number {
        const durArr: string[] = time.split(':');
      
        // Duration will always have seconds and minutes, but hours are optional
        try {
          const durSec: number = Number(durArr[durArr.length - 1]);
          const durMin: number = Number(durArr[durArr.length - 2]) * 60 || 0;
          const durHour: number = Number(durArr[durArr.length - 3]) * 60 * 60 || 0;
          return durHour + durMin + durSec;
        } catch {
          return 0;
        }
      }
}