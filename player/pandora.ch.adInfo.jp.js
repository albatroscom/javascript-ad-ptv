	/* 플래시 생성*/
	function flashHtml(url, objName, type, strWidth, strHeight) {
		var clientLang = chInfoJson['clientLang'];
		strWidth = ( strWidth ) ? strWidth : "100%";
		strHeight = ( strHeight ) ? strHeight : "100%";

		if (!type || type == undefined) {
			furl = url;
		} else {
			furl = "http://imgcdn.pandora.tv/gplayer/icf_player_2.swf?lang=" + clientLang + "&"+url+"&v003";
		}

		if (navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
			var html = '<object name="'+objName+'" id="'+objName+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
				html+= 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="' + strWidth + '" height="' + strHeight + '">'
				html+= '<param name="wmode" value="transparent"></param>'
				html+= '<param name=movie value="' + furl + '"></param>';
				html+= '<param name=quality value=high></param>'
				html+= '<param name=bgcolor value=#FFFFFF></param>';
				html+= '<param name="allowScriptAccess" value="always"></param>';
				html+= '<param name="allowFullScreen" value="true"></param>';
				html+= '</object>';
		} else {
			var html = '<embed src="' + furl + '"';
				html+= 'quality="high" wmode="transparent" bgcolor="#FFFFFF" id="'+objName+'" name="'+objName+'" align="" width="' + strWidth + '" height="' + strHeight + '" type="application/x-shockwave-flash"';
				html+= 'PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" allowScriptAccess="always" allowFullScreen="true"></embed>';
		}

		return html;
	}

	////////////////////////////////////////////////////////
	// 탑브랜딩 광고 함수
	var state2 = '1';	// 1 : 닫혀져 있는 모양, 2 :  펼처저 있는 모양
	var open_flag = false;

	/* 2010-06-04 배너 스크립트 수정 */
	var _GTimer;
	var _GTimer1;
	var auto;

	function topBrandingAdAction(json) {

		document.getElementById('topBranding').style.height = "80px";

		switch (json["kind"].toString()) {
			case "1" : // 컨닝 광고형
				var url = json["topBrandingurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#topBrandingDiv").html(flashHtml(url, 'icf'));
				$("#topBrandingDiv").show();

				setTimeout(function () {
					_GTimer = setInterval( function() { procSlideTBanner(2,80); }, 10);
				}, 2000);
			break;

			case "3" : // image
				var strImage = "<a href='" + json['clickUrl'] + "' target='_blank'><img src='" + json['topBrandingurl'] + "' border='0'></a>";
				$("#topBrandingDiv").html(strImage);
				$("#topBrandingDiv").show();

				setTimeout(function () {
					_GTimer = setInterval( function() { procSlideTBanner(2,80); }, 10);
				}, 2000);
			break;

			case "4" : // flash 일반
				var url = json["topBrandingurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#topBrandingDiv").html(flashHtml(url, 'icf'));
				$("#topBrandingDiv").show();

				setTimeout(function () {
					_GTimer = setInterval( function() { procSlideTBanner(2,80); }, 10);
				}, 2000);
			break;

			case "5" : // RealClick
				var strFrame = "<iframe width=\"970\" scrolling=\"no\" height=\"80\" frameborder=\"0\" align=\"middle\" topmargin=\"0\" marginheight=\"0\" marginwidth=\"0\" src=\"http://www.pandora.tv/adver.adingo.ptv?adType=realclick\"></iframe>";
				$("#topBrandingDiv").html(strFrame);
				$("#topBrandingDiv").show();

				setTimeout(function () {
					_GTimer = setInterval( function() { procSlideTBanner(2,80); }, 10);
				}, 2000);
			break;
			
		}
		if (json["checkUrl"]) adCheck(json["checkUrl"]);
	}

	/* 2010-06-04 수정 */
	function procSlideTBanner(auto, maxSize){
		var oNTBan = document.getElementById('topBranding');

		document.getElementById('topBrandingDiv').style.height = "80px";

		var oh = parseInt(oNTBan.style.height);
		var scrollSpeed = 0;

		if(maxSize == 150) scrollSpeed = 15;
		else  scrollSpeed = 5;

		if (state2 == '1' ) {
			if(maxSize > oh){
			//	oNTBan.style.height = (oh + scrollSpeed) +'px';
				oNTBan.style.height = 80 +'px';
			} else {
				unloadSlideTBanner();
				state2 = '2';
			}
			if (auto == '1')
			{
				clearTimeout( _GTimer1 );
				_GTimer1 = setTimeout( function() { TopBann('2', maxSize); }, 5000 );
			}
		}
		else
		{
			if (auto != '')
			{
				clearTimeout( _GTimer1 );
			}
			if(0 < oh) {
			//	oNTBan.style.height = (oh - scrollSpeed) +'px';
				oNTBan.style.height = 80 +'px';
			} else {
				unloadSlideTBanner();
				state2 = '1';
			}
		}
	}
	/* 2010-06-04 수정 */

	function unloadSlideTBanner(){
		clearInterval( _GTimer );
		_GTimer = null;
	}

	function topBrandingExAdActionOpen() {
		var url = topBrandingAD["exturl"] + '?clickthru='+ encodeURIComponent(topBrandingAD["clickUrl"]);
		$("#extopBrandingDiv").html(flashHtml(url, 'icf'));
		$("#topBrandingDiv").hide();
		$("#extopBrandingDiv").show();
		$("#topBranding").height("80px");

		setTimeout(function () {
			state2 = '1';
			_GTimer = setInterval( function() { procSlideTBanner(2,150); }, 10);
		}, 500);
	}

	function topBrandingExAdActionClose() {
		$("#topBranding").height("0px");

		try {
			$("#topBrandingDiv").hide();
			$("#extopBrandingDiv").hide();
		} catch(e) {}

	}
	// 탑브랜딩 광고 함수
	////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////
	// 컨닝 광고 함수
	function cunningAdAction(json) {
		switch (json["kind"].toString()) {
			case "1" : // 컨닝 광고형
				var url = json["cunningurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#cunningDiv").html(flashHtml(url, 'icf'));
				$("#cunningDiv").show();
			break;
		}
		if (json["checkUrl"]) adCheck(json["checkUrl"]);
	}


	function cunningExAdActionOpen() {
		var url = cunningAD["exturl"] + '?clickthru='+ encodeURIComponent(cunningAD["clickUrl"]);
		$("#excunningDiv").html(flashHtml(url, 'icf'));
		$("#excunningDiv").show();
	}

	function cunningExAdActionClose() {
		$("#excunningDiv").hide();
	}
	// 컨닝 광고 함수
	////////////////////////////////////////////////////////

	// icf(확장, 일반, 쉐이크) 광고 관련 함수들
	var exticfPlay = false;
	var extConf = "";
	var extIcfSet = "";
	var extIcfJson = {};
	var movieCenterAd = false;
	var adSettime = "";
	function extendIcfAction(json) {

		if (exticfPlay == true) {
			playerSet.startPlay();
			return;
		}

		try { clearTimeout(extConf); } catch(e) {}

		extIcfJson = json;
		
		var divTopSize = '60px';
		if( chPalyerExtSet == 'L' ) {
			divTopSize = '140px';
		}

		var kind_string = '0';
		try { 
			kind_string = json["kind"].toString();
		} catch(e) {
			
		}

		switch (kind_string) {

			case "1" : // 일반 icf 광고 (icfDiv) flv만 할것임
				//alert('일반 icf 시작 , ' + json["exticfurl"]);
				if (json["exticfurl"]) {
					var html = flashHtml('videoURL='+encodeURIComponent(json["exticfurl"])+'&clickthru='+ encodeURIComponent(json["clickUrl"]), 'exicf', 'icf');
					//$('divPlayer').style.width	= "0px";
					//$('divPlayer').style.height	= "0px";
					$("#icfDiv").show();
					setTimeout(function () {$("#icfDiv").innerHTML = html;}, 10);
				} else {
					playerSet.startPlay();
				}
			break;

			case "2" : // 확장 icf 광고 (flvIcf)
				//alert('확장 icf 시작 , ' + json["exticfurl"]);
				// player pause는 플레이어에서 pause 하고 던저 준다.
				if (json["exticfurl"]) {
					var html = flashHtml(json["exticfurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]), 'exicf');

					$("#flvIcf").innerHTML = html;
					$("#flvIcf").show();
					//$('divPlayer').style.width	= "0px";
					//$('divPlayer').style.height	= "0px";
				} else {
					playerSet.startPlay(); //pandora.ch.player.jp.js 파일에 있음
				}
			break;

			case "3" : // 쉐이크 icf 광고 (shakeIcf)
				if (json["exticfurl"]) {
					var html = flashHtml(json["exticfurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]), 'exicf');
					$("#shakeIcf").html(html);

					if(json["width"]) $('#shakeIcf').width(json["width"]+"px");
					if(json["height"]) $('#shakeIcf').height(json["height"]+"px");
					$("#shakeIcf").show();
					//$('divPlayer').style.width	= "0px";
					//$('divPlayer').style.height	= "0px";
				} else {
					playerSet.startPlay(); //pandora.ch.player.jp.js 파일에 있음
				}
			break;

			case "5" : // 일본 ICF GMO 광고 추가 2011-01-24
//				//$('divPlayer').style.width	= "0px";
//				//$('divPlayer').style.height	= "0px";
//				$("icfDiv").show();
//				//alert("ssp_icf");
//				$("icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=ssp_icf"></IFRAME></td></tr></table></div>';
//
//
//				setTimeout ( function(){
//					$("icfDiv").hide();
//					playerSet.startPlay(); //pandora.ch.player.jp.js 파일에 있음
//				},7000);
//			/*
//				skipBtn = setTimeout ( function() {
//					$("icfSkipDiv").style.display = "inline";
//				}, 3000);
//			*/
			// clockon 을 united_blades로 대체 by hanuk 2013-03-22
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=united_blades"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;

			case "11" : //	adingo
				//$('divPlayer').style.width	= "0px";
				//$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+'" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?keycode=1000000269"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);

			break;

			case "12" : //	Pitta
				//$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=pitta&jsCode=0612777e08d52740061d73060fd010984adabd0f"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);

			break;

			case "13" : //	TC
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=tc&MBSite=hs10067160&MBBannerID=270540&MBSizes=300x250"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;

			case "17" : //Clockon
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
//				$("icfDiv").show();
//				$("icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=clockon"></IFRAME></td></tr></table></div>';
//
//				setTimeout ( function(){
//					$("icfDiv").hide();
//					playerSet.startPlay();
//				},7000);
			// clockon 을 united_blades로 대체 by hanuk 2013-03-22
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=united_blades"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;

			case "18" : //united_blades
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=united_blades"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;


			case "19" : //pitta
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=pitta_ad"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
			case "20" : //r18
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=r18"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
			case "21" : //pitta_ad2
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=pitta_ad2"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
			case "22" : //default_set
			//	$('divPlayer').style.width	= "0px";
			//	$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=default_set"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
			
			case "23" : // 일본 ICF GMO 광고 추가 2011-01-24
				//$('divPlayer').style.width	= "0px";
				//$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				//alert("ssp_icf");
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=ssp_icf"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
			
/*			
			case "24" : // 일본 ICF GMO 광고 추가 2011-01-24
				//$('divPlayer').style.width	= "0px";
				//$('divPlayer').style.height	= "0px";
				$("icfDiv").show();
				//alert("ssp_icf");
				$("icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=beniEnding"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;
*/		
			case "25" : // 일본 ICF ub 광고 추가 2013-12-03
				//$('divPlayer').style.width	= "0px";
				//$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				//alert("ssp_icf");
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=icf_ub_01"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;

			case "26" : // 일본 ICF ub 광고 추가 2013-12-03
				//$('divPlayer').style.width	= "0px";
				//$('divPlayer').style.height	= "0px";
				$("#icfDiv").show();
				//alert("ssp_icf");
				$("#icfDiv").innerHTML = '<div id="icfDivLayer" style="text-align:center;padding-top:'+divTopSize+';" width="100%"><table style="width:100%;"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="extendIcfClear();" style="cursor:pointer;"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=icf_ub_02"></IFRAME></td></tr></table></div>';

				setTimeout ( function(){
					extendIcfClear();
				},7000);
			break;

			case "100" : // 구글광고
				var html = flashHtml('videoURL='+encodeURIComponent(json["exticfurl"])+'&playertype=jpchannel&clickthru='+ encodeURIComponent(json["clickUrl"]), 'exicf', 'icf');
				$("#icfDiv").show();
				setTimeout(function () {$("#icfDiv").html(html);}, 10);
			break;

			//default
			default :
				$("#icfDiv").hide();
				playerSet.startPlay();
			break;
		}
		try {
			if (json["checkUrl"]) adCheck(json["checkUrl"]);
		} catch(e) {}
	}


	// 구글 광고 없을시 일반 icf 지면 호출
	function extendIcfReplay() {
		loadJS("http://ads.pandora.tv/NetInsight/text/pandora_jp/jp_channel/main@icf?edugrd="+classSubCode);
	}

	function extendIcfClear() {
		if( $("#icfDiv").style.display == "block" ) {
			$("#icfDiv").hide();
			playerSet.startPlay();
		}
	}

	var rightAdView = false;
	function extIcfRightAd() {
		if (rightAdView == false && extIcfJson["kind"] == "2" && extIcfJson["rightadurl"]) {
			var html = flashHtml(extIcfJson["rightadurl"] + '?clickthru='+ encodeURIComponent(extIcfJson["clickUrl"]));
			$("#flvIcf_1").innerHTML		= html;
			$("#flvIcf_1").show();

			try { $("#flvIcf").hide(); } catch(e) {}
			rightAdView = true;
		}
	}

	function extIcfFloatAd() {
		if (extIcfJson["kind"] == "2" && extIcfJson["floatadurl"]) {
			try { $("#flvIcf_1").hide(); } catch(e) {}
			var html = flashHtml(extIcfJson["floatadurl"] + '?clickthru='+ encodeURIComponent(extIcfJson["clickUrl"]));

			$("#icf_left").innerHTML = html;
			$("#icf_left").show();
		/*
			$("#flvIcf_2").innerHTML = html;
			$("#flvIcf_2").show();
		*/
		}
	}

	var ext_load = 0;
	function icfPlayer(ads_icfs) {
		try {
			$("#icf").InitIcfList(ads_icfs);
		} catch (e) {
			if (ext_lode<100) {
				ext_lode++;
				setTimeout(function () {
					icfPlayer(ads_icfs)
				}, 3000);
			}else {
				startPlay();
			}
		}
	}
	// icf(확장, 일반, 쉐이크) 광고 함수들//

	// 슈퍼밴 닫기 (ray.kim : 2010-09-28)
	function EndFlash() {
		try { document.getElementById("#flvIcf").hide(); } catch(e) {}
		startPlay(); // mplayer.new4.js 파일에 있음

		return true;
	}
	var restartSet = false;
	var microAdSlide_kind = "";
	function microAdSlide(kind,opt) {
		
		if( restartSet == true ) {
			restartSet = false;
			return;
		}

		var divRightSize = '70px';
		if( chPalyerExtSet == 'L' ) {
			divRightSize = '251px';
		}
		
		switch (opt) {
			case "allhide" :
				$("#microAdDiv").hide();
				$("#microAdDiv1").hide();
				$("#microAdDiv").html("");
			break;
			case "hide" :
				$("#microAdDiv").hide();
				$("#microAdDiv1").show();
				$("#microAdDiv").html("");
				microAdSlide_kind = kind;
			break;
			default : // close();
				kind = microAdSlide_kind ? microAdSlide_kind : kind;
				$("#microAdDiv").css('right', divRightSize);
				switch( kind ){
					//adingo
					case "14" :
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('14','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"http://www.pandora.tv/adver.adingo.ptv?keycode=1000000270\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;
					//microad
					case "15" : 
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('15','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/microad.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;
					//gmoad
					case "16" :
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('16','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/gmoad.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;
					//clockon
					case "17" :
						// 20140211 clockon 다시 ㄱㄱ
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('17','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/clockon.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
						
						// clockon 을 united_blades로 대체 by hanuk 2013-03-22
//						$("microAdDiv").innerHTML = "<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('17','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/united_blades.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>";
//						$("microAdDiv1").hide();
//						$("microAdDiv").style.display = "inline";
					break;
					// united_blades
					case "18" :
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('18','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/united_blades.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;
					case "19" :
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('19','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/pitta_ad.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;

					case "20" :
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('20','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/beni_ad.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;

					//microAd
					default :
						// microad 을 united_blades로 대체 by hanuk 2013-08-07
						//$("microAdDiv").innerHTML = "<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('15','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/microad.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>";
						$("#microAdDiv").html("<table style=\"width:100%;\"><tr><td align=right width=468><img src=\"http://imgcdn.pandora.tv/ptv_img/icon_network_close.gif\" style=\"cursor:pointer;\" onclick=\"javascript:microAdSlide('17','hide');\" /></td></tr><tr><td style=\"text-align:center;\" align=center><iframe scrolling=\"no\" height=\"60\" frameborder=\"0\" width=\"468\" topmargin=\"0\" leftmargin=\"0\" allowtransparency=\"true\"  src=\"/php/united_blades.ptv\" marginheight=\"0\" marginwidth=\"0\" style=\"display: inline;\"></iframe></td></tr></table>");
						$("#microAdDiv1").hide();
						$("#microAdDiv").show();
					break;
				}
			break;
		}
	}

	// 미니 광고 함수
	var miniAdJson = {};
	function miniAdAction(json) {
		miniAdJson = json;
		switch (json["kind"].toString()) {
			case "1" : // 미니 확장전 이미지 광고 (cbannerAd) href와 onmouseover가 들어감
				$("#cbannerAd").html("<a href=\"" + json["clickUrl"] + "\" target=\"_blank\" onmouseOver=\"miniAdExtStart()\"><img src=\"" + json["miniurl"] + "\" border=\"0\"></a>");
			break;

			case "2" : // 미니 플래시 광고 (cbannerAd) swf url에 파라미터로`clickthru` 와  들어감 --> miniAdExtStart()
				var url = json["miniurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#cbannerAd").html(flashHtml(url, 'icf'));
			break;

			case "3" : // 확장이 아닌 일반 이미지 광고
				$("#cbannerAd").html("<a href=\"" + json["clickUrl"] + "\" target=\"_blank\" onmouseOver=\"miniAdExtStart()\"><img src=\"" + json["miniurl"] + "\" border=\"0\"></a>");
			break;

			case "4" : // 미니 플래시 확장 광고
				var url = json["miniurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#cbannerAd").width("410px");
				$("#cbannerAd").height("150px");
				$("#cbannerAd").html(flashHtml(url, 'icf'));
			break;
		}
		if (json["checkUrl"]) adCheck(json["checkUrl"]);
	}

	function miniAdExtStart() {
		if (miniAdJson["exturl"]) {
			try { $("#exicf").webMute('0'); } catch(e) {}
			try { $("#flvPlayer").webMute('0'); } catch(e) {}

			var url = miniAdJson["exturl"] + '?clickthru='+ encodeURIComponent(miniAdJson["clickUrl"]);

			$("#cbannerAdExt").html(flashHtml(url, 'icf'));
			$("#cbannerAdExt").show();
			setTimeout(function () {
				$("#cbannerAd").hide();
			}, 1000);
		}
	}

	// 닫기 버튼일 경우
	function miniAdExtEnd() {
		try { $("#exicf").webMute('1'); } catch(e) {}
		try { $("#flvPlayer").webMute('1'); } catch(e) {}
		$("#cbannerAdExt").html("");
		$("#cbannerAdExt").hide();
		$("#cbannerAd").show();
	}

	// 마우스아웃일 경우
	function miniAdOutEnd() {
		if(miniAdJson["closeTime"] > 0) {
			try { $("#exicf").webMute('1'); } catch(e) {}
			try { $("#flvPlayer").webMute('1'); } catch(e) {}
			try {
				setTimeout( function() {
					$("#cbannerAdExt").html("");
					$("#cbannerAdExt").hide();
					$("#cbannerAd").show();
				}, miniAdJson["closeTime"] );
			} catch(e) {}
		}
	}
	// 미니 광고 함수 끝 //

	// ICF Ending Still : 광고 재생
	var endingJson = {};
	var setstartStill;
	function endingAction(json) {
		
		//$("endingDiv").style.top	= "-30px";
		$("#icfAreaDiv").show();
		//$("icfDiv").hide();
		$("#endingDiv").show();
		$("#icfAreaDiv").height("100%");
		//json["kind"] = '2';
		//json["kind"] = '5';
		switch (json["kind"].toString()) {
			case "1" : // 일반광고
				
				var divTopSize = '20px';
				if( chPalyerExtSet == 'L' ) {
					divTopSize = '80px';
				}
				
				$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?keycode=1000000269"></IFRAME></td></tr></table></div></div>');
			break;

			case "2" : // 플래시 광고
				var url = json["still_url"] + '?clickthru='+ encodeURIComponent(json["click_url"]);
				$("#endingDiv").html('<div style="position:absolute;bottom:60px;width:100%;">'+flashHtml(url, 'icf')+'</div>');
			break;

			case "3" : // 이미지 광고
				$("#endingDiv").html("<a href=\"" + json["click_url"] + "\" target=\"_blank\"><img src=\"" + json["still_url"] + "\" border=\"0\"></a>");
			break;
			
			case "4" : // 일반광고
				
				var divTopSize = '20px';
				if( chPalyerExtSet == 'L' ) {
					divTopSize = '80px';
				}
				
				$("endingDiv").innerHTML = '<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=google&w=300&h=250&sl=1027279714"></IFRAME></td></tr></table></div></div>';
			break;
			
			case "5" : // micro ad
				
				var divTopSize = '20px';
				if( chPalyerExtSet == 'L' ) {
					divTopSize = '80px';
				}
				//alert('end');
				$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=microEnding"></IFRAME></td></tr></table></div></div>');
			break;


			case "6" : // 2013-10-17 동영상 엔딩 300×250 김가영
				
				var divTopSize = '20px';
				if( chPalyerExtSet == 'L' ) {
					divTopSize = '80px';
				}
				//alert('end');
				$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?adType=beniEnding"></IFRAME></td></tr></table></div></div>');
			break;


		}
	/*
		setstartStill = setTimeout ( function(){
			$("endingDiv").hide();
			document.enddingPlayer.endingStart();
		},10000);
		*/
	}
	
	// ICF Ending Still : 광고 재생
	//var endingJson = {};
	//var setstartStill;
	function loginEndingAction(json) {
		
		if( document.getElementById("icfDiv").style.display != "block" && document.getElementById("endingDiv").style.display != "block" && document.getElementById("icfAreaDiv").style.display != "block" ) {
			//$("endingDiv").style.top	= "-30px";
			$("#icfAreaDiv").show();
			$("#icfAreaDiv").height("100%");
			//$("icfDiv").hide();
			$("#endingDiv").show();
			//json["kind"] = '2';
			var divTopSize = '20px';
			if( chPalyerExtSet == 'L' ) {
				divTopSize = '80px';
			}
			//alert('endingDiv');
			$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;" border="2"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="loginEndingActionHidden();"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?keycode=1000000269"></IFRAME></td></tr></table></div></div>');
		} else {
			var divTopSize = '20px';
			if( chPalyerExtSet == 'L' ) {
				divTopSize = '80px';
			}
			$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;" border="2"><tr><td><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?keycode=1000000269"></IFRAME></td></tr></table></div></div>');
		}
		
	}
	
	// ICF pause Still : 광고 재생
	function pauseIcfAction( val ) {
		if( val == 'true' ) {
			$("#icfAreaDiv").show();
			$("#icfAreaDiv").height("85%");
			$("#endingDiv").show();
			var divTopSize = '20px';
			if( chPalyerExtSet == 'L' ) {
				divTopSize = '80px';
			}

			var flag = Math.floor( (Math.random() * (2 - 1 + 1)) + 1);
			var _url = "";
			if(flag == 1)
				_url = "adType=beniEnding";
			else
				_url = "keycode=1000000269";

			_url = "keycode=1000000269";



			$("#endingDiv").html('<div id="endingDivLayer" style="position:absolute;top:'+divTopSize+';width:100%;"><div style="text-align:center;"><table style="width:100%;" border="2"><tr><td><img src="http://imgcdn.pandora.tv/pan_img/event/k1_img/del.gif" onClick="loginEndingActionHidden();"><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="http://www.pandora.tv/adver.adingo.ptv?'+_url+'"></IFRAME></td></tr></table></div></div>');
		} else {
			loginEndingActionHidden();
		}
		
	}
	
	function loginEndingActionHidden() {
		$("#icfAreaDiv").height("100%");
		$("#icfAreaDiv").hide();
		$("#endingDiv").hide();
		$("#endingDiv").html("");
	}
	
	
	// ETC 광고 함수
	function etcFunctionAdAction(json) {
		switch (json["kind"].toString()) {
			case "1" : // 플레이어 상단 스킨 이미지형 광고
				if(json["clickUrl"])
					$("#skinDiv").html("<a href=\"" + json["clickUrl"] + "\" target=\"_blank\"><img src=\"" + json["playertopurl"] + "\" border=\"0\"></a>");
				else
					$("#skinDiv").html("<img src=\"" + json["playertopurl"] + "\" border=\"0\">");
			break;

			case "2" : // 플레이어 상단 스킨 플래시형 광고
				var url = json["playertopurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#skinDiv").html(flashHtml(url, 'icf'));
			break;

			case "3" : // 왼쪽 날개 이미지형 광고
				if(json["clickUrl"])
					$("#wingDiv").html("<a href=\"" + json["clickUrl"] + "\" target=\"_blank\"><img src=\"" + json["leftwingurl"] + "\" border=\"0\"></a>");
				else
					$("#wingDiv").html("<img src=\"" + json["leftwingurl"] + "\" border=\"0\">");
				$("#wingDiv").show();
			break;

			case "4" : // 왼쪽 날개 플래시형 광고
				var url = json["leftwingurl"] + '?clickthru='+ encodeURIComponent(json["clickUrl"]);
				$("#wingDiv").html(flashHtml(url, 'icf'));
				$("#wingDiv").show();
			break;
		}

		if (json["checkUrl"]) adCheck(json["checkUrl"]);
	}

	// 미드롤광고
	function start_extend_ad(runtime, country, mCAd) {
		try {
			loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@icf_midd");
			extIcfSet = "midroll";
		} catch (e) { startPlay(); }
	}
	// 미드롤광고

	//	2011-02-28 Quick 광고 추가 : dy.bueon
	function AdRightQuickFun( strV ) {
		if( strV['img'] ){
			$('#adRightQuick').show();
			$('#adRightQuick').width("55px");
			$('#adRightQuick').height("110px");
			$('#adRightQuick').css("marginBottom", "5px");
			$('#adRightQuick').html("<a href='" + strV['clickurl'] + "' target='_blank'><img src='" + strV['img'] + "'></a><img src='" + strV['checkUrl'] + "' style='width:0px;height:0px;'>");
		}else {
			$('#adRightQuick').hide();
		}
	}

	/*통통광고 스크립트 09.12.04 전설희*/
	var iter = 0;
	var setId = 0;
	var down = true;
	var up = false;
	var ltop=0;
	var tongnum=0;

	function handleClick() {
		loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@tong_L");
		setTimeout("handleEnd()",40000);
	}
	function handleEnd(){
		document.getElementById('ball').style.display = "none";
		document.getElementById("handleArea").innerHTML = "";
		window.clearInterval(setId);
	}

	function handleView(json) {
		if (setId != 0)
		window.clearInterval(setId);
		if (document.getElementById('ball').style.display == "" || document.getElementById('ball').style.display == "inline")
		document.getElementById('ball').style.display = "none";
		document.getElementById('ball').style.top = 0;
		document.getElementById('ball').style.left = 5;
		iter = 0;
		var adHtml = '<a href="' + json.clickurl + '" target="_blank" onfocus="this.blur()"><img src="' + json.imgsrc + '" border="0" id="tongtong" alt="" class="" /></a>';
		adHtml += (json.cpurl) ? '<img src="' + json.cpurl + '" border="0" width="0" height="0">' : "";
		document.getElementById("handleArea").innerHTML = adHtml;
		document.getElementById('ball').style.display = "inline";
		setId = window.setInterval("tongtong()", 30);
	}
	function tongtong() {
		var tp	 =	 document.body.scrollTop || document.documentElement.scrollTop;
		var ht=document.body.clientHeight || document.documentElement.clientHeight;
		var etop = tp + ht - 215;

		if ((parseInt(document.getElementById('ball').style.top)+iter < etop) && down) {
			document.getElementById('ball').style.top = parseInt(document.getElementById('ball').style.top,10) + iter;
			iter++;
			return;
		}
		else {
			if ((parseInt(document.getElementById('ball').style.top)< etop) && down) {
			document.getElementById('ball').style.top = etop;
			tongnum++;
				if(tongnum==5){
					window.clearInterval(setId);
					ballMoveEvent();
				}
			return;
			}
			down = false;
			up = true;

			if (parseInt(document.getElementById('ball').style.top) > 0 && up && iter >= 0) {
				document.getElementById('ball').style.top = parseInt(document.getElementById('ball').style.top,10) - iter;
				iter--;
				if (iter%3 == 0){iter--;}
				return;
			}
			down = true;
			up = false;
		}
	}

	function ballMoveEvent() {
		var tp2	 =	 document.body.scrollTop || document.documentElement.scrollTop;
		var ht2=document.body.clientHeight || document.documentElement.clientHeight;
		var etop2 = tp2 + ht2 - 215;
		document.getElementById('ball').style.top	=	etop2 + "px";
		stopSet=setTimeout("ballMoveEvent()", 150);
	}
	/*통통광고 스크립트 09.12.04 전설희*/

	// 노출 광고 함수
	function adCheck(url) {
		var oImg = document.createElement("IMG");
		oImg.style.display = "none";
		oImg.src = url;

		document.body.appendChild(oImg);
	}

	function startPlay(){
		extendIcfClear();
		playerSet.startPlay();
	}