playerSet = {
	_playUrl : "",
	_playWidth : "100%",
	_playHeight : "100%",
	_ViewerId : "divPlayer",
	_PlayerId : "flvPlayer",
	_EnddingId : "Endding",
	_IcfId : "flvIcf",
	_inVideo : "",
	_Sbs : "false",
	_Prgid : "false",

	initialize : function(userid, prgid, test, sizeChange){

		this._playUrl = 'http://imgcdn.pandora.tv/gplayer/brandPlayer.swf?' + 'userid=' + userid + '&prgid=' + prgid + '&sizeChange=' + sizeChange;	

		if(test == "true") this._playUrl += "&test=true";
		if(prgid) this._Prgid = prgid;

		var browserLang = cookieSet.GetCookie('clientLang') || "ko";
	},
	
	startPlay : function() {
		if(jQuery.browser.msie) _playObj = this.playerIE(this._playUrl, this._PlayerId);
		else _playObj = this.playerETC(this._playUrl, this._PlayerId);
		
		jQuery("#" + this._ViewerId).html(_playObj);

		if(this._Prgid) {
			// 영상 힛트수 높히기
			if(hitDelay == false) {
				hitDelayInterval = setTimeout(function() {	// 채널 최초 로딩시 브라우저 죽는 현상 대처를 위해 적용 : alan - 20080822
					hitDelay = true;
					prgHitAction();
				}, 3000);
			} else {
				prgHitAction();
			}

			setTimeout( function () {
				watchedVideo();	// 최근본 동영상에 담기
			}, 1000);
		}
	},
	playerIE : function(Url, objName, type){
		var _playObj = "";
		var _playUrls = "";
		var _wmode = "transparent";

		if (!type || type == undefined) {
			_playUrls = Url;
		} else if (type == 'Dicf') {
			_playUrls = Url;
		} else {
			//_playUrls = "http://imgcdn.pandora.tv/gplayer/category/icf_player_category.swf?lang=" + chInfoJson['language_code'] + "&" + Url;
			_playUrls = "http://imgcdn.pandora.tv/gplayer/icf_player_2.swf?" + Url;
		}

		_playObj += '<object id="'+objName+'" style="visibility:visible" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0" width="'+this._playWidth+'" height="'+this._playHeight+'" align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" >';
		_playObj += '<param name="movie" value="'+_playUrls+'" />';
		_playObj += '<param name="quality" value="high" />';
		_playObj += '<param name="play" value="true" />';
		_playObj += '<param name="loop" value="true" />';
		_playObj += '<param name="scale" value="noScale" />';
		_playObj += '<param name="wmode" value="'+_wmode+'" />';
		_playObj += '<param name="devicefont" value="false" />';
		_playObj += '<param name="bgcolor" value="#FFFFFF" />';
		_playObj += '<param name="menu" value="true" />';
		_playObj += '<param name="allowFullScreen" value="true" />';
		_playObj += '<param name="allowScriptAccess" value="always" />';
		_playObj += '<param name="salign" value="T" />';
		_playObj += '</object>';

		return _playObj;
	},

	playerETC : function(Url, objName, type){
		var _playObj = "";
		var _playUrls = "";
		var _wmode = "transparent";

		if (!type || type == undefined) {
			_playUrls = Url;
		} else if (type == 'Dicf') {
			_playUrls = Url;
		} else {
			//_playUrls = "http://imgcdn.pandora.tv/gplayer/category/icf_player_category.swf?lang=" + chInfoJson['language_code'] + "&" + Url;
			_playUrls = "http://imgcdn.pandora.tv/gplayer/icf_player_2.swf?" + Url;
		}

		_playObj += '<embed name="'+objName+'" id="'+objName+'" style="visibility:visible" pluginspage="http://www.macromedia.com/go/getflashplayer" width="'+this._playWidth+'" height="'+this._playHeight+'" align="middle"';
		_playObj += 'src="'+_playUrls+'"';
		_playObj += 'quality="high"';
		_playObj += 'play="true"';
		_playObj += 'loop="true"';
		_playObj += 'scale="noScale"';
		_playObj += 'wmode="'+_wmode+'"';
		_playObj += 'devicefont="false"';
		_playObj += 'bgcolor="#FFFFFF"';
		_playObj += 'menu="true"';
		_playObj += 'allowFullScreen="true"';
		_playObj += 'allowScriptAccess="always"';
		_playObj += 'salign="T" type="application/x-shockwave-flash">';
		_playObj += '</embed>';

		return _playObj;
	},

	smartStart : function(ch_userid, prgid){
		var Obj = this;
		var url = 'http://www.pandora.tv/video.ptv?m=smart_phone&ch_userid=' + ch_userid + '&prgid=' + prgid + "&jsoncallback=?";

		$.ajax({ 
			url: url,
			type : 'post',
			dataType : 'jsonp',
			success : function(res){
				jQuery("#" + Obj._ViewerId).html(res);

				try {
					var os = jQuery('#_os').val();
					var log_url = jQuery('#log_url').val();
					logOk = false;
					playOK = false;
					set_log(os, log_url);
				} catch(e) {}
			}
		});
	}
}