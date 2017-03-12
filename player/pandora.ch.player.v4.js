/************************************************
*  Name              :  pandora.ch.player.v1.js
*  Current Version   :  0.0.0.1
*  Create by Date    :  2011-08-24
*  Create by         :  ray.kim
*  Last Update Date  :  
*  Last Update By    :  
*  Description       :
*************************************************/

var icfCnt = 0; // 광고 호출 수 startPlay 함수에서 사용
var playby_cnt='';
var playby_time='';
var playby_channel='';
/* 플레이어 생성 START */
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
	chkCupiSec : 0,
	_icfCnt : 1,
	_IcfPlayTime : 1,
	_test : "",

	initialize : function(userid, prgid, test, sizeChange){

		if(test) {
			this._playUrl = 'http://imgcdn.pandora.tv/gplayer/test/pandora_ChannelPlayer_v1.swf?' + 'userid=' + userid + '&prgid=' + prgid + '&sizeChange=' + sizeChange;
			this._test = "y";
		} else {
			if(userid == "lolkmp_pm") {
				var randomInt = Math.floor(Math.random() * (1000 - 1) + 1);
				this._playUrl = 'http://cdn.pandora.tv/ongame/lol/swf/kmp/VodPlayer_Global_KMP.swf?preRoll=true&playertype=kmplol&serviceType=kmp&controllerType=ptv&' + 'userid=' + userid + '&prgid=' + prgid + '&sizeChange=' + sizeChange + "&ver=" + randomInt;

			}
			else {
				this._playUrl = 'http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_ChannelPlayer_v1.swf?' + 'userid=' + userid + '&prgid=' + prgid + '&sizeChange=' + sizeChange;
				//this._playUrl = 'http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_ChannelPlayer_v1_playlevel3.swf?' + 'userid=' + userid + '&prgid=' + prgid + '&sizeChange=' + sizeChange; //test용
			}
		}

		if(prgid) this._Prgid = prgid;

		if(sbsicf_cnt > 0) {
			/* SBS 영상 파라메터 추가 */
			this._playUrl += "&other=sbs";
			this._Sbs = "true";
		}

		if(test == "true") this._playUrl += "&test=true";

		var browserLang = cookieSet.GetCookie('clientLang') || "ko";
	},

	setCupi : function() {
		// 11026, 11036, 11046, 11126 채널레벨이면 기존에 cupi를 호출
		// cupi 추가. 페이지 로딩시 cupi 지급. hc.cho 2009.12.27, 광고를 보고 난 후 여기를 타지 않게 하기 위해 return 해 버림.	
		if (chInfoJson['chlv'] != '11026' && chInfoJson['chlv'] != '11126') {
			return false;
		}

		var oDate = new Date();
		var nowSec = Math.floor(oDate.getTime()/1000);
		if((nowSec - this.chkCupiSec) > 10) {
			this.chkCupiSec = nowSec;
		} else {// 10초 이내에 큐피 적립 요청을 하면 무시한다.
			return false;
		}
	
		var cupiUrl = "/json/v003/GLGive.dll";
		if(videoSet['status'] == 30010) {
			var ch_userid = videoSet['orgChUserid'];
			var prgid = videoSet['orgPrgid'];
		} else {
			var ch_userid = chInfoJson.ch_userid;
			var prgid = videoSet['prgid'];
		}

		var json = {ch_userid:ch_userid,
		            prg_id:prgid,
		            isHD:((videoSet['vodType'] == 2) ? "2":"1"),
		            runtime:videoSet['currentTime']};

		jQuery('#cupiJson').val(jQuery.toJSON(json));

		jQuery('#fmCupiForm').attr("target", "frmCupiUpdate");
		jQuery('#fmCupiForm').attr("action", cupiUrl).submit();
		
		return true;
	},

	startPlay : function(){
		if(play_ing != false)
		{
			jQuery(".admov").css("display", "none");
			
			this._playHeight = "100%";
			var Obj = this;
			var _playObj = "";

			try {
				jQuery("#icfSkipDiv").css("display", "none");
				jQuery("#Endding").css("display", "none");
			} catch (e) {}

			try {
				jQuery("#flvIcf").css("display", "none");
				jQuery("#flvIcf").html("");
			} catch (e) { }

			try {
				jQuery("#flvIcf2").css("display", "none");
				jQuery("#flvIcf2").html("");
			} catch (e) { }


			try {
				jQuery("#shakeIcf").css("display", "none");
				jQuery("#shakeIcf").html("");
			} catch (e) { }

			this.setCupi();

			try {
				jQuery("#icfNoticeDiv").hide();
			} catch(e) {}

			if (playby_cnt == 2 && parseInt(rt, 10) >= playby_time*60 && extIcfJson['kind'] != "3") {
				playby_cnt--;
				// 광고 호출 이후 5초 동안에 반응이 없다면 변수를 true로 바꿔 준다.
				extConf = setTimeout(function() {
					exticfPlay = true;
					playerSet.startPlay(); /* ICF 오작동시 플레이 */
				}, 5*1000);

				loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@icf_02?edugrd="+classCode+"&keyword=" + chInfoJson.ch_userid + "&ref=" + encodeURIComponent(location.href) );
				return;
			}
	/*
			if (this._icfCnt == 3 && parseInt(rt, 10) >= 1*60 && extIcfJson['kind'] != "3") {
				this._icfCnt++;
				loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@icf_02?edugrd=&keyword=" + chInfoJson.ch_userid + "&ref=" + encodeURIComponent(location.href) );
				return;
			}
	*/

			//2012-10-29
			jQuery("#psh_top").css("z-index", "0");
			jQuery("#newRightContent").css("z-index", "2");
			
			if(extIcfSet == "midroll") {
				document.flvPlayer.end_extend_ad();
			} else {
				if (cookieSet.GetCookie('extSet') == "1"){ 
					extArea();
					jQuery("#divPlayer").css("margin","0 auto");
					jQuery("#watch-video").css("padding", "0");
				}else{
					jQuery("#psh_top").css({"z-index":"1"});
				}

				if(jQuery.browser.msie) _playObj = this.playerIE(this._playUrl, this._PlayerId);
				else _playObj = this.playerETC(this._playUrl, this._PlayerId);
				
				jQuery("#" + this._ViewerId).html(_playObj);
				start_ing = true;

				if(share_ing == true)
				{
					jQuery("#" + this._ViewerId).html('');
					jQuery("#fake_player").show();
					return;
				}

				try {
					jQuery("#HTML5").show();
				} catch (e) {}

				try {
					if (jQuery("#castArea").attr("castOK") == 1) {
						jQuery("#castArea").show();
					}
				} catch (e) { }

				setTimeout(function() {
					try {
						// mo control : start
					//	oMo.mo_play();
					} catch(e) {}
				}, 5000);
			}

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
		}
	},

	smartStart : function(ch_userid, prgid){
		
		var playSize = "100%";
		var Obj = this;
		var url = 'http://channel.pandora.tv/channel/video.ptv?m=getSmartData&ch_userid=' + ch_userid + '&prgid=' + prgid + "&jsoncallback=?";
		$.ajax({ 
			url: url,
			type : 'post',
			dataType : 'jsonp',
			success : function(res){
				// 추가 부분 2013-10-24		

				try { playSize = $("#divPlayer").height() - 29; } catch(err) {}

				try {
					with( eventClass ) {
						_conType = 'video';	// video Or audio
						vTargetDiv = 'divPlayer';
						vHeight = playSize+"px";
						vSrc = res.vodSrc;
						vTime = res.runtime;
						vFlashUrl = 'http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_ChannelPlayer_v1.swf?userid=' + ch_userid + '&prgid=' + prgid;
						imgSrc = res.Thumb;
						//_vOptF = true;
						vOptArr = {
								'v240':'', 
								'v336':'', 
								'v480':'', 
								'v720':''
						};
						
						drawFunc();
					}
					
					$("#HTML5DIV").css("display", "block");
					if( navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) )
						$(".screen").css("height", "361px");
				} catch(err) { alert('start Error description : ' + err.description); }

				try {
					var os = res._os;//jQuery('#_os').val();
					var log_url = res.log_url;//jQuery('#log_url').val();
					logOk = false;
					playOK = false;					
					set_log(os, log_url);
				} catch(e) { console.log(e.description); }
			}
		});
	},
