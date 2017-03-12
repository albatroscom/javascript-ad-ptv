var StringBuffer = {
	_buffer : null,
	initialize : function(){
		this._buffer = new Array();
	},
	append : function(obj){
		this._buffer.push(obj);
	},
	toString : function(){
		return this._buffer.join("");
	},
	toComma : function(){
		return this._buffer.join(", ");
	}
};

var cookieSet = {
	SetCookie : function(name, value, expireSeconds){
		var domain = ".pandora.tv";
		var path = "/";

		var todayDate = new Date();
		if(expireSeconds && expireSeconds != undefined) var ExpireTime = new Date(todayDate.getTime()+expireSeconds*1000);

		document.cookie = name + "=" + escape (value) + 
		((ExpireTime) ? "; expires=" + ExpireTime.toGMTString() : "") + 
		((path) ? "; path=" + path : "") + 
		((domain) ? "; domain=" + domain : ""); 
	},

	GetCookie : function(key){
		var aCookie = document.cookie.split("; ");

		for (var i=0; i<aCookie.length; i++) {
			var aCrumb = aCookie[i].split("=");
			if (key == aCrumb[0]) {
				return aCrumb[1];
			}
		}
		return null;
	},

	getCookieVal : function(offset){
		var endstr = document.cookie.i-dexOf (";", offset); 
		if (endstr == -1)
			endstr = document.cookie.length;
		return unescape(document.cookie.substring(offset, endstr));
	}
};

// Script Write
var loadJs = {
	loadJS : function (path, charset1, id) {
		if (charset1 == undefined) {
			charset1 = "utf-8";
		}

		if(id == "" || id == undefined) {
			var oScript = document.createElement("SCRIPT");
			with(oScript) {
				setAttribute("type", "text/javascript");
				setAttribute("language", "javascript");
				setAttribute("charset", charset1);
				setAttribute("src", path);
			}
			document.getElementsByTagName('head')[0].appendChild(oScript);
		} else {
			jQuery("#"+id).attr("src", path);
		}
	}
};

