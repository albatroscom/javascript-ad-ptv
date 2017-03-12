var playby_cnt='';
var playby_time='';
var playby_channel='www';
var rt;
var playerSet = {
	_playUrl : "",
	_playWidth : "100%",
	_playHeight : "100%",
	_PlayerId : "#player",
	_FlvIcfId : "#flvIcf",
	_ExicfId : "#exicf",
	_EnddingId : "#Endding",
	_CloseId : "#playerClose",
	_IcfSkipId : "#icfSkipDiv",
	_ViewId : 'quickView',
	_TypeId : 'div',
	_Target : false,
	_Page : 0,
	_PrgPage : 1,
	_Sbs : "false",
	_adStart : "",
	_prgList : "",
	_onResize : "",
	_clientSize : 488,
	_set_ch_userid : "",
	_set_prgid : "",
	_set_mode : "",
	_icfCnt : 1,  // icf 갯수 설정,
	chkCupiSec : 0,
	vodInfo : "",
	vch_userid : "",

	initialize : function(mode, ch_userid, prgid, page){

//		loadJs.loadJS("http://assets.livere.co.kr:8080/js/livere_lib.js");
//		loadJs.loadJS("http://assets.livere.co.kr:8080/js/livere.js");

		var Obj = this;
		var cate = "";
		var setRelative = 500;
		this._Page = page;
		this._prgid = prgid;
		this._ch_userid = ch_userid;

		if(mode == "autoPlay" || mode == "thumbnail") this._set_mode = mode;
		else jQuery("#thmbActive").removeClass('active');

		try { this._Sbs = "false"; } catch(e) {}
		try { clearTimeout(adSettime); } catch(e) {}
		try { clearTimeout(this._adStart); } catch(e) {}
		try { clearTimeout(skipBtn); } catch(e) {}

		if(test == "y")
			this._playUrl = 'http://imgcdn.pandora.tv/gplayer/test/pandora_CategoryPlayer.swf?' + 'userid=' + ch_userid + '&prgid=' + prgid;
		else
			this._playUrl = 'http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_CategoryPlayer.swf?' + 'userid=' + ch_userid + '&prgid=' + prgid;

		this.vch_userid = ch_userid;

		if(this._set_mode == "autoPlay") cate = this._set_mode;
		else cate = mode;

		var url = '/video.ptv?m=player&ch_userid=' + ch_userid + '&prgid=' + prgid + '&cate=' + cate + '&ct=' + chInfoJson['ct'];

		jQuery.ajax({
			url : url,
			success : function (vData) {
				if(vData.replace(/^\s\s*/, "").replace(/\s\s*$/, "") == "error") {
					Obj.Error(Obj.target);
					return;
				}

				jQuery('#'+Obj._ViewId).html(vData);
				mentList.set(ch_userid,prgid);

				if(chInfoJson['smartCheck'] == "y") {
					Obj.smartStart(ch_userid, prgid);

					if(mode == "autoPlay" || mode == "Relative") {
						relativeList.getAjax(ch_userid, prgid, Obj._Page, Obj._Sbs);
					}

					//if(chInfoJson['c1'] == "08") try { jQuery('#relativeIds').show(); } catch(e) {}
				} else {
					Obj.Icf(ch_userid, prgid, mode);
				}
			},
			404 : function () {
				Obj.Error(Obj.target);
				return;
			},
			error : function () {
				Obj.Error(Obj.target);
				return;
			}
		});

		if(mode != 'autoPlay' && mode != "thumbnail") {
			jQuery.getScript('http://imgcdn.pandora.tv/channel/www/makePCookie_pandora_utf.js');
		}
	},

	smartStart : function(ch_userid, prgid){
		var Obj = this;
		var url = '?m=smart_phone&ch_userid=' + ch_userid + '&prgid=' + prgid + "&jsoncallback=?";

		jQuery.ajax({ 
			url: url,
			type : 'post',
			dataType : 'jsonp',
			success : function(res){
				jQuery(Obj._PlayerId).html(res);

				var os = jQuery('#_os').val();
				var log_url = jQuery('#log_url').val();
				logOk = false;
				playOK = false;
				set_log(os, log_url);
			}
		});
	},

	setCupi : function(videoSet) {
		// 11026, 11036, 11046, 11126 채널레벨이면 기존에 cupi를 호출
		// cupi 추가. 페이지 로딩시 cupi 지급. hc.cho 2009.12.27, 광고를 보고 난 후 여기를 타지 않게 하기 위해 return 해 버림.

		if (videoSet.chlv != '11026' && videoSet.chlv != '11126') {
			return false;
		}

		var oDate = new Date();
		var nowSec = Math.floor(oDate.getTime()/1000);
		if((nowSec - this.chkCupiSec) > 10) {
			this.chkCupiSec = nowSec;
		} else {// 10초 이내에 큐피 적립 요청을 하면 무시한다.
			return false;
		}
	
		var cupiUrl = "http://channel.pandora.tv/json/v003/GLGive.dll";
		if(videoSet['status'] == 30010) {
			var ch_userid = videoSet.upload_userid;
			var prgid = videoSet.parent_prg_id;
		} else {
			var ch_userid = videoSet.userid;
			var prgid = videoSet.prg_id;
		}

		var json = {ch_userid:ch_userid,
		            prg_id:prgid,
		            isHD:((videoSet.resolquality_type == 2) ? "2":"1"),
		            runtime:videoSet.runtime};

		jQuery('#cupiJson').val(jQuery.toJSON(json));
		jQuery('#fmCupiForm').attr("target", "frmCupiUpdate");
		jQuery('#fmCupiForm').attr("action", cupiUrl).submit();

		return true;
	},

	Icf : function(ch_userid, prgid, mode){
		this._Sbs = false;
		var Obj = this;
		this.vodInfo = "";
		var url = '?m=sbsicf&ch_userid=' + ch_userid + '&prgid=' + prgid;

		jQuery.ajax({ 
			url: url,
			type : 'post',
			dataType : 'json',
			success : function(res){

				var vData = res.adUrl;
				Obj.setCupi(res.vodInfo);
				Obj.vodInfo = res.vodInfo;

				rt = res.vodInfo.runtime ? res.vodInfo.runtime : 0;

				try { mentList.livereFn(''); } catch (e) { 
					setTimeout(function() {
						mentList.livereFn('');
					}, 3000);
				}

				if(chInfoJson['icf'] == "free" || res.vodInfo.chlv == "11030" || res.vodInfo.chlv == "11036" ||( chInfoJson['c1'] == "10" && res.vodInfo.adult_chk_age == "19" && cookieSet.GetCookie("adult_check") != "y" )) {
					Obj.startPlay();
					return;
				}

				// 광고 로드를 못할 시 그냥 플레이 (ray.kim)
				Obj._adStart = setTimeout(function() {
					Obj.startPlay();
				}, 5000);

				if(vData != "error" && vData != "sbs") {
					/* SBS 영상 파라메터 추가 */
					Obj._playUrl += "&other=sbs";
					Obj._Sbs = "true";

					var html = Obj.getAdPlayer("issbs="+escape(vData), 'exicf', 'icf');
					jQuery(Obj._FlvIcfId).css({"top":"0px","left":"0px"});
					jQuery(Obj._FlvIcfId).html(html);
					jQuery(Obj._FlvIcfId).show();

					try { clearTimeout(Obj._adStart); } catch(e) {}
				} else {
					if(vData == "sbs") {
						Obj._Sbs = "true";
						Obj._playUrl += "&other=sbs";

						Obj.startPlay();
						return;
					} else Obj._Sbs = "false";



					playby_cnt='';
					playby_time='';
					playby_channel='www';
					if( chInfoJson['c1'] == "07--") {	// 음악 카테고리
						Obj.startPlay();
						//loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@ICF_MUSIC");					/* ICF 광고 음악 실행 */
						Obj._icfCnt = 1;
					} else {
						// 광고 호출 이후 5초 동안에 반응이 없다면 변수를 true로 바꿔 준다.
						extConf = setTimeout(function() {
							exticfPlay = true;
							playerSet.startPlay(); /* ICF 오작동시 플레이 */
						}, 5*1000);


						//loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/category/list@icf?edugrd=" + chInfoJson['c1']);	/* ICF 광고 실행 */
						loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@icf_03?edugrd=" + chInfoJson['c1'] + "&ref=" + encodeURIComponent(location.href) + "&income=" + parseInt(rt / 1000) + "&keyword=" + ch_userid.toLowerCase());//?edugrd=" + chInfoJson['c1']);	/* ICF 광고 실행 */
					}
					

				}

				if(Obj._set_ch_userid) {
					ch_userid = Obj._set_ch_userid;
					relativeList.vGrpPrgId = Obj._set_prgid;
				}

				if(mode == "autoPlay" || mode == "Relative") {
					relativeList.getAjax(ch_userid, prgid, Obj._Page, Obj._Sbs);
				}

				//if(Obj._Sbs == "true") try { jQuery('#relativeIds').show(); } catch(e) {}
			}
		});
	},

	startPlay : function(){
		var Obj = this;

		try { clearTimeout(this._adStart); } catch(e) {}

		try { jQuery("#icfNoticeDiv").hide(); } catch(e) {}
		try { jQuery(this._ExicfId).html(""); } catch(e) {}
		try { jQuery(this._ExicfId).hide(); } catch(e) {}
		try { jQuery(this._FlvIcfId).html(""); } catch(e) {}
		try { jQuery(this._FlvIcfId).hide(); } catch(e) {}
		try { jQuery(this._IcfSkipId).hide(); } catch(e) {}

	
/*	2012-06-04 : ICF 2개 적용시 주석 제거 2012-07-13 다시 icf 2개 적용 smith.oh */
		try {
			if (playby_cnt > 1) {
				playby_cnt--;

				try {
					jQuery("#flvIcf").hide();
				} catch (e) {}

				if( chInfoJson['c1'] != "07") {
					if ( parseInt(rt, 10) >= parseInt(playby_time*60 *1000, 10 ) ) {
						// 광고 호출 이후 5초 동안에 반응이 없다면 변수를 true로 바꿔 준다.
						extConf = setTimeout(function() {
							exticfPlay = true;
							playerSet.startPlay(); /* ICF 오작동시 플레이 */
						}, 5*1000);


						loadJs.loadJS("http://ads.pandora.tv/NetInsight/text/pandora/pandora_channel/main@icf_04?edugrd=" + chInfoJson['c1'] + "&ref=" + encodeURIComponent(location.href) + "&keyword=" + this.vch_userid);
						return;
					}
				}
			}
		} catch (e) {}




/***/
		var _playObj = "";

		if(jQuery.browser.msie) _playObj = this.playerIE(this._playUrl, 'flvPlayer');
		else _playObj = this.playerETC(this._playUrl, 'flvPlayer');

		jQuery(this._PlayerId).html(_playObj);
		jQuery(this._PlayerId).show();

		start_ing = true;

		setTimeout(function() {
			//try { oMo.mo_play(); } catch(e) {}

			Obj.watchedVideo();
			Obj.prgHitAction();
		}, 3000);
	},

	getAutoPlay : function(ch_userid, prgid, mode){
		if(ch_userid && prgid){
			this._set_ch_userid = ch_userid;
			this._set_prgid = prgid;

			jQuery('#'+this._ViewId).show();
			this.initialize(mode, ch_userid, prgid);
		}
	},

	getPlayer : function(getId, mode, page){
		var objId = jQuery("#"+getId);
		var ch_userid = objId.attr("ch_userid");
		var prgid = objId.attr("prgid");
		var ct = objId.attr("ct");

		try { jQuery(this._ExicfId).html(""); } catch(e) {}
		try { jQuery(this._ExicfId).hide(); } catch(e) {}
		try { jQuery(this._FlvIcfId).html(""); } catch(e) {}
		try { jQuery(this._FlvIcfId).hide(); } catch(e) {}
		try { jQuery(this._PlayerId).html(""); } catch(e) {}
		try { jQuery(this._PlayerId).remove(); } catch(e) {}

		if(prgid){
			if(mode == "Relative") {
				this.initialize(mode, ch_userid, prgid, page);
			} else if(mode == "Prg") {
				this.initialize(mode, ch_userid, prgid, page);
			} else {
				this._set_ch_userid = ch_userid;
				this._set_prgid = prgid;
				this._set_mode = "";

				if(this._Target) {
					jQuery('#'+this._Target).show();
					objId.hide();

					this._Target = getId;
				} else {
					this._Target = getId;
					objId.hide();
				}

				jQuery("#"+this._ViewId).remove();
				this._prgList = "";

				objId.after("<div id='"+this._ViewId+"' class='active_player sliding'  style='z-index:900;'><div class='outin_cont'><div class='mov' id='player'></div></div></div>");
				this.initialize("Player", ch_userid, prgid, 1);
			}
		} else return;
	},

	getAdPlayer : function(Url, objName, type){
		var _playObj = "";

		if(jQuery.browser.msie) _playObj = this.playerIE(Url, objName, type);
		else _playObj = this.playerETC(Url, objName, type);

		return _playObj;
	},

	endding : function(Mode, ch_userid, prgid){
		var Obj = this;
		//var html = this.getAdPlayer("http://imgcdn.pandora.tv/gplayer/category/pandora_Endingstill.swf?stillUrl="+escape("http://ads.pandora.tv/NetInsight/text/pandora/category/list@endding_still")+"&stillTime=5&stillReCount=3&ending=" + Mode + "&ch_userid=" + ch_userid + "&prgid=" + prgid + "&sbs=" + this._Sbs, 'enddingPlayer');
		var html = this.getAdPlayer("http://imgcdn.pandora.tv/gplayer/newPlayer_2012/pandora_Endingstill_v2.swf?stillUrl="+escape("http://ads.pandora.tv/NetInsight/text/pandora/category/list@endding_still?edugrd=" + chInfoJson['c1'])+"&stillTime=5&stillReCount=6&ending=" + Mode + "&ch_userid=" + ch_userid + "&prgid=" + prgid + "&sbs=" + this._Sbs, 'enddingPlayer');
		jQuery(this._EnddingId).show();
		jQuery(this._EnddingId).html(html);

		//try { oMo.mo_stop(); } catch(e) {}
		try { 
			jQuery("#microAdDiv").hide();
			jQuery("#microAdDiv").html("");
			jQuery("#microAdDiv1").hide();
			jQuery("#microAdDiv1").html("");
		} catch(e) {}
	},

	videoPlay : function(){
		//try { oMo.mo_play(); } catch(e) {}
	},

	videoPause : function(){
		//try { oMo.mo_stop(); } catch(e) {}
	},

	videoReplay : function(){
		jQuery(this._EnddingId).html('');
		jQuery(this._EnddingId).hide();
		document.flvPlayer.reStart();

		//try { oMo.mo_play(); } catch(e) {}
	},

	endingReplay : function(){
		jQuery(this._EnddingId).html('');
		jQuery(this._EnddingId).hide();
		document.flvPlayer.reStart();

		//try { oMo.mo_play(); } catch(e) {}
	},

	endingNext : function(Mode){
		var Obj = this;
		var target = "";
		var relative = jQuery('.thmb_area').children('div,li');

		if(relative.length > 1) {
			relative.each(function(i) {
				var kwick = jQuery(this);
				if(kwick.attr("select") == "active") {
					target = (i+1);
				}
			});

			if(!target) target = 1;

			if(relative.length != target) {
				if(Mode == "set") return "y";
				else Obj.getPlayer('relative' + (target + 1), 'Relative');
			} else {
				var pageNext = jQuery('#pageNext').attr("pageNext");
				if(pageNext == "true") {
					if(Mode == "set") return "y";
					else {
						jQuery('#pageNext').click();
						setTimeout(function() {
							Obj.getPlayer('relative1', 'Relative');
						}, 500);
					}
				} else {
					if(Mode == "set") return "n";
				}
			}
		} else {
			if(Mode == "set") return "n";
		}
	},

	videoShare : function(ch_userid, prgid){
		jQuery(this._CloseId).click();
		LayerAction.Share(ch_userid, prgid);
	},

	googleLog : function(log){
		//jQuery.getScript('http://wdev.pandora.tv/category.ptv/etc/google/'+log);
	},

	watchedVideo : function() { // 최근본 동영상에 담기
		try {
			var dat = SharedObject.getItem('vMovie');

			if(dat.indexOf("[object Object]") > -1) dat = dat.replace(/, \[object Object\]/g, '');	// shared object 보완 필요
			var tmp = eval(dat) || [];

			var prgInfo = this.vodInfo;//재생중인 영상 정보

			if (!this.chkDuplicate(tmp, prgInfo['prg_id'])) {
				if (tmp.length > 20) tmp.shift();
				var appendData = [prgInfo['title'], prgInfo['prg_id'], prgInfo['userid'], prgInfo['real_runtime'], prgInfo['upload_nickname']];
				if(parseInt(prgInfo['status'], 10) == 30010) {
					appendData.push({prgid:prgInfo['parent_prg_id'], chuserid:prgInfo['upload_userid'], chname:prgInfo['upload_nickname']});
				}
				tmp.push(appendData);

				SharedObject.setItem('vMovie', jQuery.toJSON(tmp));
			}
	
		} catch (e) {}
	},

	prgHitAction : function() { // 해당 채널에 HIT
		var prgInfo = this.vodInfo;
		var adult_chk = "n";

		if (prgInfo["adult_chk_age"] >= 18) {
			adult_chk = "y";
		}

		var runtime = prgInfo["runtime"];

		var prg_pub = (prgInfo["prg_pub"]) ? prgInfo["prg_pub"].toString() : "0";
		var pstatus = (prgInfo["status"]) ? prgInfo["status"].toString() : "30003";
		var categ = (prgInfo["all_class_code"]) ? prgInfo["all_class_code"].toString() : "050061";
		var inputresol = (prgInfo["resolquality_type"] == 2) ? "2" : "1";

		var obj = jQuery.toJSON({'userid':prgInfo['userid'], 'prgid':prgInfo['prg_id'], 'status':pstatus, 'prg_pub':prg_pub, 'adult_chk':adult_chk, 'runtime':runtime,'categ':categ,'language':prgInfo["language"],'resol':inputresol});
		jQuery('#hitJson').val(obj);
		jQuery('#hitForm').attr("target", "prgHitIfr");
		jQuery('#hitForm').attr("action", "http://embed.pandora.tv/json/v003/h_index.ptv").submit();
		
		if(parseInt(prgInfo["status"], 10) == 30010) {	// 스크랩 영상이면 원본 유저에게도 올려준다.
			var obj = jQuery.toJSON({'userid':prgInfo['upload_userid'], 'prgid':prgInfo['parent_prg_id'], 'status':pstatus, 'prg_pub':prg_pub, 'adult_chk':adult_chk, 'runtime':runtime,'categ':categ,'language':prgInfo["language"],'resol':inputresol});

			jQuery('#hitJson').val(obj);

			setTimeout(function(){
				jQuery('#hitForm').attr("target", "prgHitIfr");
				jQuery('#hitForm').attr("action", "http://embed.pandora.tv/json/v003/h_index.ptv").submit();
				
			}, 2000);
		}
	},

	chkDuplicate : function(arr, prgid) {
		var duplicated = false;
		for(var i=0, limit=arr.length; i<limit; i++) {
			if(arr[i][1] == prgid) duplicated = true;
		}
		return (duplicated == true) ? true : false;
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
			//_playUrls = "http://imgcdn.pandora.tv/gplayer/dongbum/icf_player_3.swf?lang=" + chInfoJson['language_code'] + "&" + Url;
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
			//_playUrls = "http://imgcdn.pandora.tv/gplayer/dongbum/icf_player_3.swf?lang=" + chInfoJson['language_code'] + "&" + Url;
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

	Error : function(target){
		var Obj = this;

		var vData  = '<div class="voderror"><div class="voderror_box mag_novod"></div></div>';

		jQuery('#'+this._ViewId).html(vData);

		jQuery.getScript('http://ads.pandora.tv/NetInsight/text/pandora/category/list@imps');

		jQuery(this._CloseId).click(function() {
			jQuery('#show'+target).show();
			jQuery('#'+Obj._ViewId).remove();
		});
	}
};

