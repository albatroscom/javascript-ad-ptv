/**
 * global variables
 */
var currentMedia = null;
var currentVolume = 0.5;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;
var timer = null;
var seekTime = 0;

var playType = "device"; // cast

/**
 * Call initialization
 */

 var castInterval	= null;
 var castTimeOut	= null;

jQuery(document).ready(function () { 
	if (!chrome.cast || !chrome.cast.isAvailable) {
		castInterval = setInterval(function () {initializeCastApi();}, 500);

		castTimeOut = setTimeout( function () {
			clearInterval(castInterval);
			console.log("chrome cast time out");
		}, 10*1000);
	}
});

/**
 * initialization
 */
function initializeCastApi() {

	try {
		// default app ID to the default media receiver app
		// optional: you may change it to your own app ID/receiver
		var applicationID = "9DE643C7";//"CE0D096D";//chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
		var sessionRequest = new chrome.cast.SessionRequest(applicationID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

		chrome.cast.initialize(apiConfig, onInitSuccess, onError);			

	} catch (e) { }

};

/**
 * initialization success callback
 */
function onInitSuccess() {
	appendMessage("init success");
	clearInterval(castInterval);
	clearInterval(castTimeOut);
}

/**
 * initialization error callback
 */
function onError(e) {
	console.log(e);
	console.log("error");
	appendMessage("error");
	clearInterval(castInterval);
	clearInterval(castTimeOut);
}

/**
 * generic success callback
 */
function onSuccess(message) {
	console.log(message);
}

/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
	console.log('Session stopped');
	appendMessage('Session stopped');
	document.getElementById("casticon").src = 'http://imgcdn.pandora.tv/ptv_img/newptv/ch/icon_cast_idle.png'; 

	playStart = false;
}

/**
 * session listener during initialization
 */
function sessionListener(e) {
	console.log(e);
	console.log('New session ID: ' + e.sessionId);
	appendMessage('New session ID:' + e.sessionId);
	session = e;
	if (session.media.length != 0) {
	  appendMessage(
	      'Found ' + session.media.length + ' existing media sessions.');
	  onMediaDiscovered('sessionListener', session.media[0]);
	}
	session.addMediaListener(
	  onMediaDiscovered.bind(this, 'addMediaListener'));
	session.addUpdateListener(sessionUpdateListener.bind(this));  
}

/**
 * session update listener 
 */
function sessionUpdateListener(isAlive) {
	var message = isAlive ? 'Session Updated' : 'Session Removed';
	message += ': ' + session.sessionId;
	appendMessage(message + ' , ' + isAlive);
	if (!isAlive) {
	  session = null;
	  document.getElementById("casticon").src = 'http://imgcdn.pandora.tv/ptv_img/newptv/ch/icon_cast_idle.png'; 
//    var playpauseresume = document.getElementById("playpauseresume");
//    playpauseresume.innerHTML = 'Play';
/*
	  if( timer ) {
	    clearInterval(timer);
	  }
	  else {
	    timer = setInterval(updateCurrentTime.bind(this), 1000);
	    playpauseresume.innerHTML = 'Pause';
	  }
*/
	playStart = false;
	}
};

/**
 * receiver listener during initialization
 */
function receiverListener(e) {
	if( e === 'available' ) {
		console.log("receiver found");
		console.log(e);
		appendMessage("receiver found");
		uiAdd('PC');
	}
	else {
		console.log("receiver list empty");
		appendMessage("receiver list empty");

		jQuery("#castList *").remove();
		jQuery("#castDiv").hide();
	}
}


/**
 * launch app and request session
 */
function launchApp() {
	console.log("launching app...");
	appendMessage("launching app...");
	chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
	if( timer ) {
	  clearInterval(timer);
	}
}

/**
 * callback on success for requestSession call  
 * @param {Object} e A non-null new session.
 */