// Layer Action
var LayerAction = {
	channelHost : "http://channel.pandora.tv/",

	Share : function (userid, prgid) {
		var layerLabel = '#Layer';
		var closeLabel = '#layerClose';
		var submitLabel = '#submit';

		var url = 'http://www.pandora.tv/video.ptv?c=share&jsoncallback=?&ch_userid=' + userid + '&prgid=' + prgid;

		jQuery.getJSON(url, function(data) {
		})
		.success(function(data) { 
			if(data != "error") {
				jQuery(layerLabel).html(data);
				jQuery(layerLabel).show();
				jQuery(".btn_facebook").focus();
				var x = ((jQuery(window).width() - 641) / 2) + jQuery(window).scrollLeft() + 150;
				var y = ((jQuery(window).height() - 424) / 2) + jQuery(window).scrollTop() + 150;
				//alert(jQuery(window).scrollTop());
				jQuery("#mwLayer_wrap").css({"top":y+"px","left":x+"px"});
		
				window.onresize = function(){
					var x = ((jQuery(window).width() - 641) / 2) + jQuery(window).scrollLeft() + 150;
					var y = ((jQuery(window).height() - 424) / 2) + jQuery(window).scrollTop() + 150;
					
					jQuery("#mwLayer_wrap").css({"top":y+"px","left":x+"px"});
				};
				window.onscroll = function(){
					//alert(jQuery(window).scrollTop());
					var x = ((jQuery(window).width() - 641) / 2) + jQuery(window).scrollLeft() + 150;
					var y = ((jQuery(window).height() - 424) / 2) + jQuery(window).scrollTop() + 150;
					
					jQuery("#mwLayer_wrap").css({"top":y+"px","left":x+"px"});
				};
				jQuery(closeLabel).click(function() {
					jQuery(layerLabel).html("");
					jQuery(layerLabel).hide();
				});

			} else {
				if(chInfoJson['clientLang']=="ko")	
					alert('채널 운영자에 의해 공유가 제한 된 영상입니다.');
				else
					alert('チャンネル運営者の要請で動画共有ができまない動画です。');
			}
		 });
	},

	Share_Twit : function (title, userid, prg_id) {
		if(prg_id == undefined) {
			var title = VodInfo['title'];
			var userid = VodInfo['userid'];
			var prg_id = VodInfo['prg_id'];
		}

		window.open('http://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + "&url=" + encodeURIComponent("http://www.pandora.tv/my."+userid+"/"+prg_id) + "?ref=ts", 'twitter', 'width=472, height=340,resizable=yes,scrollbars=yes');

	},


	Share_Me2day : function (title, userid, prg_id) {
		if(prg_id == undefined) {
			var title = VodInfo['title'];
			var userid = VodInfo['userid'];
			var prg_id = VodInfo['prg_id'];
		}

		window.open('http://me2day.net/posts/new?new_post[body]=%22' + encodeURIComponent(title) + '%22:' + encodeURIComponent(this.channelHost+"channel/video.ptv?ch_userid="+userid+"&prgid="+prg_id), 'twitter', 'width=600, height=400,resizable=yes,scrollbars=yes');
	},

	Share_Face : function (title, userid, prg_id) {
		if(prg_id == undefined) {
			var title = VodInfo['title'];
			var userid = VodInfo['userid'];
			var prg_id = VodInfo['prg_id'];
		}

		window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(this.channelHost+"channel/video.ptv?ch_userid="+userid+"&prgid="+prg_id+"&ref=FBI"), 'facebook', 'width=600, height=400,resizable=yes,scrollbars=yes');
	},

	Share_Google : function (title, userid, prg_id) {
		if(prg_id == undefined) {
			var title = VodInfo['title'];
			var userid = VodInfo['userid'];
			var prg_id = VodInfo['prg_id'];
		}

		window.open('https://plus.google.com/share?url=' + encodeURIComponent(this.channelHost+"channel/video.ptv?ch_userid="+userid+"&prgid="+prg_id+"&ref=FBI"), 'facebook', 'width=600, height=400,resizable=yes,scrollbars=yes');
	},


	Share_Cyworld : function (title, userid, prg_id) {
		if(prg_id == undefined) {
			var title = VodInfo['title'];
			var userid = VodInfo['userid'];
			var prg_id = VodInfo['prg_id'];
		}

		window.open('http://csp.cyworld.com/bi/bi_recommend_pop.php?url=' + encodeURIComponent(this.channelHost+"channel/video.ptv?ch_userid="+userid+"&prgid="+prg_id), 'cyworld', 'width=400, height=364,resizable=yes,scrollbars=no');
	},

	Embed : function (userid, prgid) {
		window.open(this.channelHost + "php/embed.ptv?userid="+userid+"&prgid="+prgid, "share");
		return;
	},

	// prgVote 영상 평가
	prgVote : function(ch_userid, prg_id, target, type, adult_chk_age, status, prg_pub, scrap_pub,except){
//	prgVote : function(ch_userid, prg_id, target, type, except) { // except --> 댓글 입력시 알럿 안뜨게 처리 하기

		if(cookieSet.GetCookie(target+"_"+prg_id)) {
			alert("이미 참여하셨습니다.");
			return;
		}

		var vote_str ="http://log.sv.pandora.tv/GoodEvent?userid=" + ch_userid + "&prgid=" + prg_id + "&adult=" + adult_chk_age + "&status=" + status + "&prg_pub=" + prg_pub + "&scrab=" + scrap_pub;
		if(document.getElementById("voteIfr").src){
			document.getElementById("voteIfr").src= vote_str;
		}

		var param = {};
		switch (parseInt(type, 10)) {
			case 1 : //Good
				param = {'ch_userid':ch_userid, 'prgid':prg_id, 'good':1};
			break;
			default:// Bad
			//	param = {'ch_userid':'keigoo', 'prg_id':'44198019', 'bad':1};
			break;
		}
		jQuery.ajax({
			type : 'post',
			data : param,
			url : "http://www.pandora.tv/video.ptv?c=share&m=getPrgVote&jsoncallback=?",
			dataType : "jsonp",
			success : function(res) {
				switch (res.error) {
					case "0" :
						switch (parseInt(type, 10)) {
							case 1 : // Good
								jQuery("#"+target+"_"+prg_id).html(parseInt(jQuery("#"+target+"_"+prg_id).html(), 10) + 1);
								cookieSet.SetCookie(target+"_"+prg_id, '1', 60*60*24);
							break;
							default: // Bad
		//						jQuery("#prgBadCnt").html(parseInt(jQuery("#prgBadCnt").html(), 10) + 1);
							break;
						}
						if (except == undefined) {
							alert("참여해 주셔서 감사 합니다.");
						}
					break;

					case "1" : // 비정상참여
						if (except == undefined) {
							alert("비정상적인 접근 입니다.");
						}
					break;

					case "2" : // 이미 참여
						if (except == undefined) {
							alert("이미 참여하셨습니다.");
						}
					break;
				}
			},
			error : function() {

			}
		});
	},

	mentVote : function(ch_userid, mid) {
		if(cookieSet.GetCookie("mentVote_" + mid)) {
			alert("이미 참여하셨습니다.");
			return;
		}

		if (mid) {
			jQuery.ajax({
				type : 'post',
				data : {"ch_userid" : ch_userid, "mid" : mid},
				url : "http://www.pandora.tv/video.ptv?c=share&m=getMentVote&jsoncallback=?",
				dataType : "jsonp",
				success : function(res) {
					if ( res.result == "1" ) {
						jQuery("#mentVote_" + mid).html(parseInt(jQuery("#mentVote_" + mid).html(), 10) + 1);
						cookieSet.SetCookie("mentVote_" + mid, '1', 60*60*24);
						alert("참여해 주셔서 감사 합니다.");
					} else {
						switch (res.error) {
							case "1" :
								alert("이미 공감을 하셨습니다.");
								return;
							break;
							case "2":
								alert("정상적인 접근이 아닙니다.");
							break;
						}
					}
				},
				error : function() {
				}
			});
		}
	}
};

