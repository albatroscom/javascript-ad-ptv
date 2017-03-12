/* MO ****************************************************************/
var oMo = {
	panset     : "on",
	PLAYER_ELEMENT_ID : document.flvPlayer,

	_res       : null,
	_Imgres    : null,

	mi         : 0,
	mj         : 0,
	mk         : 0,
	snum       : "",
	csnum      : "",
	oldsum     : "",

	// mo 기본 설정
	dt         : new Date(),
	delaytime  : 21000,
	gettime    : 10100,
	inittime   : 1000,
	xsize      : 11,
	xborder    : 1,
	xdraw      : 1,

	tid1       : null,
	tid2       : null,
	tid3       : null,
	msc        : null,

	adMsg		: new Array(),
	imgpath	: "http://imgcdn.pandora.tv/static/",
	currentShowLogo : 0,

	setIni : function(isMO) {	// 0 / 1
		switch(true) {
			case (this.panset == "on" && isMO == 1) : return;
			case (this.panset == "off" && isMO == 0) : return;
		}

		this.panset = (isMO == 1) ? "on" : "off";
		if(this.isPlay() == true) {
			if(isMO == 0) this.mo_stop();
			else {
				if(isMO == 1) { this.mo_play(); }
			}
		}
	},

	initMsg : function () {	// 메세지 초기화
		try { 
			document.flvPlayer.setMo("msg", '{"m_clickURL":"","m_message":"","m_fontColor":"","m_font":"","m_fontSize":""}');
		} catch(e) {return;}
	},

	writeHtml : function () {	// 메세지 출력
		try {
			var obj = this;
			this.mj++;
			this.csnum = cookieSet.GetCookie("snum");
			this.msc = this.dt.getSeconds() + "" + this.dt.getMilliseconds();

			this.getMo("snum");

			if ((this.snum != this.oldsnum || this.mj < 2) && (this.snum != "" && this.csnum != this.snum)) {
				this.getMo("msg");
			} else if(this.mj < 2) {
				this.initMsg();
			}

			if(this.mj < 2) {
				this.tid1 = setTimeout( function () { obj.writeHtml(); }, this.inittime);
			} else {
				clearTimeout(this.tid1);
				this.tid2 = setTimeout( function () { obj.writeHtml(); }, this.gettime);
			}
		} catch (e) {
            //alert('writeHtml error');
		}
	},

	mo_play : function () {
		this.mo_stop();
		if(this.panset == "off") {
			this.show_logo(0);
		} else {
			this.writeHtml();
			this.show_logo(1);
		}
	},

	mo_stop : function () {
        var obj = this;
        try {
		    this.clearCheck();
        } catch (e) {
            this.tid2 = setTimeout( function () { obj.mo_stop(); }, 2000);
        }
	},

	clearCheck : function () {
		try {
			document.flvPlayer.stopMo("all");
		} catch (e) {}

		try {
			clearTimeout(this.tid1);
		} catch (e) {}

		try {
			clearTimeout(this.tid2);
		} catch (e) {}

		try {
			clearTimeout(this.tid3);
		} catch (e) {}
	},

	clearSet : function () {
		this.mo_stop();
	},

	show_pan : function () {
		try {
			if(this.currentShowLogo==1) {
				this.show_logo(0);
				this.clearSet();
			} else {
				this.show_logo(1);
				this.writeHtml();

				this.panset = "on";
			}

        } catch (e) {}
	},

	show_logo : function (num) {
        if(num == 1) {
            this.currentShowLogo = 1;
        } else {
            this.currentShowLogo = 0;
        }
	},

	displayMsg : function (args) {
		var obj = this;
		var strHTML = "";
		var size    = new Array();
		var size_w  = "";
		var size_h  = "";
		var vmsg    = "";

		if(document.flvPlayer == undefined) return;

		if(this.panset != "off") {
			if(args != undefined) this._res = args;
			if((this._res != undefined)) {
				if(this._res.length > this.mi) {
					if (this.mk < 1 && parseInt(this.adMsg.length, 10) > 0) {  //페이지 로딩후 최초1회한 2007-09-12 10:13오전 by royes
						var rn = Math.floor(Math.random()* parseInt(this.adMsg.length, 10));
						strHTML = this.adMsg[rn];
						this.gettime=10100;
						this.mk++;
					}
					else {
						strHTML = this._res[this.mi];
						strHTML = strHTML.replace("\n", "");  //개행문자변경.. only for p3player
						this.gettime=10100;
						this.mi++;
					}
					var vcolor = "";
					var vvmsg = strHTML.substring(0, strHTML.length-2);

					var msgAr = new Array();

					var m_message = "";
					var m_clickURL = "";
					var m_screen = "true";
					var m_font = "Arial,Tahoma, Helvetica, sans-serif";
					var m_fontColor = "#ffffff";
					var m_fontSize = "12";
					var m_rollingTime = "10";
					var m_setting = "";

					// 메시지|URL|새창여부(popup,new)|창 사이즈”_”가 구분자|폰트 색|폰트 종류
					//   0   | 1 |    2              |         3           |   4   |    5
					var is_admin = strHTML.substring(strHTML.length-2,strHTML.length);		//관리자추가(a1:판PD, a2:도라PD)
					msgAr = vvmsg.split("|");

					// 폰트색 정의
					if (is_admin == ")a" || is_admin == "a1" || is_admin == "a2" || is_admin == "ad") {
						if (is_admin == "ad") {
							msgAr[4] = "0x00" + "ff74d0";
							m_fontColor = "#FFFF00";
						} else if (is_admin == "a2") {
							msgAr[4] = "0x00" + "ff74d0";
							m_fontColor = "#febbfe";
						} else {
							msgAr[4] = "0x00" + "00ffff";
							m_fontColor = "#A851FF";
						}
					} else {
						if (msgAr[4] == "" || msgAr[4] == undefined) {
							msgAr[4] = "0x00" + "bbbbbb";
						} else {
							msgAr[4] = "0x00" + msgAr[4].substring(-2) + msgAr[4].substring(2, 2) + msgAr[4].substring(2);
						}
						m_fontColor = "#ffffff";
					}
					// 폰트 정의
					if (msgAr[5] == "" || msgAr[5] == undefined) {
						msgAr[5] = "돋움";
					}

					// 링크 정의
					msgAr_2 = "0";
					// 윈도우 창 크기
					if (msgAr[2] == "p" && (msgAr[3] && msgAr[3] != undefined) ) {
						size = msgAr[3].split("_");
						size_w = size[0];
						size_h = size[1];
						msgAr_2 = "2";
					} else {
						if (msgAr[2] == "n") {
							msgAr_2 = "1";
						}
						size_w = "0";
						size_h = "0";
					}

					// 메세지 정의
					if (msgAr[1] == "" || msgAr[1] == undefined) {
						if (msgAr.length > 1) {
							vmsg = msgAr[0];
						} else {
							vmsg = vvmsg;
						}
						msgAr[1] = " ";
					} else {
						if (msgAr_2 == "0") {
							msgAr_2 = "1";
						}
						vmsg = "[클릭]"+msgAr[0];
						m_clickURL = msgAr[1];
					}
					m_message = vmsg;

					if (is_admin != ")a" && is_admin != "a1" && is_admin != "a2" && is_admin != "ad") {
						msgAr_2 = "1";
						m_clickURL = "http://mobile.pandora.tv/mo/r.ptv";
					} else {
						if(m_clickURL == "")	{
							msgAr_2 = "1";
							m_clickURL = "http://mobile.pandora.tv/mo/r.ptv";
						}
					}

					m_setting = '{"m_message":"'+m_message+'","m_clickURL":"'+m_clickURL+'","m_screen":"'+m_screen+'","m_font":"'+m_font+'","m_fontColor":"'+m_fontColor+'","m_fontSize":"'+m_fontSize+'","m_rollingTime":"'+m_rollingTime+'"}';
					try {
						document.flvPlayer.setMo("msg", m_setting);
					} catch (e) {}

					clearTimeout(this.tid2);
					if(this._res.length > this.mi) {
						this.tid3 = setTimeout( function () { oMo.displayMsg(); }, this.gettime);
					} else {
						this.tid3 = setTimeout( function () { oMo.displayMsg(); }, this.delaytime);
					}

				} else {
					this.mi = 0;
					this.initMsg();
					clearTimeout(this.tid2);
					this.tid2 = setTimeout( function () { oMo.writeHtml(); }, this.inittime);
				}
			}
		}
	},

	getMo : function (res) {
		var targetUrl   = "";
		if (res == "msg" || res == null) {
			targetUrl = "/mo.ptv?target=msg";
			this.oldsnum = this.snum;
			cookieSet.SetCookie("snum", this.snum);
		} else {
			targetUrl = "/mo.ptv?target=snum";
		}

		jQuery.get( targetUrl, function(data) {
			oMo.ajaxCallback(data);
		});
	},

	ajaxCallback : function (res) {
		var ajax = "";

		if(res != "") {
			try {
				eval("ajax = " + res);
			} catch (e) {}

			if (res.indexOf(this.imgpath) == -1) {
				if (parseInt(res, 10) > 20070000000000) {
					this.snum = parseInt(res, 10);
				} else {
					//alert("responseText:"+res);
					this.displayMsg(ajax[0]);
				}
			}
        }
	}
}