# WebNowPlaying-VSCode

## Features

Shows current music's artist, title, album, duration.

\!\[feature X\]\(images/feature-x.png\)

## Requirements

* VSCode
* WebNowPlaying-Redux Browser Extension

## Extension Settings

* `WebNowPlaying.host`: Host to listen on
* `WebNowPlaying.port`: Port to listen on
* `WebNowPlaying.alignToRight`: align status bar item to right
* `WebNowPlaying.priority`: Status bar item priority
* `WebNowPlaying.onClick`: Command to run when the item is clicked
* `WebNowPlaying.infoFormat`: Format of track info
* `WebNowPlaying.volumeFormat`: format of volume
  * `{play-icon}`: Shows `$(play)` icon if music is playing `$(debug-pause)` if paused
  * `{sound-icon}`: Shows `$(mute)` icon if volume is 0%, `$(unmute)` otherwise.
  * `{loop-icon}`: Shows `$(sync)` icon if playlist is in loop, `$(issue-reopened)` if a track is in loop, hidden otherwise
  * `{shuffle-icon}`: Shows `$(remote)` icon if shuffle is enabled
  * `{artist}`: Display artist
  * `{album}`: Display album
  * `{title}`: Display title of a track
  * `{duration}`: Display total time of a track like 0:00
  * `{position}`: Display elapsed time of a track like 0:00
  * `{volume}`: Display current volume 0 ~ 100
  * `{rating}`: Display rating

## Known Issues

## Release Notes

### 0.0.1

* Initial release

### 0.0.2

* changed `setInterval` to callback function
* changed configuration names
* changed command titles

### 0.0.3

* added configuration options