function chJoin(ch_userid) {
	if(cookieSet.GetCookie('glb_mem[userid]')) {
		if (confirm("이 채널을 구독하시겠습니까?")) {
			var obj = {"json":{"ch_userid":"ch_userid", "login_userid":cookieSet.GetCookie("glb_mem[userid]")}};
			var url = this.pathChIsapi + "GAccount" + this.isapiExt + "/Join";

			jQuery.post(url , obj, function(data){
			});
		}
	} else {
		if (confirm("로그인을 먼저 하셔야 합니다. 지금 로그인 하시겠습니까?")) {
			LoginAction.Login();
		}
	}
}

var vObj = null;
var logOk = false;
var playOK = false;
function videoAction(act, log_url) {
	if (arguments[2]) {
		if (logOk == false) {
			jQuery.getScript(log_url+"&mode=pd");
			logOk = true;
		}
		location.href = arguments[2];
		return;
	} else {
		if (playOK == false) {
			if (reCnt < 400) {
				reCnt++;
				setTimeout(function () {
					videoAction(act, log_url);
				}, 10);
			} else {
				if (logOk == false) {
					jQuery.getScript(log_url+"&mode=se");
					logOk = true;
				}
			}
			return;
		}
		
		switch (act) {
			case "play" :
				if (logOk == false) {
					jQuery.getScript(log_url+"&mode=pd");
					logOk = true;
				}

				vObj.play();
			break;
			case "pause" :
				vObj.pause();
			break;
			case "stop" :
				vObj.stop();
			break;
		}
	}
}

