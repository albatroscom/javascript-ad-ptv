		var EventHandler = {
		    bind : function(el, ev, fn){
		        if(window.addEventListener){ // modern browsers including IE9+
		            el.addEventListener(ev, fn, false);
		        } else if(window.attachEvent) { // IE8 and below
		            el.attachEvent('on' + ev, fn);
		        } else {
		            el['on' + ev] = fn;
		        }
		    },
	
		    unbind : function(el, ev, fn){
		        if(window.removeEventListener){
		            el.removeEventListener(ev, fn, false);
		        } else if(window.detachEvent) {
		            el.detachEvent('on' + ev, fn);
		        } else {
		            elem['on' + ev] = null;
		        }
		    },
	
		    stop : function(ev) {
		        var e = ev || window.event;
		        e.cancelBubble = true;
		        if (e.stopPropagation) e.stopPropagation();
		    }
		};
	
		var agentClass = {
			uAgent : "",
			dType : "",
			cAgentCheck : function() {
				this.uAgent = navigator.userAgent;
				if( this.uAgent.match(/iPad/i) || this.uAgent.match(/iPhone/i) || this.uAgent.match(/Android/i) )
					this.dType = "smart";
				else
					this.dType = "web";
				
				// Video Tag 사용 가능 
				this.dType = ( !!document.createElement('video').canPlayType ) ? "smart" : "web";
				
				return this.dType;
			}
		};
	
		var eventClass = {
			vObj : "",
			eName : new Array("click", "play1", "pause", "ended", "suspend", "progress", "loadstart", "stalled", "loadedmetadata", "loadeddata", "playing", "canplay", "seeking", "seeked", "dureationchange", "abort", "waiting", "error"),
			videoTag : "",
			vType : "",
			vSrc : "",
			imgSrc : "",
			vTime : 0,
			vWidth : "100%",
			vHeight : "100%",
			vTargetDiv : "videoDiv",
			vFlashUrl : "",
			_Volume : 50,
			_repeat : false,
			_setAd : false,
			_setAdPlay : false,
			_barHideChk : false,
			_sTime : 0,
			playTimeObj : '',
			controlViewTimeObj : '',
			ctViewTime : 0,
			uiObj : new Object(),
			_vOptF : true, // 화질선택
			_vOptFChk : false, // 화질선택
			_vOptFChkArr : {"v240":"", "v336":"", "v480":"", "v720":""},
			vOptArr : {"v240":"", "v336":"", "v480":"", "v720":""},
			_conType : "video",
			_fullCheckF : true,

			setEvent : function() {
				for( var i in this.eName) {
					if( this.eName[i] == "click" ) 
						this.eventListenerFunc(document, this.eName[i], this.clicksFunc);
					else						
						this.eventListenerFunc(this.vObj, this.eName[i], this.eventsFunc);
				}
			},
			
			clicksFunc : function(e) {
				
				try {
					switch ( e.target.className ){
						case "stop" : eventClass.vPause();		break;
						case "big_play" : case "play" : 

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
						break;
						case "full_screen" : eventClass.fullscreeChkFunc();	break;
						case "repeat on" :
						case "repeat" :
							if( eventClass._repeat == false ) {
								eventClass._repeat = true;
								$(".repeat").addClass("on");
							}else {
								eventClass._repeat = false;
								$(".repeat").removeClass("on");
							}
							break;
						case "off" :
						case "on" : 
							eventClass.vVolume();
							break;
						case "clsBitTxt" : 
							if ( eventClass._setAd == false)
							{
								jQuery(".clsBitrateSel").toggle();
							}
							break;
//						case "newThumbClk" : 
//							eventClass.vObj.play();
//							break;
						case "nx_player" : case "gradient_bg" :

							//영상 재생 하지 않았으면 바로 재생
							if (eventClass.playTimeObj == "") { 

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
							}

							jQuery(".nx_btn_area, div.nx_player div.bar, .full_screen, .gradient_bg").fadeIn("fast");

							if (eventClass._setAd == false)
							{
								eventClass.controlViewTimeObj = setInterval(function() {
									++eventClass.ctViewTime;
									
									if (eventClass.ctViewTime > 5)
									{
										eventClass.ctViewTime = 0;
										jQuery(".nx_btn_area, div.nx_player div.bar, .full_screen, .gradient_bg").fadeOut("fast");
										clearInterval(eventClass.controlViewTimeObj);
									}

								}, 1000);
							}

							break;
					}
					// 화질 선택 Button
					if( eventClass._vOptF ) {
						var oT = false;
						var videoObj = document.getElementById("video_player");
						var oriMedia = jQuery(videoObj).find("source")[0].src;
						switch( e.target.id ) {
							case "vO240" : 
								eventClass.vObj.src = eventClass.vOptArr.v240;
								jQuery(document.getElementById("video_player")).find("source")[0].src = eventClass.vOptArr.v240;
								videoObj.load();
								eventClass.vPlay();
								jQuery(".clsBitTxt").html("240P");
								oT = true;
								break;
							case "vO336" : 
								eventClass.vObj.src = eventClass.vOptArr.v336;
								jQuery(document.getElementById("video_player")).find("source")[0].src = eventClass.vOptArr.v336;
								videoObj.load();
								eventClass.vPlay();
								jQuery(".clsBitTxt").html("336P");
								oT = true;
								break;
							case "vO480" : 
								eventClass.vObj.src = eventClass.vOptArr.v480;
								jQuery(document.getElementById("video_player")).find("source")[0].src = eventClass.vOptArr.v480;
								videoObj.load();
								eventClass.vPlay();
								jQuery(".clsBitTxt").html("480P");
								oT = true;
								break;
							case "vO720" : 
								eventClass.vObj.src = eventClass.vOptArr.v720;
								jQuery(document.getElementById("video_player")).find("source")[0].src = eventClass.vOptArr.v720;
								videoObj.load();
								eventClass.vPlay();
								jQuery(".clsBitTxt").html("720P");
								oT = true;
								break;
						}
						if( oT ) {
							$(".clsBitrateSel li").removeClass("on");
							$("#" + e.target.id).addClass("on");
							jQuery(".clsBitrateSel").hide();
						}
					}
				} catch(e){ console.log("click event error"); }
			},
	
			eventListenerFunc : function(el, ev, fn) {
				EventHandler.bind(el, ev, fn);
			},
			
			getBufferedRange : function() {
				var tag = eventClass.vObj;
		        var range = '-';
		        if(tag.buffered.length) {
		            range = '';
		            for (var i=0; i<tag.buffered.length; i++) { 
		                range = Math.round(tag.buffered.end(i));
		            }
		        }
		        return range;
		    },
	
			eventsFunc : function(e) {
			//	console.log("event Type = " + e.type);
		
				switch( e.type ){
					case "loadstart" :	break;
					case "suspend" :	// video data 가져올때( load ) 실행						
						break;
					case "progress" :
						if(eventClass._setAd == false) {
							var loadingPercent = parseInt(eventClass.getBufferedRange() / eventClass.videoGetTimeFunc('T') * 100);
							$(".loading").width((loadingPercent < 100 ? loadingPercent : 100 ) + "%");						
							//$(".loading_bubble").html(eventClass.timeFunc(eventClass.getBufferedRange()));
						}
						break;
					case "loadedmetadata" :	break;						
					case "loadeddata" :
						if(eventClass._setAd == false) {
							eventClass.vObj.currentTime = parseFloat(eventClass._sTime);
						}
						break;
					case "canplay" :
						if(eventClass._setAd == false) {
							clearInterval(eventClass.playTimeObj);
							$("#vodeTime").html(eventClass.timeFunc(eventClass.videoGetTimeFunc('T')));
							$("#currentTime").html(eventClass.timeFunc(eventClass.videoGetTimeFunc('')));
							eventClass.vodTimeCtr();
							$(".play_bar").css("width", "0px");
							if( navigator.userAgent.match(/iPad/i) ) {
								$("#big_play").css("display", "none");
							}
						}
						break;
					case "playing" : 
					case "play" :
						if(eventClass._setAd == false) {

							$(".clsBitTxt").css("display", "block");

							try {
								jQuery(".hdvdo, .video_down, .btn_hd_web").hide();
							} catch (e) {}

							clearInterval(eventClass.playTimeObj);

							$("#playBtn").removeClass("play");
							$("#playBtn").addClass("stop");

							$("#vodeTime").html(eventClass.timeFunc(eventClass.videoGetTimeFunc('T')));
							$('.bar').slider({ max: eventClass.videoGetTimeFunc("T")});

							try {
								if( !navigator.userAgent.match(/iPhone/i) ) {
									document.getElementById("big_play").style.display = "none";
								}						
							}catch(e){}

							eventClass.playTimeObj = setInterval(function() {
								eventClass.barControlF( window, eventClass.uiObj = new Object({value: ++eventClass._sTime}) );
							}, 1000);
							
							try {
								if( androidFullChk ) {	// 처음 한번은 FullScreen으로 실행
									logFunction();
									androidFullChk = false;
									//eventClass.fullscreeChkFunc();
								}
							} catch (e){}
						}
						break;
					case "pause" :
						$("#playBtn").removeClass("stop");
						$("#playBtn").addClass("play");

						try {
							clearInterval(eventClass.playTimeObj);
						} catch (e) {}

						var vodq = "#btn_hd2";
						try {
							if (oCookieClass.get("vodv") == "btn_high") {
								vodq = "#btn_hd";
							} else {
								vodq = "#btn_hd2";
							}
						} catch (e) { }


						try {
							jQuery(vodq + ", .video_down").show();
//							jQuery(".hdvdo, .video_down").show();
						} catch (e) {}

						try {
							jQuery(".big_play").show();
						} catch(e) { } 
						break;
					case "ended" :
						try {
							jQuery(".hdvdo, .video_down").show();
							//jQuery(".nx_btn_area, div.nx_player div.bar, .full_screen, .gradient_bg").fadeOut("fast");
						} catch (e) {}
						eventClass._sTime = 0;
						clearInterval(eventClass.playTimeObj);
						if( eventClass._repeat ) {
							$('.bar').slider({value: 0});
							eventClass.vPlay();	
						}
						break;		// Video 종료 
					case "error" :
						try {

							eventClass._setAd = true;
							eventClass._setAdPlay = true;
							try {
								jQuery('.ad_space, #hdbtnArea').hide(); // adPandora layer 영역 hidden
							} catch(e) {}

							console.log("HTML5 Tag를 지원 하지 않는 Browser입니다.");
							document.getElementById(eventClass.vTargetDiv).innerHTML = ( agentClass.uAgent.match("MSIE") ) ? eventClass.playerIE("video_player") : eventClass.playerETC("video_player");
							html5_text_change(false);
						} catch(e) {}
						break;
					/*
					case "webkitExitFullScreen" :
						alert("exit full");
						break;
					*/
				}
			},
	
			setValueFunc : function() {
			},
			
			vformatFunc : function() {
				var formatArr = new Array('mp4', 'webm', 'ogg');
				var vformat = "mp4";
				if( this.vSrc ) {
					if( formatArr.indexOf(vformat) > -1 ) {
						if( this._conType == "audio" ) {
							vformat = "mp3";
							return this.vType = "audio/" + vformat.toLowerCase();
						} else
							return this.vType = "video/" + vformat.toLowerCase();
					}
				}else {
					return -1;
				}
			},
			
			fullscreeChkFunc : function() {			
				//var vTemp = document.createElement("video");
				var vTemp = eventClass.vObj;
				//console.log("full Check");
				// FullScreen Check : 아래 IF 조건에 해당 될 경우 풀브라우져 지원
				if( vTemp.requestFullScreen ) {
				//	console.log("requestFullScreen");
					vTemp.requestFullscreen();
		        }
		        else if( vTemp.mozRequestFullScreen ) {
		        //	console.log("mozRequestFullScreen");
		        	vTemp.mozRequestFullScreen();
		        }
		        else if( vTemp.webkitRequestFullScreen ) {
		       // 	console.log("webkitRequestFullScreen");
		       		vTemp.webkitRequestFullScreen();
		        }
		        else if( vTemp.webkitEnterFullScreen ) {
		        //	console.log("webkitEnterFullScreen");
		        	vTemp.webkitEnterFullScreen();
		        }
				else if( vTemp.msRequestFullscreen ) {
					vTemp.msRequestFullscreen();
				}
				else {
					alert("FullScreen을 지원하지 않는 Browser 입니다.");
					//$("#video-fullscreen").css("visibility", "hidden");
				}

			},			
	
			drawFunc : function() {	
				var resAgent = "smart";//agentClass.cAgentCheck();
				switch( resAgent ) {
					case "smart" :
						this.vType = this.vformatFunc();
						this.videoTag = this.playerVideo("video_player");
					break;
					case "web" :
						this.videoTag = ( agentClass.uAgent.match("MSIE") ) ? this.playerIE("video_player") : this.playerETC("video_player");
					break;
				}

				document.getElementById(this.vTargetDiv).innerHTML = this.videoTag;
				if( resAgent == "smart" ) {
					try {
						// 다윈 광고 2014-01-02 Ray.kim
						if(runCheck != undefined) {
							//if(navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/M180S/i) && runCheck > 1999) {
								if(navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/M180S/i)) {

								this.adPandora();

								/*
								2014.04.22 주석
								try {
									dawin.request({
										pcd: '1',
										ccd: cate
									});

									var self = this;
									dawin.run(function() {
										// 여기에 video관련 event를 등록해야 함.
										self.setEvent();
									});

									eventClass._setAd = true;
									eventClass._setAdPlay = true;
								} catch (e){}
								*/

								if (eventClass._setAd == true) {
									$(".clsBitTxt, .full_screen").css("display", "none");
								} else {
									$(".clsBitTxt, .full_screen").css("display", "block");
								}
							}
						}
					} catch (err) { }

					try {
						this.vObj = document.getElementById("video_player");
						this.setEvent();
						this.vObj.volume = this._Volume / 100;
						this.eventListenerFunc(this.vObj, "conPlayType", this.eventsFunc);		// 현 타입으로 재생가능 체크			
						//this.eventListenerFunc(this.vObj, "webkitExitFullScreen", this.eventsFunc);		// 전체화면 exit 체크
						this.VolumeCtr();

//						setTimeout(function() {jQuery(eventClass.vObj).attr("poster", eventClass.imgSrc)}, 1000);
					} catch (err) {
						console.log("draw Error description : " + err.description);
					}
				}
			},
			
			playerVideo : function(objName) {
				var vPoster = "";
				if( this.imgSrc ) {
//					vPoster = "poster ='" + this.imgSrc + "'";
				}
				var _playObj = "";	var _playObjConType = "";

				var playerSize = "100%";

				if( this._conType == "audio" ) {
					_playObjConType = "		<audio id=\"" + objName + "\" autobuffer preload=\"auto\" style=\"width:" + this.vWidth + "; height:" + this.vHeight + ";\" " + vPoster + ">";
					_playObjConType += "			<source src=\"" + this.vSrc + "\" type=\"" + this.vType + "\">";				
					_playObjConType += "	</audio>";
				} else {
					if( navigator.userAgent.match(/iPhone/i) ) {	// IPhone 일 경우 Image 영역으로 교체
						_playObjConType = "		<img src=\"" + this.imgSrc + "\" style=\"width:" + this.vWidth + "; height:" + this.vHeight + ";\" />";
						_playObjConType += "		<video id=\"" + objName + "\" autobuffer preload=\"auto\" style=\"width:1px; height:1px;\" >";
						_playObjConType += "			<source src=\"" + this.vSrc + "\" type=\"" + this.vType + "\">";				
						_playObjConType += "	</video>";
					}
					else if( navigator.userAgent.match(/Macintosh/i) ) {	// Macintosh 일 경우
						_playObjConType = "		<video id=\"" + objName + "\" autobuffer preload=\"auto\" style=\"background-color:#000000;overflow: hidden; z-index: 0;width:" + this.vWidth + "; height:" + this.vHeight + ";\" " + vPoster + ">";
						_playObjConType += "			<source src=\"" + this.vSrc + "\" type=\"" + this.vType + "\">";				
						_playObjConType += "	</video>";
					}
					else {
						_playObjConType = "		<video id=\"" + objName + "\" autobuffer preload=\"none\" style=\"left:0; top:0; background-color:#000000;overflow: hidden; z-index: 2;width:" + this.vWidth + "; height:" + this.vHeight + ";\" " + vPoster + ">";
						_playObjConType += "			<source src=\"" + this.vSrc + "\" type=\"" + this.vType + "\">";				
						_playObjConType += "	</video>";
					}
				}

				_playObj += "<div class=\"nx_player\" style=\"width:"+playerSize+"; height:100%;\">";

				_playObj += "	<div class=\"gradient_bg\"></div>";
				_playObj += "	<div class=\"screen\">";
				_playObj += _playObjConType;
				_playObj += "	</div>";
//				_playObj += "	<button class=\"big_play\" id=\"big_play\" onclick=\"eventClass.vPlay()\"></button>";
				_playObj += "	<div class=\"big_play\" id=\"big_play\"></div>";
				_playObj += "	<div class=\"bar\" aria-disabled=\"false\" style='z-index: 1; cursor: pointer;'>";
				_playObj += "		<div class=\"nx_opac\"></div>";
				_playObj += "		<div class=\"loading\">";
			//	_playObj += "			<strong class=\"loading_bubble\">16:47</strong>";				
				_playObj += "		</div>";
				_playObj += "		<div class=\"play_bar\">";				
				_playObj += "			<strong class=\"play_bubble\">00:00</strong>";
				_playObj += "		</div>";
				_playObj += "		<div class=\"play_box\" style='width: 100%;'><a class=\"play_cursor ui-slider-handle ui-state-default ui-corner-all\"></a></div>";
				_playObj += "		<div class=\"ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min\" style=\"width: 0%;\"></div>";
				_playObj += "	</div>";
				_playObj += "	<div class=\"nx_top_btn\">";
				if( this._conType == "video" )	_playObj += "<button class=\"full_screen\" id=\"video-fullscreen\"></button>";
				_playObj += "		<button class=\"video_down\" onclick=\"checkappdown()\"></button>";
				_playObj += "	</div>";
				_playObj += "	<div class=\"nx_btn_area\">";
				_playObj += "		<button class=\"play\" id=\"playBtn\"></button>";
				_playObj += "		<button class=\"repeat\"></button>";
				_playObj += "		<span id=\"currentTime\">00:00</span>";
				_playObj += "		<span id=\"vodeTime\">00:00</span>";
				_playObj += "		<div class=\"pic_q\">";
				_playObj += "			<p class=\"clsBitTxt\">";

				if (this.vOptArr.v720 != "") {
				_playObj += "720P";
				} else if (this.vOptArr.v480 != "") {
				_playObj += "480P";
				} else if (this.vOptArr.v336 != "") {
				_playObj += "336P";
				} else if (this.vOptArr.v240 != "") {
				_playObj += "240P";
				}

				_playObj += "			</p>";
//				_playObj += "			<ul class=\"clsBitrateSel\" style=\"display:" + ( this._vOptF ? "block" : "none" ) + "\">";
				_playObj += "			<ul class=\"clsBitrateSel\" style=\"display:none\">";
				_playObj += this.vOptArr.v720 ? "<li id=\"vO720\"><em></em>720P</li>" : "" ;
				_playObj += this.vOptArr.v480 ? "<li id=\"vO480\"><em></em>480P</li>" : "" ;
				_playObj += this.vOptArr.v336 ? "<li id=\"vO336\"><em></em>336P</li>" : "" ;
				_playObj += this.vOptArr.v240 ? "<li id=\"vO240\"><em></em>240P</li>" : "" ;
				_playObj += "				<li class=\"tic\"></li>";
				_playObj += "			</ul>";
				_playObj += "		</div>";
				_playObj += "		<div class=\"pixel\" style=\"display:none\"></div>";
				_playObj += "		<div class=\"sound wid\" style=\"display:none\">";
				_playObj += "			<button id=\"volBtn\" class=\"on\"></button>";
				_playObj += "			<span id=\"VolTxt\">50%</span>";
				_playObj += "			<div class=\"sound_bg ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all\" aria-disabled=\"false\">";
				_playObj += "				<div class=\"sound_bar\" id=\"sound_bar\"></div>";
				_playObj += "				<div class=\"cursor_box\"><a class=\"sound_cursor ui-slider-handle ui-state-default ui-corner-all\" id=\"sound_cursor\" style=\"left: 50%;\"></a></div>";
				_playObj += "				<div class=\"ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min\" style=\"width: 50%;\"></div>";
				_playObj += "			</div>";
				_playObj += "		</div>";
				_playObj += "	</div>";
				_playObj += "</div>";

				return _playObj;
			},
	
			playerIE : function(objName) {
				var _playObj = "";
				var _playUrls = "";
				var _wmode = "transparent";
	
				_playUrls = this.vFlashUrl;
	
				_playObj += '<object id="' + objName + '" style="visibility:visible" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0" width="' + this.vWidth + '" height="' + this.vHeight + '" align="middle" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" >';
				_playObj += '<param name="movie" value="' + _playUrls + '" />';
				_playObj += '<param name="quality" value="high" />';
				_playObj += '<param name="play" value="true" />';
				_playObj += '<param name="loop" value="true" />';
				_playObj += '<param name="scale" value="noScale" />';
				_playObj += '<param name="wmode" value="' + _wmode + '" />';
				_playObj += '<param name="devicefont" value="false" />';
				_playObj += '<param name="bgcolor" value="#FFFFFF" />';
				_playObj += '<param name="menu" value="true" />';
				_playObj += '<param name="allowFullScreen" value="true" />';
				_playObj += '<param name="allowScriptAccess" value="always" />';
				_playObj += '<param name="salign" value="T" />';
				_playObj += '</object>';
	
				return _playObj;
			},
	
			playerETC : function(objName) {
				var _playObj = "";
				var _playUrls = "";
				var _wmode = "transparent";
	
				_playUrls = this.vFlashUrl;
	
				_playObj += '<embed name="' + objName + '" id="' + objName + '" style="visibility:visible" pluginspage="http://www.macromedia.com/go/getflashplayer" width="' + this.vWidth + '" height="' + this.vHeight + '" align="middle" ';
				_playObj += 'src="' + _playUrls + '" ';
				_playObj += 'quality="high" ';
				_playObj += 'play="true" ';
				_playObj += 'loop="true" ';
				_playObj += 'scale="noScale" ';
				_playObj += 'wmode="' + _wmode + '" ';
				_playObj += 'devicefont="false" ';
				_playObj += 'bgcolor="#FFFFFF" ';
				_playObj += 'menu="true" ';
				_playObj += 'allowFullScreen="true" ';
				_playObj += 'allowScriptAccess="always" ';
				_playObj += 'salign="T" type="application/x-shockwave-flash">';
				_playObj += '</embed>';
	
				return _playObj;
			},
			
			videoGetTimeFunc : function( strV ) {

				if (Math.ceil(this.vObj.currentTime) > 3 && this._barHideChk == false )
				{
					jQuery(".nx_btn_area, div.nx_player div.bar, .full_screen, .gradient_bg").fadeOut("slow");
					this._barHideChk = true;
				}
			
				var currentTime = Math.floor(this.vObj.currentTime);
				if (Math.ceil(this.vObj.currentTime) > 0 )
				{
					$("#newThumb").css("display", "none");
				}
				var totalTime = eventClass.vTime > 0 ?  Math.floor((eventClass.vTime / 1000 ) % 60000) : Math.floor(this.vObj.duration);		

//				if ((totalTime-1) <= currentTime) //재생시간 끝나면 컨트롤바 
//				{
//					jQuery(".nx_btn_area, div.nx_player div.bar, .full_screen, .gradient_bg").fadeOut("fast");
//				}

				return strV ? totalTime : currentTime;
			},
			
			timeFunc : function(sTime) {
				var sTemp = "";
				if( sTime >= parseInt(60*60, 10) ) { // 시간
					var st = parseInt(sTime % (60*60), 10);
					sTemp = this.zeroFunc(parseInt(sTime / (60*60), 10)) + ":" + this.zeroFunc(parseInt(st / 60, 10)) + ":" + this.zeroFunc(parseInt(sTime % 60, 10));
				}
				else if( sTime >= 60 ) { // 분
					sTemp = this.zeroFunc(parseInt(sTime / 60, 10)) + ":" + this.zeroFunc(sTime % 60);
				}
				else {
					sTemp = "00:" + this.zeroFunc(sTime % 60);
				}
				
				return sTemp;
			},
			
			zeroFunc : function( strV ) {
				return ( strV.toString().length > 1 ) ? strV : "0" + strV;			
			},
			
			vPlay : function() {

				if (eventClass.playTimeObj == "")
				{
					if ( this.vOptArr.v720 != "" ) {
						this._vOptFChk = true;
						$("#vO720").addClass("on");
					} else if (this.vOptArr.v480 != "" && this._vOptFChk == false ) {
						this._vOptFChk = true;
						$("#vO480").addClass("on");
					} else if (this.vOptArr.v336 != "" && this._vOptFChk == false ) {
						this._vOptFChk = true;
						$("#vO336").addClass("on");
					} else if (this.vOptArr.v240 != "" && this._vOptFChk == false ) {
						this._vOptFChk = true;
						$("#vO240").addClass("on");
					}
				}				

				if (eventClass._setAd == true) {
					$(".gradient_bg").css("display", "none");
				} else {
					$(".gradient_bg").css("display", "block");
				}

				eventClass.vObj.play();

				try {
					if (eventClass._setAd == true && (!adptv["_pandoraICF"] || adptv["_pandoraICF"] == false)) {
						$("#newThumb").css("display", "none");
					}
				}
				catch (e) {
//					console.log(e);
				}
				eventClass.playTimeObj = setInterval(function() {
									console.log("play start !!!");
				}, 1000);
			},
			
			vPause : function() {
				eventClass.vObj.pause();
			},

			vVolume : function() {	
				try {
					$(".sound .on").switchClass("on", "off", function(){
					$('.sound_bg').slider({value:0});
					$('.sound_bar').width("0%");
					eventClass.vObj.volume = 0;
					$("#VolTxt").html("0%");
					});
					$(".sound .off").switchClass("off", "on", function() {
						$('.sound_bg').slider({value:eventClass._Volume});
						$('.sound_bar').width(eventClass._Volume + "%");
						eventClass.vObj.volume = eventClass._Volume / 100;
						$("#VolTxt").html(eventClass._Volume + "%");
					});
				} catch (e){}
				
			},
			
			VolumeCtr : function() {
				 $('.sound_bg').slider({
						range: "min",
						min: 0,
						max: 100,
						value: 50,				
						slide: function(event, ui) { //When the slider is sliding							
							$("#VolTxt").html(ui.value + "%");
							$("#sound_bar").css("width", ui.value + "%");
							eventClass._Volume = ui.value;
							try {
								eventClass.vObj.volume = (ui.value / 100);
								$(".sound .off").switchClass("off", "on", 0);
								
							} catch(e) { console.log("volumn control Error "); }
						}
					});
			},
			
			vodTimeCtr : function() {
				 $('.bar').slider({
						range: "min",
						min: 0,
						max: eventClass.videoGetTimeFunc("T"),
						value: 0,			
						slide: function(event, ui) { //When the slider is sliding
							eventClass.barControlF(event, ui);
						}
					});
			},
			
			barControlF : function( event, ui ) {
				try {
					var PersentBar = (ui.value / eventClass.videoGetTimeFunc("T")) * 100;
					PersentBar = PersentBar > 100 ? 100 : PersentBar;

					$('.bar').slider({value: ui.value});
					$(".play_bar").css("width", PersentBar + "%");
					$("#currentTime").html(eventClass.timeFunc(ui.value));
					$(".play_bubble").html(eventClass.timeFunc(ui.value));					
					if( eventClass._sTime != ui.value ) {
						eventClass._sTime = ui.value;
						eventClass.vObj.currentTime = parseFloat(ui.value);
						eventClass.vObj.play();
					}
					
					if( eventClass.vObj.currentTime != ui.value ) {					
						eventClass._sTime = Math.floor(eventClass.vObj.currentTime);
					}
				} catch(e) { console.log("Vod Time Bar control Error "); }
			},

			adDawin : function () {
				try {
					dawin.request({
						pcd: '1',
						ccd: cate
					});

					var self = this;
					dawin.run(function() {
						// 여기에 video관련 event를 등록해야 함.
//						self.setEvent();
					});
					eventClass._setAd = true;
					eventClass._setAdPlay = true;
				} catch (e){
					/* 바로 영상 재생 */
				}
			},

			adMezzo : function () {
				try {
					// TODO Mezzo AD 서버 정보에 포함되어야 함!! -------------------------------------------------
					mezzo.videoObj =   document.getElementById("video_player");
					mezzo.videoWrapperSelector =".player";
					mezzo.videoWrapperSelector_fullHeight = ".visual.nx_web";
					var codes = {"mWindowID" : "pandora/app/", "mAppID" : "movie", "mCategory" : cate};
					
					var self = this;
					mezzo.request(codes,
						function(){
//							self.setEvent();									
						}
					); 

//					eventClass.vplay();
//					mezzo.videoObj.load();
//					mezzo.videoObj.play();

					eventClass._setAd = true;
					eventClass._setAdPlay = true;
					// -------------------------------------------------------------------------------------
				} catch(e) {
					/* 바로 영상 재생 */
				}
			},

			adPandora : function(icfData) {
		
				try {

					adptv.videoObj =   document.getElementById("video_player");

					var icfData = icfData;
					var self = this;
					adptv.request(icfData,
						function() {
						//self.setEvent();
						}
					);
					eventClass._setAd = true;
					eventClass._setAdPlay = true;
				} catch (e){
					/* 바로 영상 재생 */
				}
			}
		};