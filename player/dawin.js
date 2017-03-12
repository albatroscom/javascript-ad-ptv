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
		var videoWrapperSelector = ".player";
		var videoWrapperSelector_fullHeight = ".visual.web";

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

				jQuery(".full").hide();

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
					jQuery("#big_play, .hdvdo, .app_down, .bar, .btn_area, #Application_Div").hide();
					jQuery(".visual").css({height: '160px'});

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
						jQuery(".visual").css({height: '240px'});
						jQuery(".bar, .btn_area, .full").show();
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

					overlayWindow.jQuery(".dawin_overlay").append($icon);

					$icon.on("click", function() {
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
									jQuery(".visual").css({height: '240px'});
									jQuery(".bar, .btn_area, .full").show();
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
						jQuery(".visual").css({height: '240px'});
						jQuery(".bar, .btn_area, .full").show();
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
					jQuery(".visual").css({height: '240px'});
					jQuery(".bar, .btn_area, .full").show();
				} catch (e) {}

				if(error === -1) {
					console.log("dawin 광고없음.");
				}
				else if(error === 0) {
					console.log("dawin 광고 xml 응답없음");
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