var playStart = false;
function onRequestSessionSuccess(e) {
	console.log("session success: " + e.sessionId);
	appendMessage("session success: " + e.sessionId);
	session = e;
	document.getElementById("casticon").src = 'http://imgcdn.pandora.tv/ptv_img/newptv/ch/icon_cast_active.png'; 
	session.addUpdateListener(sessionUpdateListener.bind(this));  
	if (session.media.length != 0) {
	  onMediaDiscovered('onRequestSession', session.media[0]);
	}
	session.addMediaListener(
	  onMediaDiscovered.bind(this, 'addMediaListener'));
	session.addUpdateListener(sessionUpdateListener.bind(this));

	playSelect('TV');
	uiAdd('PC');
	jQuery("#castArea").show();
	return;
	uiAdd('add');//jQuery("<li onclick=\"playSelect('TV');\">TV에서 재생</li>").appendTo("#castList");
/*
	if (playStart == true)
	{
	  loadMedia();
	}
*/
}
var uiAddCheck = false;
function uiAdd(type) {
	if (type == "add") {
		if (uiAddCheck == false) {
			jQuery("#castList").append("<li onclick=\"playSelect('TV');\">TV에서 재생</li>");
			uiAddCheck = true;
		}
	} else if (type == "PC") {
		jQuery("#castList *").remove();
		jQuery("#castList").append("<li onclick=\"playSelect('PC');\" style=\"cursor:pointer;\"><img src=\"http://imgcdn.pandora.tv/ptv_img/newptv/ch/cast_stop.png\"></li>");

		jQuery("#castArea").attr("castOK", "1");

	} else {
		if (uiAddCheck == true) {
			jQuery("#castList *").remove();
			uiAddCheck = false;
		}
	}
}

/**
 * callback on launch error
 */
function onLaunchError() {
	console.log("launch error");
	appendMessage("launch error");
}

/**
 * stop app/session
 */
function stopApp() {
 	if (session != null) {

		session.stop(onStopAppSuccess, onError);
		if( timer ) {
		  clearInterval(timer);
		}
	} else {
		console.log('not run stopapp session null ');
	}

	jQuery("#castList *").remove();
	jQuery("#castDiv").hide();

	var request = new chrome.cast.media.PlayRequest();

	castAction.skip();
	castAction.play();
}

/**
 * load media specified by custom URL
 */
function loadCustomMedia() {
//	alert('d');
	var customMediaURL = document.getElementById('customMediaURL').value;
	if( customMediaURL.length > 0 ) {
	  loadMedia(customMediaURL);
	}
//	alert('end');
}

/**
 * load media
 * @param {string} i An index for media
 */
function loadMedia(mediaURL) {
	if (!session) {
		console.log("no session");
		appendMessage("no session");
		launchApp('loadMedia');
		return;
	}

	var urlParse = {};
	var _originalUrl = null;
	try {
		urlParse["baseurl"] = document.getElementById("flvPlayer").checkVideoURL().replace("@", "?").replace("&format=fsf", "").replace("flvchmt", "flvcast").replace("flvorgx", "flvcast").replace("skip", "skipreplace");
		urlParse["split"] = urlParse["baseurl"].split("?");
		console.log(urlParse["split"]);
		urlParse["argument"] = urlParse["split"][1].split("&");
		for (var i = 0; i < urlParse["argument"].length; i++) {
			var arr = urlParse["argument"][i].split("=");
			if (arr[0] == "skipreplace") {
				seekTime = arr[1];
			}
			urlParse["argument"][arr[0]] = arr[1];
		}

		_originalUrl = urlParse["baseurl"];//document.getElementById("flvPlayer").checkVideoURL().replace("@", "?").replace("&format=fsf", "").replace("flvchmt", "flvcast").replace("flvorgx", "flvcast").replace("skip", "skipreplace");
	} catch (e) { }

	if (!_originalUrl) {
		try {
			var videoObj = document.getElementById("video_player");
			var videoDiv = jQuery(videoObj);

			_originalUrl = videoDiv.find("source")[0].src;
		} catch(e) {}
	}

	if (!_originalUrl) {
		stopApp();
		jQuery("#castArea").hide();
		return;
	}
	console.log("media url :: " + _originalUrl);
	if (!mediaURL) {
		mediaURL = _originalUrl;// + "&pcode=" + Math.floor(Math.random() * 100000);
	}

	var title , thumb = "";
	try {
		title = sVodData["title"];
		thumb = eventClass["imgSrc"];
	} catch(e) {}

	/* pc web */
	try {
		title = videoSet["title"];
	} catch(e) {}
	try {
		thumb = jQuery('meta[property="og:image"]').attr("content");;
	} catch(e) {}

	if( mediaURL ) {
		if (playType == "TV") {
			console.log("loading..." + mediaURL);
			appendMessage("loading..." + mediaURL);
			var mediaInfo = new chrome.cast.media.MediaInfo(mediaURL);
			mediaInfo.contentType = 'video/mp4';
			var request = new chrome.cast.media.LoadRequest(mediaInfo);
			request.autoplay = true;
			request.currentTime = 0;

			var payload = {
			  "title:" : title,
			  "thumb" : thumb
			};

			var json = {
			  "payload" : payload
			};

			request.customData = json;

			session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError);
			castAction.pause();
//			seekTime = 50;
		} else {

			// ray.kim 2014-04-17 모바일 코드 삽입
			var videoObj =   document.getElementById("video_player");
			var oriMedia = jQuery(videoObj).find("source")[0].src;
			var changeMedia = oriMedia  + "&pcode=" + Math.floor(Math.random() * 100000);

			jQuery(videoObj).find("source").remove();
			jQuery(videoObj).append('<source src="' + changeMedia +'" type="video/mp4" />');
			videoObj.removeAttribute("src");
			videoObj.src = changeMedia;
			// end

			videoObj.load();
			eventClass.vPlay();
			stopApp();
		}
	} else {
		alert('not media');
	}

}

