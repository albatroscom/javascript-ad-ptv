/* adpandora :: start */
!function (name, context, definition) {
	if (typeof define == 'function') define(definition);
	else context[name] = definition();
}('adptv', this, function() {	
	var adptv = {};
	var _originalUrl = "";
	var _adPtvSkipChk = "";	//스킵여부
	var _adPtvSkipTime = 0;	//스킵타임
	var _adptvVideoHeight = "";	//영상영역 높이값
	var _link1 = "";	//페이스북 링크값
	var _link2 = "";	//트위터 링크값
	var _icfJsonpUrl = "";
	var _adUiObject = new Object();
	var _adStime = 0;
	var _adJasonData = {};
	var _adIconInterval = {};
	var _adIcfCheckTime = false;

	var _pandoraICF = false;

	adptv.request = function (icfData) {	

		_adJasonData = icfData;
		this._adJasonData = icfData;

		//console.log(_adJasonData);

		//console.log(codes);
		//매체 Video Play(에러 로직)
		if(typeof(icfData) == "undefined" || icfData == null || icfData == "" ){
			adptv.setError(-2);
			return;
		}
		// iPhone일 경우에 skip
		if(navigator.userAgent.match(/iPhone|IEMobile/i) !== null) {
			adptv.setError(-2);
			return;
		}
		
		// Android 4이하는 skip
		var androidUA = navigator.userAgent.match(/(?:(Android ))([^\\s;]+)/);
		if(androidUA !=null && androidUA.length === 3 && parseInt(androidUA[2].charAt(0), 10) < 4 ) {
			adptv.setError(-3);
			return;
		}

		// pandora 광고 skip
		if ( icfData.adSkip=="p" )	{
			adptv.setError(-1);
			return;
		} else if ( icfData.adSkip=="all" )	{
			//모든광고 skip
			adptv.setError(-2);
			return;
		} else if ( typeof(icfData.adSkip)=="undefined" || icfData.adUrlInfo == "" || icfData.adUrlInfo == null )	{
			//광고정보 없음 skip
			adptv.setError(-1);
			return;
		} else {

		}

		_adPtvSkipTime = icfData.vodSkip;

		if ( icfData.iconLink != "" && typeof(icfData.iconLink) != "undefined" && icfData.iconLink != null )
		{
			_link1 = icfData.iconLink.list[0].link;
			_link2 = icfData.iconLink.list[1].link;
		}

		if ( icfData.adUrlInfo["ch_userid"] && icfData.adUrlInfo["prg_id"] ) {
			_icfJsonpUrl = "/m/php/video.url.ptv?mode=video&ch_userid="+icfData.adUrlInfo["ch_userid"]+"&prgid="+icfData.adUrlInfo["prg_id"]+"&ref=m_main&lot=today&cate=010000&pcode=" + Math.floor(Math.random() * 100000);
		} else {
			_icfJsonpUrl = icfData.adUrlInfo["url"];
		}


		//채널 id, prg_id 
		if ( icfData.adUrlInfo["ch_userid"] && icfData.adUrlInfo["prg_id"] )
		{
			//_icfJsonpUrl = "http://channel.pandora.tv/video/php/php.player.query.api.php?prgid=39186302&ch_userid=red1052";
			//_icfJsonpUrl = "http://m.pandora.tv/m/php/video.url.ptv?mode=video&ch_userid=red1052&prgid=39186302&ref=m_main&lot=today&cate=010000&pcode=" + Math.floor(Math.random() * 100000);

			//console.log(_icfJsonpUrl);
			//_icfJsonpUrl = "http://m.pandora.tv/m/php/video.url.ptv?mode=video&ch_userid=&prgid=&ref=m_main&lot=today&cate=010000";

				jQuery.ajax({     
					url : _icfJsonpUrl,
					dataType:"json",
					crossDomain : true,			
					type: "GET",	
					error: function( jqXHR, textStatus, errorThrown ){},
					success : function(data){
						if (data['url'])
						{
							adptv.setLayer(data);
						} else {
							adptv.setError(0);
							//eventClass.adDawin();
						}
					},
					error: function(jqXHR, textStatus, errorThrown ){
						if(textStatus == "timeout"){
							//console.log("Ajax Timeout");					
							adptv.setError(0);							
						}else if(textStatus == "parsererror"){
							//console.log("Ajax parsererror");
							adptv.setError(0);
						}else{
							//console.log("Ajax Error");
							adptv.setError(0);									
						}						
					}
				});

			return;
		}

	};


	adptv.setLayer = function(json) {

		this._pandoraICF = true;
		if ( _adJasonData.ch_userid == "" && _adJasonData.prg_id == "" && _adJasonData.url == ""  )
		{
			adptv.setError(0);
			return;
		} 

		var _icfObj = "";
		var videoObj =   document.getElementById("video_player");
		var videoDiv = jQuery(videoObj);

		_originalUrl = videoDiv.find("source")[0].src;

		_adptvVideoHeight = videoDiv.height();

		videoDiv.find("source").remove();
		videoDiv.append('<source src="' + json.url +'" type="video/mp4" />');

		// 이걸 호출하지 않으면... Android Chrome에서 영상소스가 바뀌지 않음.
		videoObj.src = json.url;
		videoObj.load();

		videoObj.addEventListener('play', adptv.onPlay, false);
		videoObj.addEventListener('pause', adptv.onPause, false);
		videoObj.addEventListener('skip', adptv.onSkip, false);
		videoObj.addEventListener('ended', adptv.onEnded, false);
		videoObj.addEventListener('timeupdate', adptv.onTimeUpdate, false);
		videoObj.addEventListener('error', adptv.onError, false);

	};


	adptv.onPlay = function () {

		jQuery("#big_play, .hdvdo, .video_down, .bar, .nx_btn_area, #Application_Div, .full_screen, .gradient_bg").hide();

		var _icfObj = "";
		_icfObj += "<div class=\"ad_space\">";

		var adIconList = _adJasonData["iconLink"]["list"];

		for ( var i=0 ;  i < adIconList.length; i++ ) {
			if (adIconList[i]["link"] != "" && adIconList[i]["imgurl"] != "")
				_icfObj += '<div id="icon_'+i+'" style="display:none; z-index:999" ><a href="'+adIconList[i]["link"]+'" target="_blank"><img src="'+adIconList[i]["imgurl"]+'" ></a></div>';
		}

//		_icfObj += "	<!-- <p class=\"btn_b02 btn_gf01\"><a href=\"#\">Gift</a></p> 각 버튼별로 이미지가 01~03까지 제작되어있습니다.-->";
		_icfObj += "	<p class=\"btn_skip\"><a>광고 후<br />영상이 재생됩니다.</a></p>";
		_icfObj += "	<p class=\"btn_skip on\" style=\"display:none\"><a style=\"cursor:pointer;\"><strong id='skip_on'>Skip &gt;&gt;</strong></a></p>";
		_icfObj += "	<p class=\"ad_time\">광고 <span id=\"ad_currentTime\">00:00<span></p>";
		if (_adJasonData["clickUrl"])
		{
			_icfObj += "	<a href=\"\" target=\"_blank\"><p class=\"ad_bg\" src=\"" + _adJasonData["clickUrl"] + "\"></p></a><!-- 클릭 영역 -->";
		}
		_icfObj += "</div>";

		//console.log(_icfObj);

		jQuery("#adDivContent").html(_icfObj);


		// UI 완성 후 작업
		// 아이콘 이벤트
		for ( var i=0 ;  i < adIconList.length; i++ )
		{
			//console.log(_adJasonData["iconLink"]["time"][0]);
			//console.log(_adJasonData["iconLink"]["time"][1]);
			
			jQuery("#icon_" + i).delay( _adJasonData["iconLink"]["time"][0] * 1000 ).show("fast").css({"left":adIconList[i]["mobile_lot"][0], "top":adIconList[i]["mobile_lot"][1], "position":"absolute"});
			jQuery("#icon_" + i).fadeOut( _adJasonData["iconLink"]["time"][1] * 1000 );

			try {				
				jQuery("#icon_" + i).bind("click",function(){
					adptv.onEnded();
				});
			}
			catch ( e )	{ }

		}

		//video skip 
		if (_adJasonData["vodSkip"] > 0)	{

			setTimeout(function() {
				jQuery(".btn_skip").css("display", "none");
				jQuery(".btn_skip.on").css("display", "block");
			}, _adJasonData["vodSkip"] * 1000);

			// 스킵 버튼 클릭 이벤트
			try {
				jQuery("#skip_on").bind("click",function(){
					adptv.onEnded();
				});
			} catch(e) {}
		}

		if (_adJasonData["clickUrl"])
		{
			try {
				jQuery(".ad_bg").bind("click",function(){
					adptv.onEnded();
//					location.href = jQuery(this).attr("src");
				});
			} catch(e) {}
		}
		
//		try {
//			_adStime = parseInt(document.getElementById("video_player").duration);			
//		}
//		catch (e) {
//		}

		/* player 영역 높이값 조정 :: start */
		jQuery(".visual.nx_web").css("height","230px");
		jQuery(".ad_space").css("height","230px");
		jQuery("div.nx_player div.nx_btn_area").css("top", "204px");
		jQuery("div.nx_player div.bar").css("top", "210px");

		adptv._adplayTime = setInterval(function() {
			//_adStime--; 
			try { $("#newThumb").css("display", "none"); } catch(e) {}
			adptv.barControlF( window, Math.floor(document.getElementById("video_player").currentTime) );

			if (document.getElementById("video_player").duration > 0 && document.getElementById("video_player").duration <= document.getElementById("video_player").currentTime)
			{
				clearInterval(adptv._adplayTime);
				adptv.onEnded();
				return;
			}

//			console.log("ad time : " + _adStime + " trueView time : " + _adJasonData["trueView"]["time"] );

			if ( ( parseInt(_adJasonData["trueView"]["time"], 10) <= Math.floor(document.getElementById("video_player").currentTime) ) && _adIcfCheckTime == false) {
				console.log("pandora icf time check success");
				try {
					loadJsClass.loadJS(_adJasonData["trueView"]["link"]);
					_adIcfCheckTime = true;
				}
				catch ( e ){
					console.log("trueview check fail : " + e );
				}
			} 

		}, 100);

	};

	adptv.barControlF = function (event, ui) {
		$("#ad_currentTime").html(adptv.timeFunc(ui));
	};

	adptv.timeFunc = function(sTime) {
		var sTemp = "";
		if( sTime >= parseInt(60*60, 10) ) { // 시간
			var st = parseInt(sTime % (60*60), 10);
			sTemp = adptv.zeroFunc(parseInt(sTime / (60*60), 10)) + ":" + adptv.zeroFunc(parseInt(st / 60, 10)) + ":" + adptv.zeroFunc(parseInt(sTime % 60, 10));
		}
		else if( sTime >= 60 ) { // 분
			sTemp = adptv.zeroFunc(parseInt(sTime / 60, 10)) + ":" + adptv.zeroFunc(sTime % 60);
		}
		else {
			sTemp = "00:" + adptv.zeroFunc(sTime % 60);
		}
		
		return sTemp;
	};

	adptv.zeroFunc = function (strV) {
		return ( strV.toString().length > 1 ) ? strV : "0" + strV;			
	};

	adptv.onPause = function () {};

	adptv.onSkip = function() {

	};

	adptv.onEnded = function () {
		this._pandoraICF = false;
		//return;
		//alert("movie end");
		var videoObj =   document.getElementById("video_player");
		var videoDiv = jQuery(videoObj);

		videoObj.removeEventListener('play', adptv.onPlay, false);
		videoObj.removeEventListener('pause', adptv.onPause, false);
		videoObj.removeEventListener('ended', adptv.onEnded, false);
		videoObj.removeEventListener('timeupdate', adptv.onTimeUpdate, false);
		videoObj.removeEventListener('error', adptv.onError, false);

		//var oriMedia = jQuery(videoObj).find("source")[0].src;
		var changeMedia = _originalUrl  + "&pcode=" + Math.floor(Math.random() * 100000);

		videoDiv.find("source").remove();
		videoDiv.append('<source src="' + changeMedia +'" type="video/mp4" />');
		videoObj.removeAttribute("src");
		videoObj.src = changeMedia;

		//videoDiv.find("source").remove();
		//videoDiv.append('<source src="' + _originalUrl + '" type="video/mp4" />');
		
		// 이걸 호출하지 않으면... Android Chrome에서 영상소스가 바뀌지 않음.
		//videoObj.src = _originalUrl;

		jQuery('.ad_space').hide();
		try {
			if( !navigator.userAgent.match(/iPhone/i) ) {
				jQuery("#big_play").css("display", "none");
			}						
		}catch(e){}

		//재생 콘트롤바 보이기
		videoDiv.height(_adptvVideoHeight);
		eventClass._setAd = false;

		/* player 영역 높이값 조정 :: end */
//		jQuery(".visual.nx_web").css("height","200px");
//		jQuery(".ad_space").css("height","200px");
		jQuery("div.nx_player div.nx_btn_area").css("top", "174px");
		jQuery("div.nx_player div.bar").css("top", "180px");
		jQuery(".bar, .nx_btn_area, .full_screen, .gradient_bg").show();

		videoObj.load();
		videoObj.play();
	
	};

	adptv.onTimeUpdate = function () {};

	adptv.onError = function () {};

	adptv.setError = function(error){		
		//console.log("mezzo.setError START");
		
		eventClass._setAd = false;
		eventClass._setAdPlay = false;
		if(error === 0) {
			try {
				console.log("pandora 광고 Json 응답없음"); 
				eventClass.adDawin();
			} catch(e) { }
		}
		else if(error === -1) {
			try { 
				console.log("pandora 광고 없음"); 				
				eventClass.adDawin();
			} catch(e) { }
		} else if(error === -2) {
			try { 
				console.log("광고 전체 skip"); 				
				eventClass.vPlay();
			} catch(e) { }
		} else {

		}

	};

	return adptv;
});
/* adpandora :: end */