function set_log(os, log_url) {
	
//					== 미디어 요소의 이벤트 처리(데이터 로딩 시)
//					emptied : 이전의 데이터 비움
//					loadstart : 데이터 로딩 시작
//					progress : 데이터 로딩 중(간헐적으로 발생)
//					loadedmetadata : 미디어의 메타데이터를 읽음
//					loadeddata : 데이터 로딩 완료
//					canplay : 재생을 시작할 수 있음
//					canplaythrough : 다운로드가 유지된다면 마지막 까지 재생할 수 있는 시점에 발생
//					load : 데이터 다운로드 완료
//					stalled : 데이터 다운로드가 느려짐
//					suspend : 데이터 다운로드가 중지됨(에러 아님)
//					abort : 데이터 다운로드가 중지됨(에러 발생)
//					error : 에러 발생
//					loadend : 데이터 로딩 완료(load, abort, error 뒤에 발생)
//					
//					== 미디어 요소의 이벤트 처리(미디어 재생 시)
//					play : 재생 시작 알림
//					playing : 재생이 시작됨
//					pause : 재생 일시 정지
//					timeupdate : 재생 중(여러 번 발생)
//					waiting : 다음 프레임의 다운로드 대기 중
//					ended : 재생 종료
	try {
		vObj = document.getElementsByTagName('video')[0];

		// android iphone
		vObj.addEventListener('play', function() {
			if (os == "ios") { // 아이폰, 패드, 팟 
				jQuery.getScript(log_url+"&mode=pd");
				logOk = true;
			}
		});
		
		// android iphone
		vObj.addEventListener('ended', function() {
			//alert('video play end');
			if (endLogOk == false) {
				//document.getElementById('log').src = log_url+"&mode=se";;
				endLogOk = true;
			}
		});
		
		// iphone
		vObj.addEventListener('suspend', function() {
			playOK = true;
			//alert('iphone video progress ');
		});
		
		// android iphone
		vObj.addEventListener('progress', function() {
			playOK = true;
			//alert('android video progress ');
		});
		
		// iphone
		vObj.addEventListener('loadstart', function() {
			//alert('android loadstart ok');
			playOK = true;
		});
		
		// android iphone
		vObj.addEventListener('stalled', function() {
			playOK = true;
			//alert('android video stalled  ');
		});
		
		// android iphone
		vObj.addEventListener('loadedmetadata', function() {
			//alert('video loadedmetadata ');
		});
		
		// android iphone
		vObj.addEventListener('loadeddata', function() {
			//alert('video loadeddata');
		});

		// android iphone
		vObj.addEventListener('playing', function() {
			//alert('video playing ');
		});

		// android iphone
		vObj.addEventListener('canplay', function() {
			//alert('video canplay ');
		});
		
		// iphone
		vObj.addEventListener('seeking', function() {
			//alert('video seeking  ');
		});
		
		// iphone
		vObj.addEventListener('seeked', function() {
			//alert('video seeked  ');
		});
		
		//
		vObj.addEventListener('dureationchange', function() {
			//alert('video dureationchange  ');
		});
		
		//
		vObj.addEventListener('abort', function() {
			//alert('video abort  ');
		});

		// android iphone
		vObj.addEventListener('waiting', function() {
			//alert('video waiting');
		});
	} catch(e) { }
}

//캡쳐
function winOpenCenter(url, n, w, h, s) {
	var msg2 = {'ko':'차단된 팝업창을 허용해 주세요.', 'en':'Allow pop-ups', 'jp':'遮?されたポップアップウィンドウを許可してください。', 'cn':'?允?被?截的?出?口', 'gb':'Allow pop-ups'};
	var winl = (screen.width - w) / 2;
	var wint = (screen.height - h) / 2;
	var winprops = 'height='+h+',width='+w+',top='+wint+',left='+winl+',scrollbars='+s+',resizable';
	var win = window.open(url, n, winprops);
	if (win == null) {
		alert(msg2[chInfoJson['clientLang']]);
	} else {
		if (parseInt(navigator.appVersion) >= 4) {
			win.focus();
		}
	}
}

// 선물하기
function goGift(ch_no) {
	var msg2 = {'ko':'차단된 팝업창을 허용해 주세요.', 'en':'Allow pop-ups', 'jp':'遮?されたポップアップウィンドウを許可してください。', 'cn':'?允?被?截的?出?口', 'gb':'Allow pop-ups'};
	if (!ch_no) {
		alert('parameter error');
		return false;
	}
	var newWin = window.open( this.mobileHost + "8800/gift/gift_info_popup.ptv?ch_no=" + ch_no, "gift", "width=250, height=400");

	if (newWin == null) {
		alert(msg2[chInfoJson['clientLang']]);
	} else {
		newWin.focus();
	}
}