/**
 * callback on success for loading media
 * @param {Object} e A non-null media object
 */
function onMediaDiscovered(how, media) {
	console.log("new media session ID:" + media.mediaSessionId + ' (' + how + ')');
	appendMessage("new media session ID:" + media.mediaSessionId + ' (' + how + ')');
	currentMedia = media;
//  currentMedia.addUpdateListener(onMediaStatusUpdate);
	mediaCurrentTime = currentMedia.currentTime;
	//playpauseresume.innerHTML = 'Play';
	document.getElementById("casticon").src = 'http://imgcdn.pandora.tv/ptv_img/newptv/ch/icon_cast_active.png'; 
	if( !timer ) {
	  timer = setInterval(updateCurrentTime.bind(this), 1000);
//    playpauseresume.innerHTML = 'Pause';
	}
	if (how == "loadMedia") seekMedia();
}

/**
 * callback on media loading error
 * @param {Object} e A non-null media object
 */
function onMediaError(e) {
	console.log("media error");
	console.log(e);
	appendMessage("media error");
	document.getElementById("casticon").src = 'http://imgcdn.pandora.tv/ptv_img/newptv/ch/icon_cast_warning.png'; 
}

/**
 * callback for media status event
 * @param {Object} e A non-null media object
 */
function onMediaStatusUpdate(isAlive) {
	return;
	if( progressFlag ) {
	  document.getElementById("progress").value = parseInt(100 * currentMedia.currentTime / currentMedia.media.duration);
	  document.getElementById("progress_tick").innerHTML = currentMedia.currentTime;
	  document.getElementById("duration").innerHTML = currentMedia.media.duration;
	}
	document.getElementById("playerstate").innerHTML = currentMedia.playerState;
}

/**
 * Updates the progress bar shown for each media item.
 */
function updateCurrentTime() {
	if (!session || !currentMedia) {
	  return;
	}

	if (currentMedia.media && currentMedia.media.duration != null) {
	  var cTime = currentMedia.getEstimatedTime();
//    document.getElementById("progress").value = parseInt(100 * cTime / currentMedia.media.duration);
//  document.getElementById("progress_tick").innerHTML = cTime;
	}
	else {
//    document.getElementById("progress").value = 0;
//    document.getElementById("progress_tick").innerHTML = 0;
	  if( timer ) {
	    clearInterval(timer);
	  }
	}
};

/**
 * play media
 */
function playMedia() {
	if( !currentMedia ) 
	  return;

	if( timer ) {
	  clearInterval(timer);
	}

return;

	var playpauseresume = document.getElementById("playpauseresume");
	if( playpauseresume.innerHTML == 'Play' ) {
	  currentMedia.play(null,
	    mediaCommandSuccessCallback.bind(this,"playing started for " + currentMedia.sessionId),
	    onError);
	    playpauseresume.innerHTML = 'Pause';
	    appendMessage("play started");
	    timer = setInterval(updateCurrentTime.bind(this), 1000);
	}
	else {
	  if( playpauseresume.innerHTML == 'Pause' ) {
	    currentMedia.pause(null,
	      mediaCommandSuccessCallback.bind(this,"paused " + currentMedia.sessionId),
	      onError);
	    playpauseresume.innerHTML = 'Resume';
	    appendMessage("paused");
	  }
	  else {
	    if( playpauseresume.innerHTML == 'Resume' ) {
	      currentMedia.play(null,
	        mediaCommandSuccessCallback.bind(this,"resumed " + currentMedia.sessionId),
	        onError);
	      playpauseresume.innerHTML = 'Pause';
	      appendMessage("resumed");
	      timer = setInterval(updateCurrentTime.bind(this), 1000);
	    }
	  }
	}
}