/* dawin :: start */
!function (name, context, definition) {
	if (typeof define == 'function') define(definition);
	else context[name] = definition();
}('dawin', this, function() {
	var dawin = {};
	dawin.promise = null;
	dawin.played = false;

	dawin.request = function(codes) {
		var dfd = jQuery.Deferred();
		dawin.promise = dfd.promise();

		// iPhone일 경우에 skip
		if(navigator.userAgent.match(/iPhone|IEMobile/i) !== null) {
			dfd.reject(-2);
			return;
		}

		// Android 4이하는 skip
		var androidUA = navigator.userAgent.match(/(?:(Android ))([^\\s;]+)/);
		if(androidUA !=null && androidUA.length === 3 && parseInt(androidUA[2].charAt(0), 10) < 4 ) {
			dfd.reject(-3);
			return;
		}

		var parseData = function(data) {
			var $xml = jQuery(data);
			var ret = {};

			var ad = parseInt($xml.find("Ad").attr("id"), 10);
			if(ad === -1) {
				// 전송할 광고가 없음.
				return;
			}

			ret.adTitle = $xml.find("AdTitle").text();
			ret.error = $xml.find("Error").text();	// Error시 ecd를 추가하여 전송할 url
			ret.duration = parseInt($xml.find("Duration").text(), 10);
			ret.browserMode = parseInt($xml.find("BrowserMode").text(), 10);

			var $trackingSkip = $xml.find("Tracking[event='skip']");
			var $trackingStart = $xml.find("Tracking[event='start']");
			var $trackingFirstQuartile = $xml.find("Tracking[event='firstQuartile']");
			var $trackingMidpoint = $xml.find("Tracking[event='midpoint']");
			var $trackingThirdQuartile = $xml.find("Tracking[event='thirdQuartile']");
			var $trackingComplete = $xml.find("Tracking[event='complete']");
			var $trackingPaytime = $xml.find("Tracking[event='paytime']");

			ret.tracking = {
				skip: {
					url: $trackingSkip.text(),
					rt: $trackingSkip.attr("rt"),
					ecd: 7
				},
				start: {
					url: $trackingStart.text(),
					rt: parseInt($trackingStart.attr("rt"), 10),
					lq: parseInt($trackingStart.attr("lq"), 10),
					ecd: 2
				},
				firstQuartile: {
					url: $trackingFirstQuartile.text(),
					rt: parseInt($trackingFirstQuartile.attr("rt"), 10),
					lq: parseInt($trackingFirstQuartile.attr("lq"), 10),
					ecd: 3
				},
				midpoint: {
					url: $trackingMidpoint.text(),
					rt: parseInt($trackingMidpoint.attr("rt"), 10),
					lq: parseInt($trackingMidpoint.attr("lq"), 10),
					ecd: 4
				},
				thirdQuartile: {
					url: $trackingThirdQuartile.text(),
					rt: parseInt($trackingThirdQuartile.attr("rt"), 10),
					lq: parseInt($trackingThirdQuartile.attr("lq"), 10),
					ecd: 5
				},
				complete: {
					url: $trackingComplete.text(),
					rt: parseInt($trackingComplete.attr("rt"), 10),
					lq: parseInt($trackingComplete.attr("lq"), 10),
					ecd: 6
				},
				paytime: {
					url: $trackingPaytime.text(),
					rt: parseInt($trackingPaytime.attr("rt"), 10),
					ecd: 8
				}
			};

			ret.clickThrough = $xml.find("ClickThrough").text();
			ret.clickTracking = $xml.find("ClickTracking").text();

			var $mediaFiles = $xml.find("MediaFiles");
			ret.mediaFile = {
				delivery: $mediaFiles.attr("delivery"),
				maintainAspectRatio: $mediaFiles.attr("maintainAspectRatio"),
				scalable: $mediaFiles.attr("scalable"),
				height: $mediaFiles.attr("height"),
				width: $mediaFiles.attr("width"),
				bitrate: $mediaFiles.attr("bitrate"),
				type: $mediaFiles.attr("type"),
				url: $mediaFiles.find("MediaFile").text()
			};

			var $icons = $xml.find("Icons");
			ret.iconCount = parseInt($icons.attr("count"), 10);
			ret.icons = [];

			$icons.find("Icon").each(function(index) {
				var $this = jQuery(this);
				var item = {
					program: $this.attr("program"),
					vt: parseInt($this.attr("vt"), 10),
					x_ratio: $this.attr("x_ratio"),
					y_ratio: $this.attr("y_ratio"),
					staticResource: $this.find("StaticResource").text(),
					iconClickThrough: $this.find("IconClickThrough").text(),
					iconClickTracking: $this.find("IconClickTracking").text()
				};

				if(item.program === "skip_description") {
					ret.iconSkipDescriptionIndex = index;
				}

				ret.icons.push(item);
			});

			return ret;
		};

		jQuery.ajax({
			type: 'get',
			timeout: 1500,
			dataType: 'xml',
			url: 'http://ads.dawin.tv/imp',
			data: {
				mcd: '157',
				gcd: '01040100',
				scd: '02020202',
				pcd: codes.pcd || '1',
				ccd: codes.ccd || '1',
				ver: '1.0'
			},
			success: function(data, textStatus, jqXHR) {
				var result = parseData(data);
				if(result) {
					dfd.resolve(result);
				}
				else {
					// id가 -1임.
					dfd.reject(-1);
				}
			},
			error: function() {
				// dawin 서버 응답없음.
				dfd.reject(0);
			}
		});

		return;
	};

	dawin.run = function(cbDone) {
		var donePayTime = false;
		var lastQuater = 0;
		var timeoutVideoPlay = 2500;
		var timerVideoPlay;
		var timerOrientation;

		// TODO 이 부분이 매체마다 다름.
		// -------------------------------------------------
		var isInIframe = false;
		var videoLoaded = true;
		var hasVideoTag = true;

		var videoObj =   document.getElementById("video_player");
		var videoWrapperSelector = ".nx_player";
		var videoWrapperSelector_fullHeight = ".visual.nx_web";

		var $el = jQuery(videoObj);
		var videoElementHeight = $el.height();
		// -------------------------------------------------

		dawin.promise
			.done(function(result) {
				// 성공하면.. Parsing XML Data, 계속 진행

				var overlayWindow;
				if(isInIframe) {
					overlayWindow = window.parent;
				}
				else {
					overlayWindow = window;
				}

				jQuery(".full_screen").hide();

				// result.mediaFile.url로 동영상을 바꿔둔다.
				if(hasVideoTag) {
					var poster = $el.attr("poster");
					var hasSourceTag = false;
					// video의 source url이 video[src]에 있는 지 video source[src]에 있는 지 확인해야 한다.
					if($el.find("source").length) {
						hasSourceTag = true;
					}

					var originalMedia;
					if(hasSourceTag) {
						originalMedia = $el.find("source")[0].src;
						$el.find("source").remove();
						$el.append('<source src="' + result.mediaFile.url +'" type="video/mp4" />');
						
						// 이걸 호출하지 않으면... Android Chrome에서 영상소스가 바뀌지 않음.
						videoObj.src = result.mediaFile.url;
					}
					else {
						originalMedia = videoObj.src;
						videoObj.src = result.mediaFile.url;
					}

					$el.data( "originalMedia", originalMedia );
				}
				else {
					videoObj.src = result.mediaFile.url;
				}

				//ray.kim 2014-04-17 모바일 코드 삽입
				originalMedia = originalMedia + "&pcode=" + Math.floor(Math.random() * 100000);

				$el.attr("poster", poster);

				// video overlay 화면을 만든다.
				function getOffsetSum(elem) {
					var top=0, left=0;
					while(elem) {
						top = top + parseInt(elem.offsetTop);
						left = left + parseInt(elem.offsetLeft);
						elem = elem.offsetParent;
					}
					return {top: top, left: left};
				}

				function getOrientation() {
					var isPortrait = true;
					isPortrait = overlayWindow.innerWidth / overlayWindow.innerHeight < 1.1;
					return isPortrait ? "portrait" : "landscape";
				}

				function onResize(e) {
					// 광고가 play중이면..			
					if(!videoObj.paused) {
						if(timerOrientation) {
							clearTimeout(timerOrientation);
						}
						timerOrientation = setTimeout(function() {

							var ele = overlayWindow.document.querySelector(videoWrapperSelector);
							var top = getOffsetSum(ele).top;

							var orientation = getOrientation();
							if(orientation === dawin.orientation) {
								return;
							}
							
							dawin.orientation = orientation;
							
							if(dawin.orientation === "landscape") {
								// 꽉 찬 화면..
								overlayWindow.document.querySelector("body").scrollTop = top;
								overlayWindow.jQuery(".dawin_overlay").css({
									top: 0,
									left: 0,
									height: '100%',
									right: 0
								});

								// Android Browser에 window의 width pixel 크기를 제대로 가져오지 못하는 버그가 있다.
								// Chrome에서는 정상적으로 동작한다.
								var fullHeight;
								if(overlayWindow.navigator.userAgent.match(/Chrome/i) === null) {
									fullHeight = (overlayWindow.outerHeight / overlayWindow.devicePixelRatio);
								}
								else {
									fullHeight = overlayWindow.innerHeight;
								}

								overlayWindow.jQuery(videoWrapperSelector_fullHeight).css({
									height: fullHeight
								});
								
								$el.height(fullHeight);

								// icon의 위치도 변경해야 함.
								//dawin_first_icon
								var $icon;
								$icon = overlayWindow.jQuery("#dawin_first_icon");
								if($icon.length) {
									$icon.css({

									});
								}
							}
							else {
								// 원래대로
								overlayWindow.document.querySelector("body").scrollTop = top;
								overlayWindow.jQuery(".dawin_overlay").css({
									top: 0,
									left: 0,
									right: 0,
									height: '100%'
								});

								overlayWindow.jQuery(videoWrapperSelector_fullHeight).css({
									height: ""
								});
								
								$el.height(videoElementHeight+40);

								// icon의 위치도 변경해야 함.
							}
						}, 300);
					}
				};

				// TODO 이 부분이 매체마다 다름.
				// -------------------------------------------------
				var ele = overlayWindow.document.querySelector(videoWrapperSelector);
				overlayWindow.jQuery(".dawin_overlay").remove();

				var top = getOffsetSum(ele).top;
				overlayWindow.jQuery(videoWrapperSelector).prepend("<div class='dawin_overlay' style='display:none;position:absolute;left:0;top:0;right:0;height:100%;z-index:9999'></div>");
				// -------------------------------------------------

				var dawin_onPlay = function() {
					overlayWindow.jQuery(window).bind("resize", onResize);

					//Ray.Kim 재생 콘트롤바 보이기 2013-12-18
					// 버튼들을 지운다.
					jQuery("#big_play, .hdvdo, .video_down, .bar, .nx_btn_area, #Application_Div, .full_screen, .gradient_bg").hide();
//					jQuery(".visual").css({height: '200px'});

					// 가로면 보정해야함.
					
					dawin.orientation = getOrientation();
					if(dawin.orientation === "landscape") {
						//window.scrollTo(0, 1);

						//video의 top만큼 스크롤한다.
						var ele = overlayWindow.document.querySelector(videoWrapperSelector);
						var top = getOffsetSum(ele).top;
						overlayWindow.document.querySelector("body").scrollTop = top;
						overlayWindow.jQuery(".dawin_overlay").css({
							top: 0,
							left: 0,
							height: '100%',
							right: 0
						});

						// Android Browser에 window의 width pixel 크기를 제대로 가져오지 못하는 버그가 있다.
						// Chrome에서는 정상적으로 동작한다.
						var fullHeight;
						if(overlayWindow.navigator.userAgent.match(/Chrome/i) === null) {
							fullHeight = (overlayWindow.outerHeight / overlayWindow.devicePixelRatio);
						}
						else {
							fullHeight = overlayWindow.innerHeight;
						}

						overlayWindow.jQuery(videoWrapperSelector_fullHeight).css({
							height: fullHeight
						});
						
						$el.height(fullHeight);
					}

					overlayWindow.jQuery(".dawin_overlay").show();
				};

				var dawin_onPause = function(e) {
					// 광고 재생중에 pause가 올 때 (전원버튼을 누른 경우 등)
					// 컨텐츠 영상으로 전환한다.
					if(videoObj.ended === false) {
						ended();
						videoObj.pause();
						$el.attr("poster", poster);
					}
				};
				
				var timeoutVideoPlayCallback = function() {
					console.log("광고동영상 timeout");
					videoObj.pause();
					ended();
				};

				var ended = function(state) {
					clearTimeout(timerVideoPlay);
					clearTimeout(timerOrientation);

					// 본 영상으로 돌아감.
					videoObj.removeEventListener('play', dawin_onPlay, false);
					videoObj.removeEventListener('pause', dawin_onPause, false);
					videoObj.removeEventListener('ended', dawin_onEnded, false);
					videoObj.removeEventListener('timeupdate', dawin_onTimeUpdate, false);
					videoObj.removeEventListener('error', dawin_onError, false);

					overlayWindow.jQuery(window).unbind("resize", onResize);

					overlayWindow.jQuery(videoWrapperSelector_fullHeight).css({
						height: ""
					});

					overlayWindow.jQuery(".dawin_overlay").remove();

					dawin.played = true;
					cbDone();

					if(hasVideoTag) {
						if(hasSourceTag) {
							videoObj.removeAttribute("src");
							$el.find("source").remove();
							$el.append('<source src="' + originalMedia +'" type="video/mp4" />');
						}
						else {
							videoObj.src = originalMedia;
						}

						videoObj.load();
						videoObj.play();
					}
					else {
						jQuery(videoObj).remove();
					}

					//Ray.Kim 재생 콘트롤바 보이기 2013-12-18
					try {
						$el.height(videoElementHeight);
						eventClass._setAd = false;
//						jQuery(".visual").css({height: '200px'});
						jQuery(".bar, .nx_btn_area, .full_screen").show();
					} catch (e) {}
				};

				var dawin_onEnded = function() {
					ended();
				};

				var curTime = 0, oldTime = -1;

				var dawin_onTimeUpdate = function(e) {
					curTime = parseInt(videoObj.currentTime, 10);

					if(!videoObj.duration) return;

					if(oldTime !== curTime) {
						oldTime = curTime;

						// 1. icon의 vt에 맞게 icon을 표시
						jQuery.each(result.icons, function(index, icon) {
							if(icon.vt === curTime) {
								var $img = overlayWindow.jQuery(".dawin_overlay img");
								$img.eq(index).show();

								if(icon.program === "skip") {
									// "skip_description" icon을 hide한다.
									if(result.iconSkipDescriptionIndex !== undefined) {
										$img.eq(result.iconSkipDescriptionIndex).hide();
									}
								}

							}
						});

						// 2. tracking event 처리
						var doTracking = function(trackingName) {
							if(result.tracking[trackingName].rt === curTime) {
								if(result.tracking[trackingName].lq) {
									lastQuater = result.tracking[trackingName].lq;
								}

								console.log(trackingName);

								if(trackingName === "paytime") {
									donePayTime = true;
								}

								jQuery.get( result.tracking[trackingName].url )
									.fail(function() {
										jQuery.get( result.error,
											{
												ecd : result.tracking[trackingName].ecd
											}
										);
									});
							}
						};

						var trackings = ["start", "firstQuartile", "midpoint", "thirdQuartile", "complete", "paytime"];
						jQuery.each(trackings, function(index, trackingName) {
							doTracking(trackingName);
						});

						console.log("lq = " + lastQuater);
					}

					// chrome에서는 이 조건을 타는 경우가 있음.
					if(timerVideoPlay) {
						clearTimeout(timerVideoPlay);
						timerVideoPlay = setTimeout(timeoutVideoPlayCallback, timeoutVideoPlay);
					}
				};

				var dawin_onError = function() {
					// 동영상 응답없으면 ErrorCode 1
					jQuery.get( result.error,
						{
							ecd : 1
						}
					);

					ended();
				};

				// clickThough에 해당하는 상품으로 이동
				var goToClickThroughUrl = function(clickThrough, clickTracking) {
					if(clickThrough && clickTracking) {

						// clickThrough 이 전화번호 형태면 tel로 변경한다.
						// 일단, :이 없으면 전화번호임.
						if(clickThrough.indexOf(":") === -1) {
							videoObj.pause();

							// 여기서 confirm ok일때만 아래를 호출하고..
							if(overlayWindow.confirm(clickThrough)) {
								ended();
								videoObj.pause();
								$el.attr("poster", poster);

								// 숫자 00-000-0000  -> tel:01089034454
								// 문자열에서 -를 제거한다.
								var tel = clickThrough.replace(/-/g,"");
								tel = "tel:" + tel;
								overlayWindow.open(tel, '_blank');

								$.get( clickTracking,
									{
										lq: lastQuater,
										pay: donePayTime ? 1 : 0
									}
								);
							}
							else {
								$el.attr("poster", poster);
								ended();
							}
						}
						else {
							ended();
							videoObj.pause();
							$el.attr("poster", poster);

							if(clickThrough.indexOf("market:") > -1) {
								overlayWindow.open(clickThrough, '_blank');

								$.get( clickTracking,
									{
										lq: lastQuater,
										pay: donePayTime ? 1 : 0
									}
								);
							}
							else if(clickThrough.indexOf("tstore:") > -1) {
								// tstore uri에서 pid를 추출하고
								var re = /tstore:\/\/PRODUCT_VIEW\/(\d{10})/;
								var mtc = re.exec(clickThrough);

								if(mtc.length !== 2) {
									console.error("tstore uri is invalid.");
									return;
								}

								// http 형식의 web page로 변경한 후 open한다.
								var tstoreUrl = "http://tsto.re/" + mtc[1];
								overlayWindow.open(tstoreUrl, '_blank');

								$.get( clickTracking,
									{
										lq: lastQuater,
										pay: donePayTime ? 1 : 0
									}
								);
							}
							else {
								overlayWindow.open(clickTracking + "&lq=" + lastQuater + "&pay=" + (donePayTime ? 1 : 0), '_blank');
							}
						}
					}
				};

				overlayWindow.jQuery(".dawin_overlay").on("click", function() {
					goToClickThroughUrl(result.clickThrough, result.clickTracking);
					return false;
				});

				videoObj.addEventListener('play', dawin_onPlay, false);
				videoObj.addEventListener('pause', dawin_onPause, false);
				videoObj.addEventListener('ended', dawin_onEnded, false);
				videoObj.addEventListener('timeupdate', dawin_onTimeUpdate, false);
				videoObj.addEventListener('error', dawin_onError, false);

				// 5. icon을 배치한다.
				// TODO: 매체마다 좌표가 다름
				jQuery.each(result.icons, function(index, icon) {
					var _a = jQuery("<a href='#'>"); // (추가) 이미지 버튼을 감쌀 A태그를 생성.
					var $icon = jQuery("<img src='" + icon.staticResource + "'>");
					$icon.css({
						display: "none",
						position: "absolute",
						left: icon.x_ratio + "%",
						width: "42px",
						height: "42px"
					});

					if(icon.x_ratio === "2" || icon.x_ratio === "1") {		// 첫번째 icon
						$icon.css({
							left: "5px"
						}).attr("id", "dawin_first_icon");
					}
					else if(icon.x_ratio === "10" || icon.x_ratio === "8") {	// 두번째 icon
						$icon.css({
							left: "47px"
						}).attr("id", "dawin_second_icon");
					}
					else if(icon.x_ratio === "19" || icon.x_ratio === "14") {	// 세번째 icon
						$icon.css({
							left: "89px"
						}).attr("id", "dawin_third_icon");
					}

					if(icon.program === "skip") {
						$icon.css({
							left: "initial",
							right: 0,
							width: "54px",
							height: "50px",
							bottom: "2%"
						}).attr("id", "dawin_skip_icon");
					}
					else if(icon.program === "skip_description") {
						$icon.css({
							left: "initial",
							right: 0,
							width: "155px",
							height: "52px",
							bottom: "2%",
							webkitTapHighlightColor: "rgba(0,0,0,0)"
						}).attr("id", "dawin_skip_description_icon");
					}
					else {
						$icon.css({
							bottom: "3%"
						});
					}

					//overlayWindow.jQuery(".dawin_overlay").append($icon);
					overlayWindow.jQuery(".dawin_overlay").append(_a.append($icon)); // (수정된 소스코드)

					$icon.on("click", function(e) {
						e.preventDefault(); // (추가)버튼 클릭시 A 태그의 기본 속성(href=#) 행동(페이지 이동)을 중지 시킴.
						if(icon.program === "skip") {
							jQuery.get( result.tracking.skip.url,
								{
									lq: lastQuater,
									pay: donePayTime ? 1 : 0
								}
							)
							.fail(function() {
								jQuery.get( result.error,
									{
										ecd: 7
									}
								);
							})
							.always(function() {
								videoObj.pause();
								$el.attr("poster", poster);
								ended();

								//Ray.Kim 재생 콘트롤바 보이기 2013-12-18
								try {
									$el.height(videoElementHeight);
									eventClass._setAd = false;
//									jQuery(".visual").css({height: '200px'});
									jQuery(".bar, .nx_btn_area, .full_screen, .gradient_bg").show();
								} catch (e) {}
							});
						}
						else {
							goToClickThroughUrl(icon.iconClickThrough, icon.iconClickTracking);
						}

						return false;
					});
				});

				if(!videoLoaded) {
					videoObj.load();
					videoObj.play();

					//Ray.Kim 재생 콘트롤바 보이기 2013-12-18
					try {
						$el.height(videoElementHeight);
						eventClass._setAd = false;
//						jQuery(".visual").css({height: '200px'});
						jQuery(".bar, .nx_btn_area, .full_screen, .gradient_bg").show();
					} catch (e) {}
				}
				
				dawin.play = function() {

					if(!dawin.played) {
						$el.removeAttr("controls");
						$el.removeAttr("poster");

						// 이때부터 setTimeout(2.5초를 시작해야함.) play()를 호출해도 동영상이 없을 때는 play event가 발생하지 않는 Browser(Chrome 31)도 있다. 
						if(timerVideoPlay) {
							clearTimeout(timerVideoPlay);
						}
						timerVideoPlay = setTimeout(timeoutVideoPlayCallback, timeoutVideoPlay);
					}
				};
			})
			.fail(function(error) {
				//Ray.Kim 재생 콘트롤바 보이기 2013-12-18
				try {
					eventClass._setAd = false;
//					jQuery(".visual").css({height: '200px'});
					jQuery(".bar, .nx_btn_area, .full_screen, .gradient_bg").show();
				} catch (e) {}

				if(error === -1) {
					console.log("dawin 광고없음.");
					eventClass.adMezzo();
				}
				else if(error === 0) {
					console.log("dawin 광고 xml 응답없음");
					eventClass.adMezzo();
				} else {
					// 아무 행위도 하지 않아야 함
				}

				if(!videoLoaded) {
					videoObj.load();
					videoObj.play();
				}

				dawin.played = true;
				cbDone();
			});
	};

	return dawin;
});
/* dawin :: end */


