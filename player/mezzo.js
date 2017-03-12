// TODO-------------------------------------------------------------------------------------//
var mezzo_movie_api_domain = "http://mtag.mman.kr/movie.mezzo"; 
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
		
		//카테고리 정보 존재하는 경우만 카테고리 정보 포함하여 전달
		if(typeof(mCategory)=='undefined' || mCategory==''){
			var mApiUrl = mezzo_movie_api_domain+"/"+mWindowID+"/"+mAppID+"";	
		}else{
			var mApiUrl = mezzo_movie_api_domain+"/"+mWindowID+"/"+mAppID+"?m_cate="+mCategory;
		}
		
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
			jQuery("#big_play, .hdvdo, .app_down, .bar, .btn_area, #Application_Div").hide();
			jQuery(".full").hide();
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
				jQuery(".visual").css({height: '240px'});
				jQuery(".bar, .btn_area, .full").show();
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
		
		$a.bind('click', function(event) {
			setTimeout(function(){
				try{
					//console.log(mezzo.data);
					if(typeof(mezzo.data) != "undefined" && mezzo.data != null && mezzo.data != "" ){						
						mezzo.run(mezzo.data,eventClass.setEvent());	
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
						mezzo.run(mezzo.data,eventClass.setEvent());	
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
		if(typeof(data.movie_api)=="undefined" || data.movie_api==""
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
	//console.log("API_CALL START");
	//console.log(_url);
    $.ajax({     
		url : _url,
		dataType:"json",
		crossDomain : true,			
		type: "GET",	
		error: function( jqXHR, textStatus, errorThrown ){},
		success : function(data){}
	});
}