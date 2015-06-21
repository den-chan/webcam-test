function ajax(src) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", src, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function() { if (xhr.readyState === 4 && xhr.status === 200) return xhr.responseText };
  xhr.send();
}
function rtc (odesc) {
  pc = new RTCPeerConnection(servers, pcConstraint);
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    localMediaStream = stream;
    if (!odesc) localvideo.src = window.URL.createObjectURL(localMediaStream);
    pc.addStream(localMediaStream);
    pc.onicecandidate = function (e) { if (e.candidate === null) ws.send( JSON.stringify(this.localDescription) ) };
    pc.onaddstream = function (e) { console.log("stream"); remotevideo.src = window.URL.createObjectURL(e.stream) };
    if (odesc) {
      pc.ondatachannel = function (e) { start(dc = e.channel || e) };
      pc.setRemoteDescription(new RTCSessionDescription(odesc), function () {
        pc.createAnswer( function (adesc) { pc.setLocalDescription(adesc) }, nilfun )
      }, nilfun)
    } else {
      start(dc = pc.createDataChannel('webcam', {reliable: true}));
      pc.createOffer(function (desc) { pc.setLocalDescription(desc, nilfun, nilfun) }, nilfun)
    }
  }, nilfun);
  function start(dc) {
    dc.onopen = function () { ws.close() };
    dc.onmessage = function (e) {
      var a = document.createElement("p");
      a.className = "remotemsg";
      a.innerHTML = escape(e.data);
      display.appendChild(a);
      display.scrollTop = display.scrollHeight
    };
    dc.onclose = function () {};
  }
}
function escape (text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML
}

var
  nilfun = function () {},
  main = document.querySelector("main"),
  localvideo = document.querySelector("#local"),
  remotevideo = document.querySelector("#remote"),
  display = document.querySelector("#display"),
  input = document.querySelector("#input"),
  localMediaStream,
  uri = "wss://den-chan.herokuapp.com",
  ws = new WebSocket(uri),
  pc, dc, 
  servers = ajax("stun.json"),
  pcConstraint = { optional: [{ "RtpDataChannels": false }] };

RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
main.requestFullscreen = main.requestFullscreen || main.webkitRequestFullscreen || main.mozRequestFullScreen || main.msRequestFullscreen;

main.addEventListener("dblclick", function (e) { main.requestFullscreen() });
input.addEventListener("keyup", function (e) {
  if (e.which === 13) {
    var a = document.createElement("p");
    a.className = "localmsg";
    a.innerHTML = escape(this.value);
    display.appendChild(a);
    display.scrollTop = display.scrollHeight;
    dc.send(this.value)
    this.value = "";
  }
});
ws.onopen = function () { rtc() };
ws.onmessage = function(message) {
  var desc = JSON.parse(message.data);
  if (desc.type === "offer") rtc(desc);
  else if (desc.type === "answer") pc.setRemoteDescription(new RTCSessionDescription(desc))
}