// Sbs Menu List
var sbsList = {
	vUrl : "",

	set : function(c1, cate)
	{
		this.vUrl = "?m=sbs_menu_list&c1=" + c1 + "&cate=" + cate + "&output=false";
		this.vData = jQuery.ajax({ url: this.vUrl, async: false }).responseText;

		jQuery(".section_procategory").html(this.vData);
	}
};

// Ranking Menu List
var rankingList = {
	vUrl : "",

	set : function(cate)
	{
		this.vUrl = '?m=ranking_list&cate=' + encodeURIComponent(cate) + "&output=false" + '&c1=' + chInfoJson['c1'];
		this.vData = jQuery.ajax({ url: this.vUrl, async: false }).responseText;

		jQuery(".section_wtrnk").html(this.vData);
	}
};

// Relative List
var relativeList = {
	vUrl : "",
	vGrpPrgId  : "",
	vPage : 1,
	_Ui : "#relative",
	_UiButton : ".btn_relamov",

	set : function()
	{

		if((jQuery(this._Ui).css('display') == 'none')) {
			jQuery(this._UiButton).removeClass('close');
			jQuery(this._Ui).addClass('open');
			jQuery(this._Ui).show();
		} else {
			jQuery(this._UiButton).removeClass('open');
			jQuery(this._UiButton).addClass('close');
			jQuery(this._Ui).hide();
		}
	},
	getAjax : function(ch_userid, prgid, page, sbs)
	{
		var Obj = this;
		try {
			if(page) this.vPage = page;
			jQuery('.playClick').unbind('click');

			this.vUrl = '?m=json_relative_list&ch_userid='+ch_userid+'&prgid='+prgid+'&page='+this.vPage+'&sbs='+sbs+'&grp_prg_id='+this.vGrpPrgId;
			if(playerSet._set_mode == "autoPlay") this.vUrl += '&cate=' + playerSet._set_mode;

			jQuery.ajax({ 
				url: this.vUrl,
				success : function(res){
					jQuery(Obj._Ui).html(res);
					jQuery(Obj._Ui).show();

					jQuery('.playClick').click(function() {
						var playId = jQuery(this).attr("play");
						playerSet.getPlayer(playId, 'Relative', page);
					});
				}
			});
		} catch(e) {}
	},
	getLoading : function()
	{
		var vData = '<div id="relative_list" class="photo_type_box etc_list" style="text-align:center;height:114px;"><img src="http://imgcdn.pandora.tv/ptv_img/pandora_images/icoLoading_B.gif" height="35" class="loding" alt="로딩중" style="margin-top:20px;"/><a class="btn_prev"><span class="blind">이전</span></a><a class="btn_next"><span class="blind">다음</span></a></div>';

		jQuery(this._Ui).html(vData);
	}
};