/**
 * stop media
 */
function stopMedia() {
	if( !currentMedia ) 
	  return;

	currentMedia.stop(null,
	  mediaCommandSuccessCallback.bind(this,"stopped " + currentMedia.sessionId),
	  onError);
//  var playpauseresume = document.getElementById("playpauseresume");
//  playpauseresume.innerHTML = 'Play';
	appendMessage("media stopped");
	if( timer ) {
	  clearInterval(timer);
	}
}

/**
 * set media volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute 
 */
function setMediaVolume(level, mute) {
	if( !currentMedia ) 
	  return;

	var volume = new chrome.cast.Volume();
	volume.level = level;
	currentVolume = volume.level;
	volume.muted = mute;
	var request = new chrome.cast.media.VolumeRequest();
	request.volume = volume;
	currentMedia.setVolume(request,
	  mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
	  onError);
}

/**
 * set receiver volume
 * @param {Number} level A number for volume level
 * @param {Boolean} mute A true/false for mute/unmute 
 */
function setReceiverVolume(level, mute) {
	if( !session ) 
	  return;

	if( !mute ) {
	  session.setReceiverVolumeLevel(level,
	    mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
	    onError);
	  currentVolume = level;
	}
	else {
	  session.setReceiverMuted(true,
	    mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
	    onError);
	}
}

/**
 * mute media
 * @param {DOM Object} cb A checkbox element
 */
function muteMedia(cb) {
	if( cb.checked == true ) {
	  document.getElementById('muteText').innerHTML = 'Unmute media';
	  //setMediaVolume(currentVolume, true);
	  setReceiverVolume(currentVolume, true);
	  appendMessage("media muted");
	}
	else {
	  document.getElementById('muteText').innerHTML = 'Mute media';
	  //setMediaVolume(currentVolume, false);
	  setReceiverVolume(currentVolume, false);
	  appendMessage("media unmuted");
	} 
}

/**
 * seek media position
 * @param {Number} pos A number to indicate percent
 */
function seekMedia(pos) {
	var totRuntime = currentMedia.media.duration;

	if (!pos) {
		pos = seekTime * 100 / totRuntime;
	}

	console.log(currentMedia.media);
	console.log('Seeking ' + currentMedia.sessionId + ':' +
	  currentMedia.mediaSessionId + ' to ' + pos + "%");
	progressFlag = 0;
	var request = new chrome.cast.media.SeekRequest();
	request.currentTime = pos * currentMedia.media.duration / 100;
	currentMedia.seek(request,
	  onSeekSuccess.bind(this, 'media seek done'),
	  onError);
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function onSeekSuccess(info) {
	console.log(info);
	appendMessage(info);
	setTimeout(function(){progressFlag = 1},1500);
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function mediaCommandSuccessCallback(info) {
	console.log(info);
	appendMessage(info);
}


/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message) {
	var dw = document.getElementById("debugmessage");
	dw.innerHTML += '\n' + JSON.stringify(message);
//  alert('debug');
};



function chromecast() {
//	jQuery("#castDiv").show();
	if (session == null) {
		launchApp();
	} else {
		jQuery("#castDiv").show();
	}
}

function playSelect(type) {
	if ( type =="PC") {
		playType = type;
		stopApp();
	} else {
//		jQuery("#castDiv").hide();
		playType = type;
		console.log('type :: ' + type);
		loadMedia('');
	}
}


var castAction = {
	play : function () {
		document.getElementById("flvPlayer").playPlayer();
	}

	, pause : function () {
		document.getElementById("flvPlayer").pausePlayer();
	}

	, skip : function (t) {
		if (t == undefined || !t) {
			t = parseInt(currentMedia.currentTime, 10);
		}
console.log("skip time :: " + currentMedia.currentTime);
		t = parseInt(t, 10);

		document.getElementById("flvPlayer").skipPlayer(t);
	}

	, objSet : function () {
		
	}

}