/* mezzo :: start */
// TODO-------------------------------------------------------------------------------------//
var mezzo_movie_api_domain = "http://mtag.mman.kr/mapi.mezzo";
var mezzo_movie_imps_domain = "http://mtag.mman.kr/sdkreturn.mezzo";

var mezzo_icon_path = "http://advimg.ad-mapps.com/ad_images/";
//-----------------------------------------------------------------------------------------//

!function (name, context, definition) {
	if (typeof define == 'function') define(definition);
	else context[name] = definition();
}('mezzo', this, function() {	
	var mezzo = {};
	
	mezzo.data = null;	
	
	// TODO -------------------------------------------------
	mezzo.isInIframe = false;
	mezzo.videoLoaded = true;
	mezzo.hasVideoTag = true;
	// ------------------------------------------------------
	
	mezzo.videoObj = null;
	mezzo.videoWrapperSelector = null;
	mezzo.videoWrapperSelector_fullHeight = null;
	mezzo.videoElementHeight = "";
	mezzo.poster = "";
	
	mezzo.mediaEvent = null;

	mezzo.mWindowID = null;
	mezzo.mAppID = null;
	mezzo.mCategory = null;
	
	mezzo.request = function(codes,mediaEvent) {
		//console.log(codes);
		//매체 Video Play(에러 로직)
		if(typeof(codes) == "undefined" || codes == null || codes == "" ){
			mezzo.setError(-2);
			return;
		}
		// iPhone일 경우에 skip
		if(navigator.userAgent.match(/iPhone|IEMobile/i) !== null) {
			mezzo.setError(-2);
			return;
		}
		
		// Android 4이하는 skip
		var androidUA = navigator.userAgent.match(/(?:(Android ))([^\\s;]+)/);
		if(androidUA !=null && androidUA.length === 3 && parseInt(androidUA[2].charAt(0), 10) < 4 ) {
			mezzo.setError(-3);
			return;
		}
		
		mezzo.mediaEvent = mediaEvent;
		
		var mWindowID = codes.mWindowID;
		var mAppID = codes.mAppID;
		var mCategory = codes.mCategory;
		
		//카테고리 정보 존재하는 경우만 요청 전달(카테고리 정보 필수)
		if(typeof(codes.mCategory)=='undefined'){
			mezzo.setError(-2);
			return;
		}
		
		mezzo.mWindowID = mWindowID;
		mezzo.mAppID = mAppID;
		mezzo.mCategory = mCategory;
		
		var mApiUrl = mezzo_movie_api_domain+"/"+mWindowID+""+mAppID+"?p_cate="+mCategory+"";
		
		$.ajax({     
			url : mApiUrl,
			dataType:"jsonp",
			crossDomain : true,			
			type: "GET",	
			timeout: 3000,			
			jsonpCallback : "json",
			error: function(jqXHR, textStatus, errorThrown ){
				if(textStatus == "timeout"){
					//console.log("Ajax Timeout");					
					mezzo.setError(0);							
				}else if(textStatus == "parsererror"){
					//console.log("Ajax parsererror");
					mezzo.setError(0);
				}else{
					//console.log("Ajax Error");
					mezzo.setError(0);									
				}						
			},
			success : function(data){		
			}
		});
		return;
	};
	
	mezzo.run = function(data){
		//console.log("mezzo.run START");
		//data = "";
		if(typeof(data) == "undefined" || data == null || data == "" ){
			mezzo.mediaEvent();
			return;
		}

		//노출 정보 전달
		var imps_url = mezzo_movie_imps_domain+"/"+mezzo.mWindowID+""+mezzo.mAppID+"?cmp_no="+data.cmp_no+"&ads_no="+data.ads_no+"&img_no="+data.img_no;
		API_Call(imps_url);
		
		var overlayWindow;
		if(mezzo.isInIframe) {
			overlayWindow = window.parent;
		}else {
			overlayWindow = window;
		}

		var $el = jQuery(mezzo.videoObj);
		mezzo.videoElementHeight = $el.height();
		
		// TODO 매체별 Layer 설정-------------------------------------------------
		var ele = overlayWindow.document.querySelector(mezzo.videoWrapperSelector);
		overlayWindow.jQuery(".mezzo_overlay").remove();
		overlayWindow.jQuery(mezzo.videoWrapperSelector).prepend("<div class='mezzo_overlay' style='display:none;position:absolute;left:0;top:0;right:0;width:100%;height:100%;z-index:9999'></div>");
		// -----------------------------------------------------------------------
		
		var videoWidth = overlayWindow.jQuery(".mezzo_overlay").css("width");
		var videoHeight = overlayWindow.jQuery(".mezzo_overlay").css("height");
		
		//console.log(videoWidth);
		//console.log(videoHeight);
		
		videoWidth = Number(videoWidth.split("px").join(""));
		videoHeight = Number(videoHeight.split("px").join(""));
		
		if(mezzo.hasVideoTag) {
			mezzo.poster = $el.attr("poster");
			//console.log("Poster = "+$el.attr("poster")); 
			var hasSourceTag = false;
			// video의 source url이 video[src]에 있는 지 video source[src]에 있는 지 확인
			if($el.find("source").length) {
				hasSourceTag = true;
			}

			var originalMedia;
			var mediaFileSrc = data.movie_api+videoWidth+"/"+videoHeight;
			//var mediaFileSrc = data.movie_api+"350"+"/0";
			//console.log(mediaFileSrc);
			if(hasSourceTag) {
				originalMedia = $el.find("source")[0].src;
				$el.find("source").remove();
				//$el.append('<source src="' + mediaFileSrc +'" type="video/mp4" />');
				mezzo.videoObj.src = mediaFileSrc;
			}else {
				originalMedia = mezzo.videoObj.src;
				mezzo.videoObj.src = result.mediaFile.url;	    			
			}
			$el.data( "originalMedia", originalMedia );
		}else {
			mezzo.videoObj.src = mediaFileSrc;
		}

		// video overlay 화면을 만든다.
		function getOffsetSum(elem) {
			var top=0, left=0;
			while(elem) {
				top = top + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;       
			}
			return {top: top, left: left};
		}
		
		function getOrientation() {
			var isPortrait = true;
			isPortrait = overlayWindow.innerWidth / overlayWindow.innerHeight < 1.1;
			return isPortrait ? "portrait" : "landscape";
		}
		
		function onMezzoResize(e) {
			//console.log("onMezzoResize START");
			if(!mezzo.videoObj.paused) {
				var isPortrait = true;
				isPortrait = overlayWindow.innerWidth / overlayWindow.innerHeight < 1.1;
				
				if(!isPortrait){	//가로
					var fullHeight = overlayWindow.innerHeight;
					overlayWindow.jQuery(mezzo.videoWrapperSelector_fullHeight).css({
						height: fullHeight+40
						
					});
					$el.height(fullHeight+40);
					
				}else{	//세로
					overlayWindow.jQuery(mezzo.videoWrapperSelector_fullHeight).css({
						height: ""						
					});
					
					$el.height(mezzo.videoElementHeight);
				}
				//videoWidth = overlayWindow.jQuery(".mezzo_overlay").css("width");
				//videoHeight = overlayWindow.jQuery(".mezzo_overlay").css("height");
				videoWidth = overlayWindow.jQuery(".mezzo_overlay").css("width");
				videoHeight = overlayWindow.jQuery(".mezzo_overlay").css("height");
				videoWidth = Number(videoWidth.split("px").join(""));
				videoHeight = Number(videoHeight.split("px").join(""));
				
				if(isPortrait){
					videoHeight = Number(videoHeight)-40;
				}
				setMezzoAdIcon();
			}
		};
		
		if(!mezzo.videoLoaded) {
			mezzo.videoObj.load();
			mezzo.videoObj.play();
		}
		
		$el.removeAttr("controls");
		$el.removeAttr("poster");
		
		mezzo.videoObj.load();
		mezzo.videoObj.play();
		
		var mezzoPlay = function(){
			//console.log("play");
			//시청 시작 API			
			API_Call(data.imps_api);
			mezzoADPlay();						
		};
		var mezzoPause  = function(){
			//console.log("mezzoPause");
			//console.log(mezzo.videoObj.ended);
			if(mezzo.videoObj.ended === false) {
				mezzoADEnd();
				mezzo.videoObj.pause();
				$el.attr("poster", mezzo.poster);
			}			
		};		
		var mezzoLoad = function(){
			//console.log("load");
		};
		var mezzoEnded = function(){
			//console.log("ended");
			//시청 완료 API
			API_Call(data.view_api);
			mezzoADEnd();			
		};
		var mezzoTimeUpdate = function(){
			//console.log("timeupdate");
		};
		var mezzoError = function(){
			//console.log("error");
			mezzoADEnd();
		};		
		
		var timer;		
		var skip_time = 0;
		var org_skip_time = 0;
		var second = 1;
		
		//시작
		var mezzoADPlay = function(){
			//console.log("mezzoADPlay START");
			overlayWindow.jQuery(window).bind("resize", onMezzoResize);
			skip_time = Number(data.skip);
			org_skip_time = Number(data.skip);
			
			// 버튼들을 지운다.
			jQuery("#big_play, .hdvdo, .video_down, .bar, .nx_btn_area, #Application_Div, .full_screen, .gradient_bg").hide();
			//jQuery(".visual").css({height: '160px'});
				
			setTimeout(function(){
				videoWidth = overlayWindow.jQuery(".mezzo_overlay").css("width");
				videoHeight = overlayWindow.jQuery(".mezzo_overlay").css("height");
				videoWidth = Number(videoWidth.split("px").join(""));
				videoHeight = Number(videoHeight.split("px").join(""));
				
				videoHeight = Number(videoHeight)-40;
												
				setMezzoAdIcon();
				
			},1000);
		};
		
		// 종료
		var mezzoADEnd = function(){
			//console.log("mezzoEnd START");
			clearInterval(timer);
			overlayWindow.jQuery(".mezzo_overlay").remove();
			overlayWindow.jQuery(window).unbind("resize", onMezzoResize);
			
			mezzo.videoObj.removeEventListener('play', mezzoPlay, false);
			mezzo.videoObj.removeEventListener('pause', mezzoPause, false);
			mezzo.videoObj.removeEventListener('ended', mezzoEnded, false);
			mezzo.videoObj.removeEventListener('timeupdate', mezzoTimeUpdate, false);
			mezzo.videoObj.removeEventListener('error', mezzoError, false);
			
			overlayWindow.jQuery(".mezzo_overlay").remove();

			mezzo.mediaEvent();
						
			try {
				overlayWindow.jQuery(mezzo.videoWrapperSelector_fullHeight).css({
					height: ""						
				});
				$el.height(mezzo.videoElementHeight);
				eventClass._setAd = false;
//				jQuery(".visual").css({height: '200px'});
				jQuery(".bar, .nx_btn_area, .full_screen, .gradient_bg").show();
			} catch (e) {}
			
			
			if(mezzo.hasVideoTag) {
				if(hasSourceTag) {
					$el.find("source").remove();
					//$el.append('<source src="' + originalMedia +'" type="video/mp4" />');
					//videoObj.src = originalMedia;
					mezzo.videoObj.src = originalMedia;
				} else {
					mezzo.videoObj.src = originalMedia;
				}

				//$el.attr("controls", true);
				mezzo.videoObj.load();
				mezzo.videoObj.play();
			}else {
				jQuery(mezzo.videoObj).remove();
			}
			
			
		};
		
		//아이콘 설정
		var setMezzoAdIcon = function(){
			//alert("mezzo.run setMezzoAdIcon");
			
			
			//클릭 아이콘
			var $clickIcon = jQuery("<img id='mezzo_click_icon' src='"+mezzo_icon_path+"btn_click.png"+"'>");
			var click_icon_width = videoWidth/5;
			click_icon_width = click_icon_width.toFixed(0);
			var click_icon_height = videoHeight/5.5;
			click_icon_height = click_icon_height.toFixed(0);
			$clickIcon.css({
				display: "block",
				position: "absolute",
				top: (videoHeight-click_icon_height-10)+"px",
				left: "0px",
				width: click_icon_width+"px",
				height: click_icon_height+"px"
			});
			//클릭 버튼 아이콘 클릭 이벤트
			$clickIcon.on("click",function(){
				//광고 시청 시간 API
				API_Call(data.click_api);
				if(second < 15){						
					API_Call(data.sec_api+"&sec="+second);
				}
				mezzoADEnd();					
				adRandingAction();
			});
			overlayWindow.jQuery("#mezzo_click_icon").remove();
			overlayWindow.jQuery(".mezzo_overlay").append($clickIcon);
			
			//console.log(data.hd_icon);
			//로고 아이콘
			if(data.hd_icon != ""){
				var $logoIcon = jQuery("<img id='mezzo_logo_icon' src='"+data.hd_icon+"'>");
				
				var logo_icon_width = videoWidth/6;
				logo_icon_width = logo_icon_width.toFixed(0);				
				$logoIcon.css({
					display: "block",
					position: "absolute",
					top: "5px",
					left: (videoWidth-logo_icon_width-10)+"px",
					width: logo_icon_width+"px"					
				});
				//로고 버튼 클릭 이벤트
				$logoIcon.on("click",function(){
					//광고 시청 시간 API
					API_Call(data.click_api);
					if(second < 15){						
						API_Call(data.sec_api+"&sec="+second);
					}
					mezzoADEnd();					
					adRandingAction();
				});
				
				overlayWindow.jQuery("#mezzo_logo_icon").remove();
				overlayWindow.jQuery(".mezzo_overlay").append($logoIcon);
			}
			//광고 클릭 처리 함수
			var adRandingAction = function (url){
				if(mezzo.hasVideoTag) {
					mezzo.videoObj.pause();
				}
				overlayWindow.open(data.randing_url, '_blank');
			};
			
			//스킵 아이콘			
			timer = setInterval(function () {
				overlayWindow.jQuery("#mezzo_skip_icon").remove();
				//console.log(second);						
				if (skip_time > 0) {
					var $skipIcon = jQuery("<img id='mezzo_skip_icon' src='"+mezzo_icon_path+"count_"+skip_time+".png'>");
					var skip_icon_width = videoWidth/9;
					skip_icon_width = skip_icon_width.toFixed(0);
					
					$skipIcon.css({
						display: "block",
						position: "absolute",
						top: (videoHeight-skip_icon_width-10)+"px",
						left: (videoWidth-skip_icon_width-10)+"px",
						width: skip_icon_width+"px",
						height: skip_icon_width+"px"
					});
					
					overlayWindow.jQuery("#mezzo_skip_icon").remove();
					overlayWindow.jQuery(".mezzo_overlay").append($skipIcon);
					
					/*if(org_skip_time == skip_time){						
						overlayWindow.jQuery(".mezzo_overlay").append($skipIcon);
					}else{
						overlayWindow.jQuery("#mezzo_skip_icon").remove();
						overlayWindow.jQuery(".mezzo_overlay").append($skipIcon);
					}*/
					
					skip_time--;
					
				} else if (skip_time == 0) {
					var $skipIcon = jQuery("<img id='mezzo_skip_icon' src='"+mezzo_icon_path+"btn_skip.png'>");
					var skip_icon_width = videoWidth/9;
					skip_icon_width = skip_icon_width.toFixed(0);
					
					$skipIcon.css({
						display: "block",
						position: "absolute",
						top: (videoHeight-skip_icon_width-10)+"px",
						left: (videoWidth-skip_icon_width-10)+"px",
						width: skip_icon_width+"px",
						height: skip_icon_width+"px"
					});
					// 스킵 버튼 클릭 이벤트
					$skipIcon.on("click",function(){
						//광고 시청 시간 API
						API_Call(data.sec_api+"&sec="+second);
						mezzoADEnd();
					});
					
					overlayWindow.jQuery("#mezzo_skip_icon").remove();
					overlayWindow.jQuery(".mezzo_overlay").append($skipIcon);
				}			
				second++;
			}, 1000); /* millisecond 단위의 인터벌 */
			
			overlayWindow.jQuery(".mezzo_overlay").show();
		};
					
		
		mezzo.videoObj.addEventListener("play", mezzoPlay, false);
		mezzo.videoObj.addEventListener("pause", mezzoPause, false);		
		mezzo.videoObj.addEventListener('ended', mezzoEnded, false);
		mezzo.videoObj.addEventListener('timeupdate', mezzoTimeUpdate, false);
		mezzo.videoObj.addEventListener('error', mezzoError, false);
	};
	
	mezzo.setError = function(error){		
		//console.log("mezzo.setError START");

		
		mezzo.videoLoaded = true;
		
		eventClass._setAd = false;
		eventClass._setAdPlay = false;
		if(error === -1) {
			try { console.log("Mezzo 광고 없음"); } catch(e) {}
		}
		else if(error === 0) {
			try { console.log("Mezzo 광고 Json 응답없음"); } catch(e) {}
		}

		//if(!mezzo.videoLoaded) {
		//	mezzo.videoObj.load();
		//	mezzo.videoObj.play();
		//}
	};
	
	mezzo.setSuccess = function(data){
		//console.log("mezzo setSuccess START");
		mezzo.data = data;
		// TODO 동영상 시작 Object ----------------
		var $a = $("#big_play");
		var $b = $("#playBtn");
		

		//mezzo.run(mezzo.data);//,eventClass.setEvent());

		$a.bind('click', function(event) {
			setTimeout(function(){
				try{
					//console.log(mezzo.data);
					if(typeof(mezzo.data) != "undefined" && mezzo.data != null && mezzo.data != "" ){						
//						mezzo.run(mezzo.data,eventClass.setEvent());	
						mezzo.run(mezzo.data);//,eventClass.setEvent());	
					}
				}catch(e){}
			},10);
		  $(this).unbind(event);
		});							
		
		$b.bind('click', function(event) {
			setTimeout(function(){
				try{
					//console.log(mezzo.data);
					if(typeof(mezzo.data) != "undefined" && mezzo.data != null && mezzo.data != "" ){						
						mezzo.run(mezzo.data);//,eventClass.setEvent());	
//						mezzo.run(mezzo.data,eventClass.setEvent());	
					}
				}catch(e){}
			},10);
		  $(this).unbind(event);
		});

		// ----------------------------------------
	};
		
	return mezzo;
});