function doSendMini() {
	if(!jQuery.browser.msie) {
		alert("IE에서만 지원합니다.");
		return;
	}

	if (chInfoJson["clientLang"] == "ko") {
		inputMini(VodInfo['prg_id'], VodInfo['title'], realtime(VodInfo['runtime']), VodInfo['userid'], VodInfo['encode']);
	} else {
		alert("Service not Ready for Global Service");
	}
}

// 영상 담기
function newAddplay() {
	var sObj = [VodInfo['prg_id'], VodInfo['title'], realtime(VodInfo['runtime']), VodInfo['upload_nickname'], VodInfo['userid']];

	 _addPlaylist(sObj);
}

// 영상 담기
function newAddplay2(prg_id, title, runtime, upload_nickname, userid) {
	var sObj = [prg_id, title, realtime(runtime), upload_nickname, userid];

	 _addPlaylist(sObj);
}

// 시간
function realtime(num){
	var time,hour,min,sec,rtime;
	time = parseInt(num/1000);
	hour = parseInt(time/3600);

	if(hour<10){hour='0'+hour;}
	min = parseInt((time%3600)/60);

	if(min<10){min='0'+min;}
	sec = time%60;

	if(sec<10){sec='0'+sec;}
	rtime=hour+":"+min+":"+sec;

	return rtime;
}

function doScrap(){
	var do_scrap_pub = "";
	var do_userid = "";
	var do_prg_id = "";

	try{ do_scrap_pub = VodInfo['scrap_pub']; } catch(e) { do_scrap_pub = chInfoJson['upload_pub']; }
	try{ do_userid =  VodInfo['userid']; } catch(e) { do_userid = chInfoJson['ch_userid']; }
	try{ do_prg_id = VodInfo['prg_id']; } catch(e) { do_prg_id = chInfoJson['prgid']; }

	if (do_scrap_pub != 0) { // 스크랩 허용이 불가 인거
		alert("채널주인에 의해 스크랩이 제한된 영상입니다.");
	} else if (!cookieSet.GetCookie('glb_mem[userid]')) { // 로그인이 안되어 있을경우
		if(confirm("로그인이 필요한 서비스 입니다. 로그인을 하시겠습니까?") == true) {
			LoginAction.Login();
		}
	} else if (cookieSet.GetCookie("glb_mem[userid]") == do_userid) { // 자신의 채널
		alert("본인 채널의 영상은 퍼가실 수 없습니다.");
	} else {
		var newWin = window.open( LayerAction.channelHost + 'php/scrap.ptv?ch_userid=' + do_userid + '&prg_id=' + do_prg_id, "scrap", "width=250, height=250");
		if (newWin == null) {
			alert("차단된 팝업을 허용해 주세요.");
		} else {
			newWin.focus();
		}
	}
}

