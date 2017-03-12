// 2012년2월 박승호
// 유투브의 비디오 확장 기능 구현함.
// 파이어폭스에서는 제이쿼리의 애니메이트를 사용하여 플레이어 박스를 확장시키면
// 리셋되는 현상이 발생함.
// 따라서 아래와 같이 setinterval을 사용하여 확장되는 스크립트를 구현하였음.

var sh_speed =2;
var sh_oval=1; //오차

var setint_LW = null;
var setint_LH = null;
var setint_SW = null;
var setint_SH = null;

var twidth = 0;
var theight = 0;
var LgWidth = 800;
var LgHeight = 480;
var SmWidth = 640;
var SmHeight = 390;
var skipOverSLeft = 82;
var skipOverLLeft = 250;



function sizeChange( intFlag ){
	try {/*
		jQuery("#microAdDiv").hide();
		jQuery("#microAdDiv").html("");
		jQuery("#microAdDiv1").hide();
		jQuery("#microAdDiv1").html("");
		*/
	} catch(e) {}

	//intFlag : 0 ( 축소 ) , 1 ( 확대 )
	if( cookieSet.GetCookie('extSet') != intFlag && intFlag == 1 ){
		playerL();
	}else if( cookieSet.GetCookie('extSet') != intFlag && intFlag == 0 ){
		playerS();
	}
}

function playerL(){
	jQuery("#flvIcf").css("height", "100%");
	jQuery("#watch-video").css("padding", "0");
	try {
		clearInterval(setint_SH);
		clearInterval(setint_SW);
		clearInterval(setint_LH);
		clearInterval(setint_LW);
		jQuery(".ban_if_add").css("left", skipOverLLeft);
	}
	catch (e) {
	}
	cookieSet.SetCookie('extSet', '1', 60*60*3650);
	extArea();

	jQuery("#psh_top").css({"z-index":"3"});
	$("#divPlayer").css("margin","0 auto");
	jQuery(".content_lft").css({"margin-top":"0"});

	try{
		if( jQuery("#pause_banner_Big").css("display") == "block" ){
			vodPauseFunc('puase');
		}
	} catch (e)	{}
}

function extArea() {
	setint_LW = setInterval(function() {  MoveBox("width", LgWidth ,setint_LW,"LL"); },10);
	setint_LH = setInterval(function() {  MoveBox("height", LgHeight ,setint_LH,"LL"); },10);
	$("#psh_top").addClass("width_s_bg");
	$("#sh_left").stop();
	$("#sh_left").animate({marginTop:"0px"}, 500 ); //오른쪽 영역
}

function playerS(){
	jQuery("#watch-video").css("padding", "0");
	try {
		clearInterval(setint_SH);
		clearInterval(setint_SW);
		clearInterval(setint_LH);
		clearInterval(setint_LW);
		jQuery(".ban_if_add").css("left", skipOverSLeft);
	}
	catch (e) {
	}
	cookieSet.SetCookie('extSet', '');
	setint_SW = setInterval(function() {  MoveBox("width", SmWidth ,setint_SW,"SS"); },10);
	setint_SH = setInterval(function() {  MoveBox("height", SmHeight ,setint_SH,"SS"); },10);
	$("#psh_top").removeClass("width_s_bg");
	$("#sh_left").stop();
	
	if(chInfoJson['language'] == "40003")
		$("#sh_left").animate({marginTop:"-425px"}, 500 ); //오른쪽 영역
	else
		$("#sh_left").animate({marginTop:"-405px"}, 500 ); //오른쪽 영역

	jQuery(".content_lft").css({"margin-top":"0"});
	$("#watch-video").css({position: 'relative', top: '0'});

	jQuery("#psh_top").css({"z-index":"1"});
	$("#divPlayer").css("margin","0");

	try{
		if( jQuery("#pause_banner_Big").css("display") == "block" ){
			vodPauseFunc('puase');
		}
	} catch (e)	{}
}