function json(data){
	//console.log("json START");
	if(typeof(data)=="undefined" || data==""){		
		mezzo.setError(-1);
	}else{
		if(
			 typeof(data.cmp_no)=="undefined" || data.cmp_no==""
		  || typeof(data.ads_no)=="undefined" || data.ads_no==""
		  || typeof(data.img_no)=="undefined" || data.img_no==""
		  || typeof(data.movie_api)=="undefined" || data.movie_api==""
		  || typeof(data.click_api)=="undefined" || data.click_api==""
		  || typeof(data.randing_url)=="undefined" || data.randing_url==""
		  || typeof(data.imps_api)=="undefined" || data.imps_api==""
		  || typeof(data.view_api)=="undefined" || data.view_api==""
		  || typeof(data.sec_api)=="undefined" || data.sec_api==""
		  || typeof(data.skip)=="undefined" || data.skip==""
		){
			mezzo.setError(-1);			
		}else{
			//mezzo.setError(-1);
			mezzo.setSuccess(data);
		}
	}
}
	

// API Call
function API_Call(_url){
//	console.log("API_CALL START");
//	console.log(_url);
    $.ajax({     
		url : _url,
		dataType:"json",
		crossDomain : true,			
		type: "GET",	
		error: function( jqXHR, textStatus, errorThrown ){},
		success : function(data){}
	});
}
/* mezzo :: end */