// 미니2 담기
function inputMini(prg_id, title, runtime, ch_userid, status){
	if (!prg_id || !title || !runtime || !ch_userid) {
		alert('parameter error \ninputMini(prg_id, title, runtime, ch_userid)');
		return;
	}

	var noInputMini = {'ko':'스크랩된 영상은 미니에 담을수 없습니다.', 'en':'스크랩된 영상은 미니에 담을수 없습니다.', 'jp':'스크랩된 영상은 미니에 담을수 없습니다.', 'cn':'스크랩된 영상은 미니에 담을수 없습니다.', 'gb':'스크랩된 영상은 미니에 담을수 없습니다.'};
	var msg1 = {'ko':'미니2를 설치하셔야 미니담기가 가능합니다 \n\n 미니2 설치페이지로 이동합니다.', 'en':'미니2를 설치하셔야 미니담기가 가능합니다 \n\n 미니2 설치페이지로 이동합니다.', 'jp':'미니2를 설치하셔야 미니담기가 가능합니다 \n\n 미니2 설치페이지로 이동합니다.', 'cn':'미니2를 설치하셔야 미니담기가 가능합니다 \n\n 미니2 설치페이지로 이동합니다.', 'gb':'미니2를 설치하셔야 미니담기가 가능합니다 \n\n 미니2 설치페이지로 이동합니다.'};
	var msg2 = {'ko':'차단된 팝업창을 허용해 주세요.', 'en':'Allow pop-ups', 'jp':'遮?されたポップアップウィンドウを許可してください。', 'cn':'?允?被?截的?出?口', 'gb':'Allow pop-ups'};

	if (status == "30010") {
		alert(noInputMini[chInfoJson['clientLang']]);
		return;
	}
	try{
		jQuery.each(jQuery.browser, function(i) {
			if(jQuery.browser.msie) {
				var mmini = new ActiveXObject("PandoraTVMiniAX.PandoraTVMini");
				toMini(prg_id,title,runtime,ch_userid,mmini);
			} else if (jQuery.browser.mozilla) {
				if(!jQuery('embed1')) {
					var miniPluginObj = '<embed id="embed1" type="application/pandora.tv-miniexecute-plugin" width=0 height=0></embed>';
					var divMiniPlugin = document.createElement("DIV");
					document.body.appendChild(divMiniPlugin);
					divMiniPlugin.innerHTML = miniPluginObj;
				}
				setTimeout(function(){
					var _isPlugin = false;
					for (plugin = 0; plugin < navigator.plugins.length; plugin++) {
						if (navigator.plugins[plugin].name == 'mini execute plugin') {
							_isPlugin = true;
						}
					}
					if(!_isPlugin) {
						alert(msg1[chInfoJson['clientLang']]);
					} else {
						if((navigator.appName == 'Netscape')||(navigator.appName == 'Opera')) {
							mimetype = navigator.mimeTypes["application/pandora.tv-miniexecute-plugin"];
							if (mimetype) {
								var mmini = panvastater;
							} else {
							  alert(msg1[chInfoJson['clientLang']]+'-not install');
							}
						  } else {
							document.write('파이어 폭스에서만 정상작동합니다.');
						  }
						  toMini(prg_id,title,runtime,ch_userid,mmini);
					}}.bind(this), 500);
			}
		});
	} catch(e) {
		alert(msg1[chInfoJson['clientLang']]);
		windowName = open(this.downloadHost+"index.ptv?mode=mini2&mode2=01&mode3=index&bCateSubIDX=3","","");
		if(windowName==null)   {
			alert(msg2[chInfoJson['clientLang']]);
		}
	}
}

function toMini(prg_id,title,runtime,ch_userid,mmini) {
	mmini.InputMini(prg_id,title,runtime,ch_userid);
}

var sharedWindow = null;
function _addPlaylist(json, type) {

	if (type != "open") {

		var sharedList = eval(SharedObject.getItem("glb_bsk")) || [];
		var exists = null;

		if (type == "array") {
			var e = 0;
			var newJson = [];
			if (sharedList.length >= 20) {
				exists = "over";
			} else {
				var jLength = sharedList.length;
				for (var i=0; i<json.length; i++) {
					if (jLength == 0) {
						sharedList.push(json[i]);
					} else {
						var ok = false;
						for (var j=0; j<jLength; j++) {
							if (sharedList[j][0] == json[i][0]) {
								exists = "mexists";
								e++;
								ok = true;
								break;
							}
						}

						if (ok == false) {
							sharedList.push(json[i]);
						}
					}
				}
			}
		} else {
			if (sharedList.length >= 20) {
				exists = "over";
			} else {
				for (var i=0; i<sharedList.length; i++) {
					if (sharedList[i][0] == json[0]) {
						exists = "exists";
						break;
					}
				}
			}

			if (exists == null) {
				sharedList.push(json);
			}
		}
		switch (exists) {
			case "exists" :
			case "oever" :

			SharedObject.setItem("glb_bsk_exists", jQuery.toJSON(exists));
			break;

			default:
				SharedObject.setItem("glb_bsk", jQuery.toJSON(sharedList));

				var extTxt = exists + "-" + e;
				SharedObject.setItem("glb_bsk_exists", extTxt);
			break;
		}
	}

	var top = parseInt(window.screen.height, 10) - 306;
	var left = parseInt(window.screen.width, 10) - 300;

	sharedWindow = window.open("", "sharedWin", "toolbar=no, directories=no, status=no, menubar=no, scrollbars=no, width=300px, height=306px, left=" + left + "px, top=" + top + "px");

	var msg2 = {'ko':'차단된 팝업창을 허용해 주세요.', 'en':'Allow pop-ups', 'jp':'遮?されたポップアップウィンドウを許可してください。', 'cn':'?允?被?截的?出?口', 'gb':'Allow pop-ups'};
	if (sharedWindow == null) {
		alert(msg2[chInfoJson['clientLang']]);
		return;
	}
	sharedWindow.location.href = "http://www.pandora.tv/share/";
	sharedWindow.focus();
}

