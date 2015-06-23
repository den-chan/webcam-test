# Simple RTC Webcam + chat

##Description
This is an anonymous, random-access, two-way webcam and chat. It can be used wherever WebRTC can. To use, simply visit the [webcam test] on Github Pages , accept microphone & webcam capture and sharing, and have someone else do the same. It's basically chatroulette with sound, so if it gets popular I'd avoid using it.

## Privacy
The [signaling server] is hosted at Heroku, pushing code found at [moonshine-server]. Only SDP data passes through this server - not your webcam, microphone, or chat - and no logs whatsoever are kept.

##License
&copy; den-chan 24 Jun 2015 in accord with GPLv3 license found at http://www.gnu.org/licenses/gpl-3.0.en.html

[webcam test]: https://den-chan.github.io/webcam-test/
[signaling server]: https://den-chan.herokuapp.com/
[moonshine-server]: https://github.com/den-chan/moonshine-server/