// Ment List
var mentList = {
	vUrl : "",
	vEvent : "",
	vMent : "",
	vPage : 1,
	_Ui : "#comt_area",
	_LivereUi : "#comt_livere_area",

	set : function(ch_userid, prgid, page)
	{
		this.getAjax(ch_userid, prgid, page);
		return;
		if((jQuery(this._LivereUi).css('display') == 'none')) {
			if(!jQuery(this._Ui).html()) this.getAjax(ch_userid, prgid, page);
			//jQuery(this._Ui).show();
			
			jQuery(this._LivereUi).show();
		} else {
			jQuery(this._LivereUi).hide();
		}
	},
	getAjax : function(ch_userid, prgid, page)
	{
		try {
			if(page) this.vPage = page;

			this.vUrl = '?m=ment_list&ch_userid='+ch_userid+'&prgid='+prgid+'&page='+this.vPage+"&output=FALSE";
			this.vData = jQuery.ajax({ url: this.vUrl, async: false }).responseText;

			jQuery(this._Ui).html(this.vData);
		} catch(e) {}
	},
	mentReg : function(ch_userid, prg_id, formid) {
		// 로그인 체크  비로그인시 guest 로 변경
		if (!cookieSet.GetCookie('glb_mem[userid]')){
			if(  this.strTrim(jQuery("#ipt_name").val()) == "" ){
			//	jQuery("#ipt_name").val("guest");
			//	jQuery(".it1").css('display','none');
			}

			if (this.strTrim(jQuery("#ipt_pwd").val()).length < 4  && this.strTrim(jQuery("#ipt_pwd").val()).length > 0 ){
				alert("비밀번호를 4자 이상으로 입력해주세요.");
				jQuery("#ipt_pwd").focus();
				return;
			}
		}


		var mid = (jQuery("#" + formid).attr("mid")) ? jQuery("#" + formid).attr("mid") : 0;

		var ment_type		= jQuery("#" + formid).attr("mType");
		var ment_reply		= jQuery("#" + formid).attr("mReply");

		var w_userid		= cookieSet.GetCookie('glb_mem[userid]') ? cookieSet.GetCookie('glb_mem[userid]') : this.strTrim(jQuery("#ipt_name").val());;
		var w_name			= cookieSet.GetCookie('glb_mem[nickname]') ? cookieSet.GetCookie('glb_mem[nickname]') : this.strTrim(jQuery("#ipt_name").val());
		var w_pwd			= cookieSet.GetCookie('glb_mem[userid]') ? "" : this.strTrim(jQuery("#ipt_pwd").val());

		w_userid	= w_userid ? w_userid : "UGFuZG9yYVRW";
		w_name		= w_name ? w_name : "UGFuZG9yYVRW";

		if (this.strTrim(jQuery("#content").val()) == "" || this.strTrim(jQuery("#content").val()) == "재미있으셨어요? 답글을 달아주세요." || this.strTrim(jQuery("#content").val()) == "등록된 답글이 없습니다. 지금 등록하면 1등^^") {
			alert("내용을 입력해 주세요");
			jQuery("#content").val("");
			jQuery("#content").focus();
			return;
		}

		var rcontent = this.strTrim(jQuery("#content").val());
		if (this.strTrim(jQuery("#content").val()).length < 5 || this.strTrim(jQuery("#content").val()).length >= 100 ) {
			alert("내용은 5글자 이상 100글자 미만으로 입력해 주세요");
			jQuery("#content").focus();
			return;
		}

		var sendObj = jQuery.toJSON({"ch_userid":ch_userid, "prg_id":prg_id, "w_userid":w_userid, "w_name":w_name, "contents":jQuery("#content").val(), "w_lang":chInfoJson["clientLang"], "w_ment_title":"", "w_ment_url":"", "ment_type":"", "img_code":"", "parent_id":mid.toString(),"w_pwd":w_pwd});

		jQuery.ajax({
			type : 'POST',
			data : {"json":sendObj},
			url : "http://channel.pandora.tv/json/v005/GPrgMent2.dll/write",
			dataType : "jsonp",
			jsonp : "callback",
			success : function (res) {
				sns_url ='http://channel.pandora.tv/video.ptv?ch_userid='+ch_userid+'&prgid='+prg_id;
				var sns_fb = jQuery("#sns_fb_check").prop("checked");
				var sns_tw = jQuery("#sns_tw_check").prop("checked");
				if (sns_fb){ goFaceBook();}
				if (sns_tw){ goTwitter();}

				var rCnt = parseInt(jQuery("#rly_cnt").html(), 10);
				rCnt++;
				jQuery("#rly_cnt").html(rCnt);
				
				mentList.getAjax(ch_userid, prg_id, 1);
				
				var commentLogUrl = 'http://log.sv.pandora.tv/pTVMent?type=category&country='+cookieSet.GetCookie('ipCountry')+'&UILang=' + chInfoJson["clientLang"] + '&userid=' + w_userid + '&prgid=' + prg_id + '&GUID=' + cookieSet.GetCookie('PCID') + '&writeid=' + w_name + '';
				jQuery.getScript(commentLogUrl);
				//alert(commentLogUrl);
			},
			404 : function () {
				alert('비정상적인 접근 입니다.');
			},
			error : function () {
				alert(' ment  regist error ');
			}
		});
	},
	mentInputBoxReset : function(kind, obj) {
		// 로그인 체크
		/*
		if(!cookieSet.GetCookie('glb_mem[userid]')) {
			if (confirm("로그인을 먼저 하셔야 합니다. \n\n지금 로그인 하시겠습니까?")) {
				LoginAction.Login();
			} else obj.blur();

			return;
		}
		*/

		this.vMent = obj.value;

		switch (kind) {
			case "vtitle" :
				if (obj.value == "동영상 제목을 입력해주세요") {
					obj.value = "";
				}
			break;
			case "vtag" :
				if (obj.value == "embed,object 소스를 입력해 주세요 ") {
					obj.value = "";
				}
			break;
			case "name" :
				if (obj.value == "이름") {
					obj.value = "";
				}
			break;
			case "pwd" :
				if (obj.value == "비밀번호") {
					obj.value = "";
				}
			break;
			case "content" :
				if (obj.value == "재미있으셨어요? 답글을 달아주세요." || obj.value == "등록된 답글이 없습니다. 지금 등록하면 1등^^") {
					obj.value = "";
				}
			break;
		}
	},
	checkInsert : function(obj) {
		if (obj.value == "") {
			obj.value = this.vMent;
		}
	},
	/* Trim */
	strTrim : function (str) {
		str = str.replace(/^ +/g, "");
		str = str.replace(/ +$/g, " ");
		str = str.replace(/ +/g, " ");
		return str;
	},

	RePlayView : function( strV, strN ) {
		jQuery("#" + strV).css("display", "block");
		jQuery("#" + strN).css("display", "none");

		if( strV == "comt_livere_area" ){
			jQuery("#afDiv").css("display", "block");
		//	jQuery("#bfDiv").css("display", "none");
		}else{
		//	jQuery("#bfDiv").css("display", "block");
			jQuery("#afDiv").css("display", "none");
		}
	},

	livereFn : function(strSite) {
		var prgInfo = playerSet.vodInfo;

		/* 설정 부분 */	
		title = prgInfo['title']; //(해당게시물 제목)
		refer = 'www.pandora.tv/my.' + prgInfo['userid'] + '/' + prgInfo['prg_id']; //(http://를 제외한 해당페이지 URL)
		/*
		consumer_seq					= "244";
		livere_seq						= "7667";
		smartlogin_seq                 = "273";
		*/
/*
		liveReClass.livereGroupId      = prgInfo['group_no'];
		liveReClass.videosrc           = 'http://flvr.pandora.tv/flv2pan/flvmovie.dll/userid=' + prgInfo['userid'] + '&prgid=' + prgInfo['prg_id'] + '&countryChk=ko';
		liveReClass.videothumb         = this.getVodThumbnail(prgInfo['userid'], prgInfo['prg_id']);	//동영상섬네일
		liveReClass.title              = title;
		liveReClass.refer              = refer;
		liveReClass.site               = "http://" + liveReClass.refer;
		liveReClass.description        = "";
		liveReClass.liveReInit();
*/
	},

	livereFn_X : function(strSite) {	// 사용 안함
		/* 라이브리 측에서 발급된 플랫폼 사용권한 Seq No. */

		var prgInfo = playerSet.vodInfo;

		/* 설정 부분 */	
		title = prgInfo['title']; //(해당게시물 제목)
		refer = 'www.pandora.tv/my.' + prgInfo['userid'] + '/' + prgInfo['prg_id']; //(http://를 제외한 해당페이지 URL)

		/* 라이브리 객체 생성 */
		livereReply = new Livere( livere_seq , refer , title );
			
		livereReply.site = "channel.pandora.tv/channel/video.ptv?ch_userid=" + prgInfo['userid'] + "&prgid=" + prgInfo['prg_id'] + "&ref=livere";
		livereReply.livereGroupId = prgInfo['userid'];

		livereReply.videosrc = 'http://flvr.pandora.tv/flv2pan/flvmovie.dll/userid=' + prgInfo['userid'] + '&prgid=' + prgInfo['prg_id'] + '&countryChk=ko';	//동영상URL
		livereReply.videothumb = this.getVodThumbnail(prgInfo['userid'], prgInfo['prg_id']);	//동영상섬네일

		/** 모듈 시작 (필수) **/
		try {
			setTimeout(function(){
				livereLib.start();
				//console.log("livereLib.start()");
			}, 2000);
		}catch(e){
//			livereLib.start();
		}
	}, 

	getVodThumbnail : function(argUserid, argPrgid) {
		argUserid = argUserid.toLowerCase();
		var noPrgid = 30800000 ; /* 로컬 통합 정책시 적용되는 기준 프로그램 아이디...*/
		var arrSizeDir = new Array("_channel_img_sm", "_channel_img");
		var path = "http://imguser.pandora.tv/pandora/";

		if(arguments[2] != undefined && (arguments[2].toUpperCase() == "M")) {
			path += arrSizeDir[1] + "/";
		} else {
			path += arrSizeDir[0] + "/";
		}

		if(argUserid && argPrgid) {
			for(var i=0;i<2;i++) {
				path += argUserid.substr(i, 1) + "/";
			}

			path += argUserid + "/";
			if(argPrgid > noPrgid) {
				var leng = String(argPrgid).length;
				path += String(argPrgid).substring(leng, leng-2) + "/";
			}
			path += "vod_thumb_" + argPrgid + ".jpg";

		} else {
			path += "g/u/guest/guest.gif";
		}
		return path;
	},

	mentClickEvt : function(mid, kind, e){
		
		if (cookieSet.GetCookie('glb_mem[userid]') == "pandoratv") { kind = 'my'; }

		switch (kind) {
			case "my" :
				if(confirm('삭제하시겠습니까 ?')) {
					this.mentDelAction(mid, e);
				}
			break;

			default :
				this.mentDelForm(mid, e);
			break;
		}
	},

	mentDelFormReset : function(){
		jQuery("#password").val("");
		jQuery("#comt_pwdbox").css({"display":"none"});
	},

	mentDelForm : function(mid, evt){
	
		if( evt ){
			var xPos = evt.pageX;
			var yPos = evt.pageY;
		}else{
			var xPos = event.pageX;
			var yPos = event.pageY;
		}

		if( typeof(xPos) == 'undefined' ){
			var xPos = event.clientX;
			var yPos = event.clientY + document.documentElement.scrollTop;
		}

		var viewbox = jQuery('.del_newbox2012').css("display");
		if( viewbox == "block" ){
			jQuery("#password").val("");
			jQuery('.del_newbox2012').css("display","none");
		}else{
			jQuery('.del_newbox2012').css("display","block");

			var yPos_1 = (yPos - parseInt(jQuery(".c_area").offset().top)) + 15;
			var xPos_1 = (xPos - parseInt(jQuery(".c_area").offset().left)) - 125;

			jQuery('.del_newbox2012').css({"left":xPos_1,"top":yPos_1});
			jQuery("#comt_pwdbox").attr("mid", mid);
		}
	}
	,

	mentDelAction : function(mid, evt, passwd) {
		var prgInfo = playerSet.vodInfo;
		if (passwd) {
			var obj = jQuery.toJSON({"ch_userid":prgInfo["userid"], "prg_id":prgInfo["prg_id"], "ment_id":mid, "password":passwd});
		} else {
			var obj = jQuery.toJSON({"ch_userid":prgInfo["userid"], "prg_id":prgInfo["prg_id"], "ment_id":mid});
		}

		jQuery.ajax({
			url : "http://channel.pandora.tv/json/v003/GprgMent.dll/Delete", 
			type : 'POST',
			data : {"json":obj},
			dataType : "jsonp",
			jsonp : "callback",
			success : function (res) {
				//res = eval('(' + res + ')');
				sns_url ='http://channel.pandora.tv/video.ptv?ch_userid='+ch_userid+'&prgid='+prg_id;
				var sns_fb = jQuery("#sns_fb_check").prop("checked");
				var sns_tw = jQuery("#sns_tw_check").prop("checked");

				if (sns_fb){ goFaceBook();}
				if (sns_tw){ goTwitter();}
				
				if (res.isDelete == "1") {
					
					var rCnt = parseInt(jQuery("#rly_cnt").html());
					if (rCnt > 0) {
						rCnt--;
					}
					jQuery("#rly_cnt").html(rCnt);
					if( passwd ){
						mentList.mentDelFormReset();
						jQuery("#comt_pwdbox").css({"display":"none"});
					}

					mentList.getAjax(prgInfo["userid"], prgInfo["prg_id"], 1);

				} else {
					if (passwd) {
						alert('자신이 쓴 글만 지울수 있습니다.');
						mentList.mentDelFormReset();
					}else
						alert('자신이 쓴 글만 지울수 있습니다.');
				}
			},
			404 : function () {
				alert('비정상적인 접근 입니다.');
			},
			error : function (xhr, textStatus, errThrown) {
				var res = "";
				try { res = eval('(' + xhr.responseText + ')'); }
				catch (e) { }

				if (res.isDelete == "1") {
					
					var rCnt = parseInt(jQuery("#rly_cnt").html());
					if (rCnt > 0) {
						rCnt--;
					}
					jQuery("#rly_cnt").html(rCnt);

					mentList.getAjax(prgInfo["userid"], prgInfo["prg_id"], 1);
					
				} else {
					alert('자신이 쓴 글만 지울수 있습니다. -');
					//_layerPop.closePopup();
				}
			}
		});
	}
};