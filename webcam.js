//Functions
//  Async GET json
function ajax(src) {
  return new Promise(function (respond) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() { if (xhr.readyState === 4 && xhr.status === 200) return respond(servers = JSON.parse(xhr.responseText)) };
    xhr.send();
  })
}
//  Connect websocket to exchange webRTC SDPs
function ws(uri) {
  return new Promise(function (resolve) {
    ws = new WebSocket(uri);
    ws.onopen = resolve;
    ws.onmessage = function(m) {
      var desc = JSON.parse(m.data);
      if (desc.type === "offer") rtc(desc);
      else if (desc.type === "answer") pc.setRemoteDescription(new RTCSessionDescription(desc))
    }
  })
}
//  Offer/answer webRTC with video + audio stream & chat on a data channel
function rtc (odesc) {
  pc = new RTCPeerConnection(/*servers*/{"iceServers": [{ "url": "stun:stun.l.google.com:19302" }]}, pcConstraint);
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
    dc.onmessage = function (e) { write(e.data, "remote") };
    dc.onclose = function () {};
  }
}
//  HTML escape utility
function escape (text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML
}
//  Reset main height to window height
function resize () { main.style.height = window.innerHeight + "px" }
//  Display chat message
function write (data, source) {
  var a = document.createElement("p");
  a.className = source + "msg";
  a.innerHTML = escape(data);
  display.appendChild(a);
  display.scrollTop = display.scrollHeight
}

//Variables
var
  nilfun = function () {},
  main = document.querySelector("main"),
  localvideo = document.querySelector("#local"),
  remotevideo = document.querySelector("#remote"),
  display = document.querySelector("#display"),
  input = document.querySelector("#input"),
  localMediaStream,
  ws, pc, dc, servers,
  pcConstraint = { optional: [{ "RtpDataChannels": false }] };

//Browser prefix reset
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
main.requestFullscreen = main.requestFullscreen || main.webkitRequestFullscreen || main.mozRequestFullScreen || main.msRequestFullscreen;

//Event listeners
window.addEventListener("resize", function() {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () { resolve(); window.dispatchEvent(new CustomEvent("opresize")) })
  })
});
window.addEventListener("opresize", resize);
main.addEventListener("dblclick", function (e) { main.requestFullscreen() });
input.addEventListener("keyup", function (e) {
  if (e.which === 13) {
    write(this.value, "local");
    dc.send(this.value);
    this.value = ""
  }
});

//Init
resize();
Promise.all([ ajax("stun.json"), ws("wss://den-chan.herokuapp.com/pair") ]).then(function () { rtc() })