//**********************************************************************************************************//
// 노출 광고 함수
function adCheck(url) {
	var oImg = document.createElement("IMG");
	oImg.style.display = "none";
	oImg.src = url;

	document.body.appendChild(oImg);
}
//**********************************************************************************************************//

//**********************************************************************************************************//
//ray.kim : 2011-03-23
function imgError(oImg, imgSrc) {
	/*
	채널 img :: http://imgcdn.pandora.tv/static/ch_thumb.gif
	프로그램 img :: http://imgcdn.pandora.tv/static/prg_thumb.gif
	*/

	oImg.style.display = "none";
	// 채널 이미지중... _s 가 없을 경우 이 함수를 태워서 큰 썸네일로 교체해 준다.
	if (oImg.src.indexOf("logo_s.gif") > -1 ) {
		imgSrc = oImg.src.replace("logo_s.gif", "logo.gif");
	}
	var EN = oImg.getAttribute("errNo");
	if (EN == null || !EN) {
		oImg.setAttribute("errNo", 0);
	}

	if (!imgSrc) {
		oImg.onerror = function () {};
		return false;
	}

	oImg.src = imgSrc;

	if(oImg.errNo > 1) {
		oImg.onerror = function () {};
		return false;
	}

	oImg.style.display = "inline";
	oImg.errNo++; // = oImg.errNo + 1;
}
//**********************************************************************************************************//

//**********************************************************************************************************//
//ray.kim : 2011-03-23
function toggleMenu(Div , On, Mode)
{
	if(jQuery('#'+Div).css('display') == "none"){
		cookieSet.SetCookie('video_button', 'open', 0);
		jQuery('#'+Div).show('fast');
		
		if(On == 1){
			jQuery('.'+Div+'_open').hide();
			jQuery('.'+Div+'_close').show();
		}

		try { jQuery('#explain_close').click(); }catch (e) {}
		try { jQuery('#thumbnailLine').hide(); }catch (e) {}
	} else {
		cookieSet.SetCookie('video_button', '', 0);
		jQuery('#'+Div).hide();

		if(On == 1){
			jQuery('.'+Div+'_open').show();
			jQuery('.'+Div+'_close').hide();
		}
		try { jQuery('#thumbnailLine').show(); }catch (e) {}
	}
}
//**********************************************************************************************************//

var toggleMsg = {
	set : function(){
		var Obj = this;
		var category = "etc";

		if(chInfoJson['c1'] == "08") category = "sbs";

		if(cookieSet.GetCookie(category+'_msg') != 1) {
			jQuery('#explain').show();

			jQuery('#explain_close').click(function() {
				/* 카테고리 열기 메세지 */
				cookieSet.SetCookie(category+'_msg', '1', 60*60*24);
				jQuery('#explain').hide();
			});
		}
	}
};

//ray.kim : 2011-09-15
function toggleBox(Div, Id)
{
	if(Div) cookieSet.SetCookie(Div+'_button', '1', 60*60*24*365);
	jQuery('#'+Id).hide();
}