function MoveBox(cssName,targetVal,interName,Type){ //대상스타일속성,목적값,인터벌명

	var thisVal=parseInt($("#divPlayer").css(cssName));
	var thisVal1=parseInt($("#flvIcf").css(cssName));

	var GOVal =   thisVal +  Math.floor((targetVal - thisVal) / sh_speed); //소수점이하 삭제하여 정수형으로 변환하였음
	var GOVal1 =   thisVal1 +  Math.floor((targetVal - thisVal1) / sh_speed); //소수점이하 삭제하여 정수형으로 변환하였음

	$("#divPlayer").css(cssName, GOVal);
	$("#flvIcf").css(cssName, GOVal1);
//	try {console.log($("#flvIcf").css(cssName)) } catch(e) {}

	if(Type == "LL"){
		if( GOVal == (targetVal-1) || GOVal > (targetVal-1)){//멈춤
			$("#divPlayer").css(cssName,targetVal);
			$("#flvIcf").css(cssName,targetVal);
			clearInterval(interName);
			interName = null;
		}
	}else if(Type == "SS"){
		if( GOVal == targetVal+1 || GOVal < targetVal+1){//멈춤
			$("#divPlayer").css(cssName,targetVal);
			$("#flvIcf").css(cssName,targetVal);
			clearInterval(interName);
			interName = null;
		}
	}else if(Type == "PP"){
		if( GOVal == targetVal+1 || GOVal < targetVal+1){//멈춤
			$("#divPlayer").css(cssName,targetVal);
			$("#flvIcf").css(cssName,targetVal);
			clearInterval(interName);
			interName = null;
		}
	}

}


var sh_speed =2;
var sh_oval=1; //오차

var setint_LW = null;
var setint_LH = null;
var setint_SW = null;
var setint_SH = null;

var twidth = 0;
var theight = 0;
var LgWidth = 970;
var LgHeight = 546;
var SmWidth = 606;
var SmHeight = 368;

var SmWidth = 640;
var SmHeight = 390;

// &sizeChange=1 확대 &sizeChange=0 축소

function _set_ext( extSize ){
	
	try {
		clearInterval(setint_SH);
		clearInterval(setint_SW);
		clearInterval(setint_LH);
		clearInterval(setint_LW);
	}
	catch (e) {
	}
	
	if( extSize == 'L' ) {
		
		//cookieSet.SetCookie('extSet', '1');
		//oCookie.set("playerExtSet", "L", 0);
		chPalyerExtSet = 'L';
		extAreaL();
		
	} else {
		
		//cookieSet.SetCookie('extSet', '1');
		//oCookie.set("playerExtSet", "S", 0);
		chPalyerExtSet = 'S';
		extAreaS();
	}
}

function extAreaL() {
	jQuery("#flvIcf").css("height", "100%");
	jQuery("#watch-video").css("padding", "0");
	try {
		clearInterval(setint_SH);
		clearInterval(setint_SW);
		clearInterval(setint_LH);
		clearInterval(setint_LW);
	}
	catch (e) {
	}
	cookieSet.SetCookie('extSet', '1', 60*60*3650);
	extArea();

	jQuery("#psh_top").css({"z-index":"3"});
	$("#divPlayer").css("margin","0 auto");
	jQuery(".content_lft").css({"margin-top":"0"});

	try{
		if( jQuery("#pause_banner_Big").css("display") == "block" ){
			vodPauseFunc('puase');
		}
	} catch (e)	{}
}

function extAreaS() {
	jQuery("#watch-video").css("padding", "0");
	try {
		clearInterval(setint_SH);
		clearInterval(setint_SW);
		clearInterval(setint_LH);
		clearInterval(setint_LW);
	}
	catch (e) {
	}
	cookieSet.SetCookie('extSet', '');
	setint_SW = setInterval(function() {  MoveBox("width", SmWidth ,setint_SW,"SS"); },10);
	setint_SH = setInterval(function() {  MoveBox("height", SmHeight ,setint_SH,"SS"); },10);
	$("#psh_top").removeClass("width_s_bg");
	$("#sh_left").stop();
	$("#sh_left").animate({marginTop:"-425px"}, 500 ); //오른쪽 영역
	jQuery(".content_lft").css({"margin-top":"0"});
	$("#watch-video").css({position: 'relative', top: '0'});

	jQuery("#psh_top").css({"z-index":"1"});
	$("#divPlayer").css("margin","0");

	try{
		if( jQuery("#pause_banner_Big").css("display") == "block" ){
			vodPauseFunc('puase');
		}
	} catch (e)	{}
}



