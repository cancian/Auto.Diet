﻿///////////////
// SAFE EXEC //
///////////////
if(typeof appStorage === 'undefined') { var appStorage = window.localStorage; }
if(typeof hostLocal  === 'undefined') { var hostLocal  = appStorage.getItem('config_debug') === 'active' ? https + '192.168.1.5/' : ''; }
var staticVendor = '';
var baseVersion  = 2.2;
var initTime     = new Date().getTime();
var UsrAgt       = navigator.userAgent;
var IsMsApp      = /MSApp/i.test(UsrAgt) ? true : false;
//safeExec
function safeExec(callback) {
	'use strict';
	if (IsMsApp) {
		MSApp.execUnsafeLocalFunction(function () {
			if(typeof callback === 'function') {
				callback();
			}
		});
	} else {
		if(typeof callback === 'function') {
			callback();
		}
	}
}
//##/////////////##//
//## DEV DEBUGER ##//
//##/////////////##//
var blockAlerts = 0;
/////////////
// ONERROR //
/////////////
window.onerror = function (err, url, line) {
	'use strict';
	if(!err)  { err  = ''; }
	if(!url)  { url  = ''; }
	if(!line) { line = ''; }
	//STRINGIFY
	if(typeof err !== 'string') {
		err  = JSON.stringify(err);
	}
	if(typeof url !== 'string') {
		url  = JSON.stringify(url);
	}
	if(typeof line !== 'string') {
		line = JSON.stringify(line);
	}
	////////////////////////////
	// DOM STORAGE AUTOREMOVE //
	////////////////////////////
	if (/QUOTA|EXCEEDED|REACHED|STORAGE|EXCEPTION 22|2147024882/i.test(err)) {
		appStorage.removeItem('remoteSuperBlockCSS');
		appStorage.removeItem('remoteSuperBlockJS');
		//DISABLE AUTOUPDATE
		if(appStorage.getItem('config_autoupdate') === 'on') {
			appStorage.setItem('config_autoupdate','off');
			//NO REBOOT
		}
		return;
	}
	//IGNORE BASIC
	if(/800a139e|isTrusted|InvalidStateError|UnknownError|space|stack|size|pile|NS_ERROR|ADCk2gVoB8/i.test(err)) {
		return; 
	}
	//LOG
	console.log('window.onerror: ' + err + ' URL: ' + url + ' Line: ' + line);
	//TRACK UNHANDLED
	if (typeof app !== 'undefined') {
		if (typeof app.analytics !== 'undefined') {
			app.analytics('error','unhandled: ' + err + ' URL: ' + url + ' Line: ' + line);
		}
	}
	//SAVE ERROR LOG
	appStorage.setItem('error_log_unhandled','unhandled log: ' + err + ' URL: ' + url + ' Line: ' + line);
	//SPINNER STOP
	if (typeof spinner !== 'undefined') {
		spinner('stop');
	}
	//DEV ALERT
	if (appStorage.getItem('config_debug') === 'active' && blockAlerts === 0) {
		if (IsMsApp) {
			if (typeof alert !== 'undefined') {
				alert('onerror: ' + err + ' URL: ' + url + ' Line: ' + line);
			}
		} else {
			if (confirm('onerror: ' + err + ' URL: ' + url + ' Line: ' + line)) {
				blockAlerts = 0;
			} else {
				blockAlerts = 1;
			}
		}
	}
	//disable ff db
	/*
	if ((/InvalidStateError/i).test(err) && !appStorage.getItem('config_force_localstorage')) {
		appStorage.setItem('config_force_localstorage',true);
		setTimeout(function () {
			//window.location.reload(true);
			window.location.replace(window.location.href);
		}, 0);
	}
	*/
	//////////////////////////
	// auto restart android //
	//////////////////////////
	if (/Exception 18/i.test(err)) {
		setTimeout(function () {
			//RELOAD
			//window.location.reload(true);
			window.location.replace(window.location.href);
		},0);
	}
	//COOL
	return true;
};
//##//////////////##
//## ISCACHEVALID ##
//##//////////////##
var isCurrentCacheValid = 0;
function isCacheValid(input) {
	'use strict';
	var isValid = 1;
	if(!input || input == '') { return false; }
	//APP_LIB
	if(input.indexOf('var isMobile')                === -1)	{ return false; }
	if(input.indexOf('function appConfirm')         === -1)	{ return false; }
	//APP_LANG
	if(input.indexOf('var appName')                 === -1)	{ return false; }
	if(input.indexOf('FOOD_CATEGORIES')             === -1)	{ return false; }
	//APP_SETUP
	if(input.indexOf('function showIntro')          === -1)	{ return false; }
	if(input.indexOf('function getLoginFB')         === -1)	{ return false; }
	//APP_MACRO
	if(input.indexOf('function getFullHistory')     === -1)	{ return false; }
	if(input.indexOf('function getCatList')         === -1)	{ return false; }
	//APP_BUILD
	if(input.indexOf('var settingsHtml')            === -1)	{ return false; }
	if(input.indexOf('function feetInchesToMetric') === -1)	{ return false; }
	//APP_STATIC
	if(input.indexOf('function startApp')           === -1)	{ return false; }
	if(input.indexOf('var editableTimeout')         === -1)	{ return false; }
	//APP_DYNAMIC
	if(input.indexOf('$(document).on("pageload"')   === -1)	{ return false; }
	if(input.indexOf('function getModalWindow')     === -1)	{ return false; }
	//APP_CUSTOM_CORE
	if(input.indexOf('function appTimer')           === -1)	{ return false; }
	if(input.indexOf('function updateTimer')        === -1)	{ return false; }
	//INDEX.CSS
	if(input.indexOf('html,body')                   === -1)	{ return false; }
	if(input.indexOf('#cat9999')                    === -1)	{ return false; }
	//FONTS.CSS
	if(input.indexOf('@font-face')                  === -1)	{ return false; }
	if(input.indexOf('spinnerMask')                 === -1)	{ return false; }
	//ISVALID
	return isValid;
}
//##/////////##//
//## INIT JS ##//
//##/////////##//
safeExec(function() {
	'use strict';
	///////////
	// MSAPP //
	///////////
	if(/MSApp/i.test(navigator.userAgent)) { hostLocal = ''; }
	/////////////////
	// LOCALFORAGE //
	/////////////////
	document.write('<script src="' + hostLocal + 'js/localforage.js" id="localforageJS"><\/script>');
	/////////////
	// ISCROLL //
	/////////////
	if(!appStorage.getItem('intro_dismissed')) {
		document.write('<script src="' + hostLocal + 'js/iscroll.js" id="iscrollJS"><\/script>');
	}
	/////////////////////
	// CORDOVA/DESKTOP //
	/////////////////////
	if (!/http/i.test(window.location.protocol)) {
		document.write('<script src="' + hostLocal + 'js/cordova.js" id="cordovaJS"><\/script>');
	}
	//////////////
	// FACEBOOK //
	//////////////
		   if ((/IEMobile/i.test(navigator.userAgent) && !IsMsApp && !/http/i.test(window.location.protocol)) || (!/http/i.test(window.location.protocol) && /Android|iPhone|iPod|iPad/i.test(navigator.userAgent) && !/MSApp/i.test(navigator.userAgent))) {
		document.write('<script src="' + hostLocal + 'js/openfb.js" id="openfbJS"><\/script>');
	} else if (/IEMobile|Windows Phone/i.test(navigator.userAgent) && IsMsApp) {
		document.write('<script src="' + hostLocal + 'js/winfb.js"id="winfbJS" ><\/script>');
	} else if (!IsMsApp) {
		document.write('<script src="' + hostLocal + 'js/facebook-all.js" id="facebookJS"><\/script>');
	}
	////////
	// JS //
	////////
	//JQUERY
	document.write('<script src="' + hostLocal + 'js/jquery.js" id="jqueryJS"><\/script>');
	//PLUGINS
	document.write('<script src="' + hostLocal + 'js/jquery.nicescroll.js" id="nicescrollJS"><\/script>');
	document.write('<script src="' + hostLocal + 'js/highcharts.js" id="highchartsJS"><\/script>');
	//UTILS
	document.write('<script src="' + hostLocal + 'js/calculator.js" id="calculatorJS"><\/script>');
	document.write('<script src="' + hostLocal + 'js/mobiscroll.js" id="mobiscrollJS"><\/script>');
	document.write('<script src="' + hostLocal + 'js/carpe_slider.js" id="carpesliderJS"><\/script>');
	document.write('<script src="' + hostLocal + 'js/galocalstorage.js" id="galocalstorageJS"><\/script>');

	//#/////////////////#//
	//# APP MODE LOADER #//
	//#/////////////////#//
	if (appStorage.getItem('config_autoupdate') === 'on' || (IsMsApp && appStorage.getItem('config_debug') === 'active')) {
		//CACHE
		var storeJS  = appStorage.getItem('remoteSuperBlockJS');
		var storeCSS = appStorage.getItem('remoteSuperBlockCSS');
		//VALIDATE
		if (isCacheValid(storeJS + storeCSS)) {
			isCurrentCacheValid = 1;
		}
		/////////////////////
		// DEFINE VALIDITY //
		/////////////////////
		document.write('<script src="' + hostLocal + 'js/app_bootstrap.js"><\/script>');
		if(isCurrentCacheValid == 1) {
			if(!document.getElementById('superBlockCSS')) {
				//to head
				if(document.getElementById('CSSPlaceholder')) {
					document.getElementById('CSSPlaceholder').innerHTML = storeCSS;
				} else {
					document.write('<style id="superBlockCSS">' + storeCSS + '<\/style>');
				}
				/////////////
				// JS EVAL //
				/////////////
				document.addEventListener('DOMContentLoaded', function() {
					//setTimeout(function() {
						try {
							//////////
							// EVAL //
							//////////
							//setTimeout(function() {
								var scriptBlock;
								scriptBlock = document.createElement('script');
								scriptBlock.text = storeJS;
								document.head.appendChild(scriptBlock).parentNode.removeChild(scriptBlock);
								scriptBlock = '';
							//}, 0);
						} catch(err) {
							////////////
							// APPEND //
							////////////
							var indirect = eval;
							indirect(storeJS);
							indirect = '';
						}
					//},0);
				//DOMReady
				}, false);
			}
		}
	} else {
		/////////
		// CSS //
		/////////
		document.write('<link rel="stylesheet" id="coreCss"   href="' + hostLocal + 'css/index.css" />');
		document.write('<link rel="stylesheet" id="coreFonts" href="' + hostLocal + 'css/fonts.css" />');
		////////
		// JS //
		////////
		document.write('<script src="' + hostLocal + 'js/app_lib.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_lang.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_setup.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_bootstrap.js" id="plainLoad"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_macro.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_build.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_static.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_dynamic.js"><\/script>');
		document.write('<script src="' + hostLocal + 'js/app_custom_core.js"><\/script>');
	}
});