/*
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
	},
*/
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

	endding : function(Mode, ch_userid, prgid){
		jQuery(".admov").css("display", "block");
		var Obj = this;
		var endingStart = "";

		if( sbsicf_cnt == 0) endingStart = "endingDelay=on&";
		else endingStart = "sbs=true&";

		playerSet._playHeight = "100%";

		if(this._test)
			var strhtml = this.getAdPlayer("http://imgcdn.pandora.tv/gplayer/test/pandora_Endingstill_v2.swf?stillUrl="+escape("http://ads.pandora.tv/NetInsight/text/pandora/category/list@test_endding?edugrd=" + classCode + "&keyword=" + ch_userid)+"&stillTime=5&stillReCount=6&" + endingStart + "ending=" + Mode + "&ch_userid=" + ch_userid + "&prgid=" + prgid + "&sbs=" + this._Sbs, 'enddingPlayer');
		else
			var strhtml = this.getAdPlayer("http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_Endingstill_v2.swf?stillUrl="+escape("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@endding_still?edugrd=" + classCode + "&keyword=" + ch_userid)+"&stillTime=5&stillReCount=6&" + endingStart + "ending=" + Mode + "&ch_userid=" + ch_userid + "&prgid=" + prgid + "&sbs=" + this._Sbs, 'enddingPlayer');

		//jQuery("#" + this._IcfId).css({"width" : "640px", 'background-color':''});


		if (jQuery("#divPlayer").css("width") > "641") {
			jQuery(".admov").css({"width" : "970px", 'height':'546px', 'top':'0px', 'left':'5px', 'position':'absolute'});
			jQuery("#" + this._IcfId).css({'position':'absolute', "width" : "970px",'height':'546px', 'border':'#40454C', 'top':'0px','left':'0'});
		} else {
			jQuery(".admov").css({"width" : "640px", 'top':'0px', 'left':'0px', 'position':'absolute', 'height':'390px'});
			jQuery("#" + this._IcfId).css({"width" : "640px",'height':'390px', 'background-color':''});
		}
		
		/*
		if (cookieSet.GetCookie('extSet') == "1") {
			jQuery(".admov").css({"width" : "800px", 'top':'15px', 'left':'90px', 'position':'absolute', 'height':'480px'});
			jQuery("#" + this._IcfId).css({'position':'absolute', "width" : "800px",'height':'480px', 'border':'#40454C', 'top':'0px','left':'0'});
		} else {
			jQuery(".admov").css({"width" : "640px", 'top':'0px', 'left':'0px', 'position':'absolute', 'height':'390px'});
			jQuery("#" + this._IcfId).css({"width" : "640px", 'background-color':''});
		}
		*/
		jQuery("#" + this._IcfId).show();
		jQuery("#" + this._IcfId).html(strhtml);

		try {
			jQuery("#HTML5").hide();
		} catch (e) {}


		try {
			jQuery("#castArea").hide();
		} catch (e) { }

		//try { oMo.mo_stop(); } catch(e) {}
		try { 
			jQuery("#microAdDiv").hide();
			jQuery("#microAdDiv").html("");
			jQuery("#microAdDiv1").hide();
			jQuery("#microAdDiv1").html("");
		} catch(e) {}
	},

	endingAd : function(){
		if(this._test)
			loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/category/list@test_endding");
		else
			loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@endding_01");
	},

	endingNext : function(){
		endPlay();
	},

	videoShare : function(ch_userid, prgid){
		LayerAction.Share(ch_userid, prgid);
	},

	videoPlay : function(){
		var Obj = this;
		//try { oMo.mo_play(); } catch(e) {}
	},

	videoPause : function(){
		var Obj = this;
		//try { oMo.mo_stop(); } catch(e) {}
	},

	videoReplay : function(){
		jQuery(".admov").css("display", "none");
		try { 
			clearTimeout(setstartStill);
			jQuery("#Endding").css("display", "none");
		} catch(e) {}

		jQuery("#" + this._IcfId).html("");
		jQuery("#" + this._IcfId).hide();
		document.flvPlayer.reStart();

		//try { oMo.mo_play(); } catch(e) {}
	},

	endingReplay : function(){
		jQuery(".admov").css("display", "none");
		try { clearTimeout(setstartStill); } catch(e) {}
		jQuery("#" + this._IcfId).html("");
		jQuery("#" + this._IcfId).hide();
		document.flvPlayer.reStart();

		//try { oMo.mo_play(); } catch(e) {}
	},

	inVideo : function(Mode){
		if(Mode == "on") {
			if(jQuery("#microAdDiv").css("display", "inline")) {
				this._inVideo = "microAdDiv";
				jQuery("#microAdDiv").css("display", "none");
			} else if(jQuery("#microAdDiv1").css("display") == "inline") {
				this._inVideo = "microAdDiv1";
				jQuery("#microAdDiv1").css("display", "none");
			}
		} else {
			if(this._inVideo) jQuery("#" + this._inVideo).css("display", "inline");
		}
	},

	getAdPlayer : function(Url, objName, type){
		var _playObj = "";

		if(jQuery.browser.msie) _playObj = this.playerIE(Url, objName, type);
		else _playObj = this.playerETC(Url, objName, type);

		return _playObj;
	}

};
/* 플레이어 생성 END */