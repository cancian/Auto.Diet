﻿$.ajaxSetup({cache: false, crossDomain: true, async: true});
//#////////////#//
//# APP OBJECT #//
//#////////////#//
var isMobile = 'isCurrentCacheValid';
//////////////
// SET USER //
//////////////
/*
var appUser = ('mud_default###default').split('###');
if(!window.localStorage.getItem('app_current_user')) {
	window.localStorage.setItem('app_current_user','mud_default###default###' + new Date().getTime());
} else {
	appUser = window.localStorage.getItem('app_current_user').split('###');
}
*/
var app = {
	width: window.innerWidth,
	height: window.innerHeight,
	globals: {},
	handlers: {},
	timers: {},
	vars: {},
	//user: window.localStorage.getItem('app_current_user').split('###'),
	dev: window.localStorage.getItem('config_debug') === 'active' ? true : false,
	beenDev: window.localStorage.getItem('config_debug') === 'active' || window.localStorage.getItem('been_dev') ? true : false,
	is: {},
	config: {},
	db: {
		indexedDB    : 'indexedDB' in window || typeof window.indexedDB !== 'undefined' || typeof window.webkitIndexedDB !== 'undefined' || typeof window.mozIndexedDB !== 'undefined' || typeof window.OIndexedDB !== 'undefined' || typeof window.msIndexedDB !== 'undefined' ? true : false,
		webSQL       : !window.openDatabase ? false : true,
		localStorage : !window.localStorage ? false : true,
	},
	tab: {},
	get: {},
	call: {},
	exec: {},
	info: {},
	exists: function(targetId) {
		if($(targetId).length) {
			return true;
		} else {
			return false;
		}
	},
	ua:   navigator.userAgent,
	http: /http/i.test(window.location.protocol) ? true : false,
	https: /https/i.test(window.location.protocol) ? 'https://' : !/https/i.test(window.location.protocol) ? 'https://' : 'http://',
	now: function() {
		return new Date().getTime();
	},
	define: function(key,value) {
		//MULTIUSER
		/*
		if(!/mud_default/i.test(app.user)) {
			//protect superglobals
			if(!/remoteSuperBlock|autoupdate|app_build|debug|been_dev|config_install_time|app_current_user|app_userlist|app_restart_pending|consecutive_reboots/i.test(key)) {
				key = app.user[0] + '_' + key;
			}
		}
		*/
		//
		if(!window.localStorage.getItem(key)) {
			window.localStorage.setItem(key,value);
			return false;
		}
		return true;
	},
	rows: {
		entry: [],
		food: []
	},
	returner: function(func,rows) {
		if(typeof func === 'function') {
			if(rows == null) {
				rows = [];
			}
			func(rows);
		}
	},
	read: function(key,value,type) {
		//MULTIUSER
		/*
		if(!/mud_default/i.test(app.user)) {
			//protect superglobals
			if(!/remoteSuperBlock|autoupdate|app_build|debug|been_dev|config_install_time|app_current_user|app_userlist|app_restart_pending|consecutive_reboots/i.test(key)) {
				key = app.user[0] + '_' + key;
			}
		}
		*/
		//
		//localforage wrapper
		if(/diary_entry|diary_food/i.test(key)) {
			localforage.getItem(key,function(err, rows) {
				if(err) {
					errorHandler(err);
				} else {
					app.returner(value,rows);
				}
			});
			return;
		}
		//
		//OBJECT
		if(type == 'object') {
			if(!window.localStorage.getItem(key)) {
				return [];
			}
			var keyValue = window.localStorage.getItem(key);
			if(value == '') {
				//return whole object
				return JSON.parse(keyValue);
				//return keyValue && JSON.parse(keyValue);
			} else {
				//return key's value
				return JSON.parse(keyValue)[value];
				//return keyValue[value] && JSON.parse(keyValue)[value];
			}
		}
		//
		if(typeof value != 'undefined') {
			if(window.localStorage.getItem(key) == value) {
				return true;
			} else {
				return false;
			}
		}
		if(!window.localStorage.getItem(key)) {
			return false;
		} else {
			if(isNaN(Number(window.localStorage.getItem(key)))) {
				return window.localStorage.getItem(key);
			} else {
				return Number(window.localStorage.getItem(key));
			}
		}
	},
	save: function(key,value,type) {
		//MULTIUSER
		/*
		if(!/mud_default/i.test(app.user)) {
			//protect superglobals
			if(!/remoteSuperBlock|autoupdate|app_build|debug|been_dev|config_install_time|app_current_user|app_userlist|app_restart_pending|consecutive_reboots/i.test(key)) {
				key = app.user[0] + '_' + key;
			}
		}
		*/
		//
		//localforage wrapper
		if(/diary_entry|diary_food/i.test(key)) {
			app.returner(type,value);
			app.timeout(key,1000,function() {
				localforage.setItem(key,value);
			});
			return;
		}
		//OBJECT
		if(type == 'object') {
			if(value) {
				window.localStorage.setItem(key,JSON.stringify(value));
			}
			return;
		}
		//
		if(window.localStorage.getItem(key) != value) {
			window.localStorage.setItem(key,value);
		}
	},
	remove: function(key) {
		//MULTIUSER
		/*
		if(!/mud_default/i.test(app.user)) {
			//protect superglobals
			if(!/remoteSuperBlock|autoupdate|app_build|debug|been_dev|config_install_time|app_current_user|app_userlist|app_restart_pending|consecutive_reboots/i.test(key)) {
				key = app.user[0] + '_' + key;
			}
		}
		*/
		//
		if(window.localStorage.getItem(key)) {
			window.localStorage.removeItem(key);
		}
	},
	clear : function () {
		app.define('config_install_time', app.now());
		var keys = Object.keys(window.localStorage);
		for (var i = 0; i < keys.length; i++) {
			//cached keys
			if (!/app_build|app_autoupdate_hash|remoteSuperBlockCSS|remoteSuperBlockJS/i.test(keys[i]) || window.localStorage.getItem('config_autoupdate') !== 'on') {
				//protected keys
				if(!/autoupdate|debug|been_dev|config_install_time|app_current_user|app_userlist|app_restart_pending|consecutive_reboots|app_installed/i.test(keys[i])) {
					//MULTIUSER
					/*
					//remove current user settings
					if (keys[i].contains(app.user[0])) {
						window.localStorage.removeItem(keys[i]);
					}
					//remove default user settings
					if(app.user.id === 'mud_default' && !keys[i].contains(app.user.id)) {
						window.localStorage.removeItem(keys[i]);
					}
					*/
					window.localStorage.removeItem(keys[i]);
				}
			}
		}
	},
	show: function(target,callback) {
		$(target).css('pointer-events','auto');
		$(target).css(prefix + 'transition', 'opacity ease .32s');
		$(target).css('opacity',1);
		setTimeout(function() {
			if(typeof callback === 'function') {
				callback(target);
			}
		},320);
	},
	hide: function(target,callback) {
		$(target).css('pointer-events','none');
		$(target).css(prefix + 'transition', 'opacity ease .12s');
		$(target).css('opacity',0);
		setTimeout(function() {
			if(typeof callback === 'function') {
				callback(target);
			}
		},120);
	},
	timeout: function(gid,time,callback) {
		clearTimeout(app.timers[gid]);
		if(time == 'clear') { return; }
		app.timers[gid] = setTimeout(function() {
			if(typeof callback === 'function') {
				callback();
			}
		}, time);
	},
	suspend: function(target,time,callback) {
		clearTimeout(app.timers[searchalize(target)]);
		$(target).css('pointer-events','none');
		app.timers[app.timers[searchalize(target)]] = setTimeout(function() {
			if(typeof callback === 'function') {
				callback();
			}
			$(target).css('pointer-events','auto');
		}, time);
	},
	timer: {
		start : function(str)     { if(!str) { str = 'generic'; }; app.globals[str] = app.now(); },
		end   : function(str,txt) { if(!str) { str = 'generic'; }; if(txt) { txt = txt + ': '; } else { txt = 'total: '; }; app.toast(txt + (Number((app.now() - app.globals[str]))) + ' ms', 'timer_' + (JSON.stringify(app.globals[str]))); }
	}
};
/////////////////
// SWITCH USER //
/////////////////
app.switchUser = function(switchTo) {
	if(switchTo) {
		if(searchalize(switchTo).length == 0) { return; }
		//
		var usrMatch    = '_' + searchalize(switchTo) + '###';
		var newUserLine = 'mui_' + searchalize(switchTo) + '###' + switchTo + '###' + app.now() + '\r\n';
		//default
		if(switchTo == 'mud_default') {
				window.localStorage.removeItem('app_current_user');
		//first use
		} else if(!app.read('app_userlist')) {
			app.save('app_userlist',newUserLine);
			app.save('app_current_user',newUserLine);
		} else {
			if(app.read('app_userlist').contains(usrMatch)) {
				//add new user line
				var userArray = app.read('app_userlist').split('\r\n');
				for (var i = 0; i < userArray.length; i++) {
					if(userArray[i].contains(usrMatch)) {
						app.save('app_current_user',trim(userArray[i]));
						break;
					}
				}
			} else {
				app.save('app_userlist',app.read('app_userlist') + newUserLine);
				app.save('app_current_user',trim(newUserLine));
			}
		}
		//
		$('body').css('opacity',0);
		noTimer = 'active';
		setTimeout(function() {
			window.location.reload(true);
		},0);
	}
};
///////////////
// LOG ERROR //
///////////////
app.parseErrorLog = function() {
	//UNHANDLED
	if(app.read('error_log_unhandled')) {
		var unhandledError = app.read('error_log_unhandled');
		setTimeout(function() {
			app.analytics('error',unhandledError);
		},0);
		app.remove('error_log_unhandled')
	}
	//HANDLED
	if(app.read('error_log_handled')) {
		var handledError = app.read('error_log_handled');
		setTimeout(function() {
			app.analytics('error',handledError);
		},0);
		app.remove('error_log_handled')
	}
};
/////////////////
// SWIPE EVENT //
/////////////////
app.swipe = function (elem, callback) {
	//$(elem).swipe('destroy');
	$(elem).swipe({
		swipe : function (evt, direction) {
			if (direction == 'left' || direction == 'right') {
				if (typeof callback === 'function') {
					var that = this;
					callback(that,evt,direction);
				}
			}
		},
		fingers:1,
		threshold : 32,
		allowPageScroll: 'vertical'
	});
};
///////////////
// TAP EVENT //
///////////////
app.tap = function (elem, callback) {
	//$(elem).swipe('destroy');
	$(elem).swipe({
		tap : function(evt) {
			if (typeof callback === 'function') {
				var that = this;
				callback(that,evt);
			}
		}
	});
};
//////////////////
// TOTAL WEIGHT //
//////////////////
app.get.totalweight = function() {
	if (!app.read('calcForm#pA3B')) {
		return 80;
	}
	if (app.read('calcForm#pA3C','pounds')) {
		return Math.round(app.read('calcForm#pA3B')/2.2);
	}
	return app.read('calcForm#pA3B');
};
app.get.androidVersion = function() {
	if((/Android/i).test(app.ua) && !app.http) {
		//android L
		if((/Build\/L/i).test(app.ua)) { return 4.4; }
		return parseFloat(app.ua.match(/Android [\d+\.]{3,5}/)[0].replace('Android ',''));
	} else {
		return false;
	}
};
app.get.isChromeApp = function() {
	if(typeof chrome !== 'undefined') {
		if(typeof chrome.app !== 'undefined') {
			if(chrome.app.isInstalled) {
				return true;
			}
		}
	}
	return false;
};
app.get.isDesktop = function() {};
////////////////
// APP DEVICE //
////////////////
app.device = {
	cordova    : ((typeof cordova || typeof Cordova) !== 'undefined') ? true : false,
	android    : (/Android/i).test(app.ua) && !(/MSApp/i).test(app.ua) ? app.get.androidVersion() : false,
	android2   : (/Android/i).test(app.ua) && app.get.androidVersion() < 4 ? true : false,
	ios        : (/iPhone|iPad|iPod/i).test(app.ua) ? true : false,
	ios7       : (/OS [7-9](.*) like Mac OS X/i).test(app.ua) || (/OS [10](.*) like Mac OS X/i).test(app.ua) ? true : false,
	ios8       : (/OS [8-9](.*) like Mac OS X/i).test(app.ua) || (/OS [10](.*) like Mac OS X/i).test(app.ua) ? true : false,
	linux      : (/X11|Linux|Ubuntu/i).test(navigator.userAgent) && !(/Android/i).test(navigator.userAgent) ? true : false,
	msapp      : (/MSApp/i).test(app.ua) ? true : false,
	wp8        : (/IEMobile/i).test(app.ua) && !(/MSApp/i).test(app.ua) ? true : false,
	wp81       : (/Mobile/i).test(app.ua) && (/MSApp/i).test(app.ua)  ? true : false,
	wp10       : (/MSAppHost\/3.0/i).test(app.ua) && (/Windows Phone 10/i).test(app.ua) ? true : false,
	windows8   : (/MSApp/i).test(app.ua) && !(/IE___Mobile/i).test(app.ua) ? true : false,
	windows81  : (/MSAppHost\/2.0/i).test(app.ua) && !(/IE__Mobile/i).test(app.ua)? true : false,
	windows8T  : (/MSApp/i).test(app.ua) && (/Touch/i).test(app.ua) && !(/IE___Mobile/i).test(app.ua) ? true : false,
	windows10  : (/MSAppHost\/3.0/i).test(app.ua) ? true : false,
	firefoxos  : (/firefox/i).test(app.ua) && (/mobile|tablet/i).test(app.ua) && (/gecko/i).test(app.ua) ? true : false,
	osx        : (/Macintosh|Mac OS X/i).test(app.ua) && !(/iPhone|iPad|iPod/i).test(app.ua) ? true : false,
	osxapp     : (/MacGap/i).test(app.ua) ? true : false,
	chromeos   : app.get.isChromeApp() ? true : false,
	blackberry : (/BB10|BlackBerry|All Touch/i).test(app.ua) && !/(PlayBook)/i.test(app.ua) ? true : false,
	playbook   : (/PlayBook|Tablet OS/i).test(app.ua) ? true : false,
	amazon     : (/Amazon|FireOS/i).test(app.ua) ? true : false,
	desktop    : ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|PlayBook|IEMobile|Opera Mini|Tablet|Mobile|Touch/i.test(app.ua) || (document.createTouch)) && !/Windows NT/i.test(app.ua)) ? false : true
};
//STATIC
if(typeof staticVendor !== 'undefined') {
	if(staticVendor == 'amazon' && (/Android/i).test(app.ua)) {
		app.device.amazon = true;
	}
}
//////////////////////
// GLOBAL SHORTCUTS //
//////////////////////
app.get.platform = function(noweb) {
	     if(app.device.ios && app.http)		{ return 'web';              }
	else if(app.device.android && app.http)	{ return 'web';              }
	else if(app.device.wp8 && app.http)		{ return 'web';              }
	else if(app.device.linux)				{ return 'Linux';            }
	else if(app.device.ios)					{ return 'iOS';              }
	else if(app.device.amazon)				{ return 'Android (Amazon)'; }
	else if(app.device.wp8)					{ return 'Windows Phone';    }
	else if(app.device.wp81)				{ return 'Windows Phone';    }
	else if(app.device.wp10)				{ return 'Windows Phone';    }
	else if(app.device.windows8)			{ return 'Windows';          }
	else if(app.device.windows81)			{ return 'Windows';          }
	else if(app.device.windows10)			{ return 'Windows';          }
	else if(app.device.blackberry)			{ return 'BlackBerry';       }
	else if(app.device.playbook)			{ return 'PlayBook';         }
	else if(app.device.android)				{ return 'Android';          }
	else if(app.device.firefoxos)			{ return 'FirefoxOS';        }
	else if(app.device.osxapp)				{ return 'Mac';              }
	else if(app.device.chromeos)			{ return 'ChromeOS';         }
	else									{ return 'web'; }
};
////////////////////
// GLOBAL BOOLEAN //
////////////////////
app.is.scrollable = false;
if($.nicescroll) {
	if(app.device.desktop)								{ app.is.scrollable = true; }
	if(app.device.linux)								{ app.is.scrollable = true; }
	if(app.device.android && app.device.android < 4.4)	{ app.is.scrollable = true; }
}
//////////////////
// APP.REBOOT() //
//////////////////
app.reboot = function(type,error) {
	var timeout = type == 'now' ? 0 : 500;
	//CLEAR CACHE
	if(type == 'reset') {
		app.remove('remoteSuperBlockJS');
		app.remove('remoteSuperBlockCSS');
		app.remove('app_autoupdate_hash');
	}
	//WIPE STORAGE
	if(type == 'clear') {
		app.clear();
	}
	setTimeout(function() {
		//RELOAD
		if(app.device.android >= 3) {
			if(typeof window.MyReload !== 'undefined') {
				window.MyReload.reloadActivity();
			} else {
				window.location.reload(true);
			}
		} else {
			window.location.reload(true);
		}
	},timeout);
	if(error) {
		throw error;
	}
};
///////////////////
// CUSTOM JQUERY //
///////////////////
$.prototype.html2 = function (data, callback) {
	var obj = $(this);
	if($(obj).length) {
		if (app.device.msapp) {
			MSApp.execUnsafeLocalFunction(function () {
				obj.html(data);
			});
		} else {
			obj.html(data);
		}
	}
	//CALLBACK
	if (typeof callback === 'function') {
		callback();
	}
};
$.prototype.append2 = function (data, callback) {
	var obj = $(this);
	if($(obj).length) {
		if (app.device.msapp) {
			MSApp.execUnsafeLocalFunction(function () {
				obj.append(data);
			});
		} else {
			obj.append(data);
		}
	}
	//CALLBACK
	if (typeof callback === 'function') {
		callback();
	}

};
$.prototype.prepend2 = function (data, callback) {
	var obj = $(this);
	if($(obj).length) {
		if (app.device.msapp) {
			MSApp.execUnsafeLocalFunction(function () {
				obj.prepend(data);
			});
		} else {
			obj.prepend(data);
		}
	}
	//CALLBACK
	if (typeof callback === 'function') {
		callback();
	}
};
$.prototype.before2 = function (data, callback) {
	var obj = $(this);
	if($(obj).length) {
		if (app.device.msapp) {
			MSApp.execUnsafeLocalFunction(function () {
				obj.before(data);
			});
		} else {
			obj.before(data);
		}
	}
	//CALLBACK
	if (typeof callback === 'function') {
		callback();
	}
};
$.prototype.after2 = function (data, callback) {
	var obj = $(this);
	if($(obj).length) {
		if (app.device.msapp) {
			MSApp.execUnsafeLocalFunction(function () {
				obj.after(data);
			});
		} else {
			obj.after(data);
		}
	}
	//CALLBACK
	if (typeof callback === 'function') {
		callback();
	}
};
///////////
// TOAST //
///////////
app.toast = function (msg, tag) {
	if(!msg)		{ msg = ''; }
	if(!tag)		{ tag = 'appToast' + JSON.stringify(app.now()); }
	////////////
	// INSERT //
	////////////
	$('body').append2('<div id="appToast" class="' + tag + '">' + msg + '</div>');
	//DISMISS
	setTimeout(function() {
		$('.' + tag).on(tap, function () {
			app.handlers.fade(0, '.' + tag, '', 300);
		});
		setTimeout(function() { 
			app.handlers.fade(0, '.' + tag, '', 300);
		},2000);
	},0);
};
//////////
// ZOOM //
//////////
/*
app.zoom = function(ratio) {
	if(!ratio) {
		//ratio = app.read('app_zoom');
	}
	if(ratio == 1 || app.read('app_zoom',1)) {
		$('html').addClass('zoomx1');
		$('html').removeClass('zoomx2 zoomx3');
		app.save('app_zoom',1);
	}
	if(ratio == 2 || app.read('app_zoom',1.2)) {
		$('html').addClass('zoomx2');
		$('html').removeClass('zoomx1 zoomx3');
		app.save('app_zoom',1.2);
	}
	if(ratio == 3 || app.read('app_zoom',1.4)) {
		$('html').addClass('zoomx3');
		$('html').removeClass('zoomx1 zoomx2');
		app.save('app_zoom',1.4);
	}
	//$('body').css('zoom',Math.round(app.read('app_zoom') * 100) + '%');
	//$('body').css('zoom',app.read('app_zoom'));
	//$('body').css('-moz-transform','scale(' + app.read('app_zoom') + ',' + app.read('app_zoom') + ')');
	if(typeof appResizer == 'function') {
		$('.nicescroll-rails').css('display','none');
		appResizer();
		app.timeout('zoomHideScrollar',400,function() {
			$('.nicescroll-rails').css('display','block');
		});
	}
};
app.zoom();
*/
////////////////
// APP.INFO() //
////////////////
app.info = function (title, msg, preHandler, postHandler) {
	if($('#skipIntro').length)	   { return; }
	if($(document).height() < 350) { return; }
	if(app.globals.blockInfo == 1) { return; }
	if (app.read('info_' + title)) { // && !app.dev) {
		return;
	}
	$('#screenInfo').remove();
	/////////////////
	// INSERT HTML //
	/////////////////
	$('body').prepend2('\
	<div id="screenInfo" class="info_' + title + '">\
		<div id="circleFocus"></div>\
		<div id="textBlock">' + msg + '</div>\
		<div id="closeButton">' + LANG.CLOSE[lang] + '</div>\
	</div>');
	$('#screenInfo').hide();
	//////////////////////
	// STOP PROPAGATION //
	//////////////////////
	$('#screenInfo').on(touchstart, function (evt) {
		if(!$('body').hasClass('msie') && !app.device.desktop) {
			evt.stopPropagation();
			evt.preventDefault();
		}
	});
	/////////////
	// FADE IN //
	/////////////
	app.handlers.fade(1, '#screenInfo', function () {
		////////////////
		// PREHANDLER //
		////////////////
		setTimeout(function () {
			if (typeof preHandler === 'function') {
				preHandler();
			}
		}, 0);
	});
	/////////////////
	// POSTHANDLER //
	/////////////////
	setTimeout(function () {
		$('#closeButton').on(touchend, function (evt) {
			app.save('info_' + title, true);
			app.handlers.fade(0, '#screenInfo');
			if (typeof postHandler === 'function') {
				postHandler();
			}
			evt.preventDefault();
			evt.stopPropagation();
		});
		//allow disable
		/*
		if(app.dev) {
			$('#closeButton').on('longhold',function(evt) {
				evt.preventDefault();
				evt.stopPropagation();
				app.globals.blockInfo = 1;
				$('#closeButton').trigger(touchend);
				evt.preventDefault();
				evt.stopPropagation();
			});
		}
		*/
	}, 300);
};
///////////////
// APP READY //
///////////////
app.ready = function(callback) {
	//READY
	$('body').addClass('ready');
	//////////////
	// VIEWPORT //
	//////////////
	if(app.device.ios) {
		$('#viewPort').attr('content', $('#viewPort').attr('content').split('height=device-height').join('minimal-ui') );
	}
	//////////////
	// CALLBACK //
	//////////////
	if(typeof callback === 'function') {
		callback();
	}
};
///////////////////
// APPEND SCRIPT //
///////////////////
app.appendScript = function(url) {
	var script   = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
};
/////////
// URL //
/////////
var ref;
app.url = function(url) {
	//STORES
	var store = {
		web:        'https://kcals.net',
		ios:        'https://itunes.apple.com/app/id732382802',
		android:    'https://play.google.com/store/apps/details?id=com.cancian.kcals',
		wp8:        'http://www.windowsphone.com/s?appid=9cfeccf8-a0dd-43ca-b104-34aed9ae0d3e#ratings-reviews',
		windows8:   'https://www.microsoft.com/store/apps/9wzdncrdkhz5#ratings-reviews',
		firefoxos:  'https://marketplace.firefox.com/app/kcals',
		osxapp:     app.device.osx ? 'macappstores://itunes.apple.com/app/id898749118' : 'https://itunes.apple.com/app/id898749118',
		chromeos:   'https://chrome.google.com/webstore/detail/kcals-calorie-counter/ipifmjfbmblepifflinikiiboakalboc/reviews',
		blackberry: app.device.blackberry ? 'appworld://content/59937667' : 'http://appworld.blackberry.com/webstore/content/59937667',
		playbook:   app.device.playbook ? 'http://appworld.blackberry.com/webstore/content/59937667' : 'http://appworld.blackberry.com/webstore/content/59937667',
		amazon:     'http://www.amazon.com/Kcals-net-KCals-Calorie-Counter/dp/B00NDSQIHK/qid=1411265533'
	};
	//SHORTCUT
	     if((!url && app.device.ios)        || url == 'ios')        { url = store.ios;        }
	else if((!url && app.device.amazon)     || url == 'amazon')     { url = store.amazon; store.android = store.amazon; }
	else if((!url && app.device.blackberry) || url == 'blackberry') { url = store.blackberry; }
	else if((!url && app.device.playbook)   || url == 'playbook')   { url = store.playbook; }
	else if((!url && app.device.android)    || url == 'android')    { url = store.android;    }
	else if((!url && app.device.wp8)        || url == 'wp8')        { url = store.wp8;        }
	else if((!url && app.device.windows8)   || url == 'windows8')   { url = store.windows8;   }
	else if((!url && app.device.firefoxos)  || url == 'firefoxos')  { url = store.firefoxos;  }
	else if((!url && app.device.osxapp)     || url == 'osxapp')     { url = store.osxapp;     }
	else if((!url && app.device.chromeos)   || url == 'chromeos')   { url = store.chromeos;   }
	else if(url == 'www')											{ url = store.web;        }
	//OPEN
	if(url) {
		     if(app.device.ios)			{ window.open(url, '_system', 'location=yes');								}
		else if(app.device.android)		{ window.open(url, '_system', 'location=yes');								}
		else if(app.device.wp8)			{ ref = window.open(url, '_blank', 'location=no');							}
		else if(app.device.msapp)		{ Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(url));	}
		else if(app.device.firefoxos)	{ ref = window.open(url, '_system', 'location=yes');						}
		else if(app.device.osxapp)		{ macgap.app.open(url);														}
		else if(app.device.playbook)	{ try { blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, new blackberry.invoke.BrowserArguments(url)); } catch (err) { errorHandler('url: ' + err); }}
		else 							{ window.open(url, '_blank'); }
	}
};
//////////////
// APP INFO //
//////////////
var userAgent           = navigator.userAgent;
var appBalance;
var appBalanceOver;
var appStatus;
var appHeader;
var appFooter;
var db;
var dbName              = 'mylivediet.app';
var lib;
var lib2;
var storeEntry;
var storeFood;
var hasSql              = (window.openDatabase && window.localStorage.getItem('config_nodb') !== 'active') ? true : false;
var AND                 = ' ';
var initialScreenWidth  = window.innerWidth;
var initialScreenHeight = window.innerHeight;
var orientationSwitched = 0;
var initialScreenSize   = window.innerHeight;
var lastScreenSize      = window.innerHeight;
var lastScreenResize    = window.innerHeight;
var opaLock             = 0;
var loadingDivTimer;
var timerPerf           = (new Date().getTime());
var timerDiff           = 100;
var timerWait           = 100;
var noteContent         = '';
var noTimer;
var preTab;
var afterTab;
var timerKcals;
var rebuildHistory;
var blockModal = false;
var modalTimer;
function voidThis()   { }
function voidMe()     { }
//////////////////
// APP HANDLERS //
//////////////////
app.handlers = {
	//////////////////
	// CSS FADE OUT //
	//////////////////
	fade : function(inOut,target,callback,duration) {
		if(!duration) {
			duration = 200;
		}
		//PRE-HIDE FADE-IN
		if(inOut == 1) {
			$(target).css(prefix + 'transition-duration', '0s');
			$(target).css('opacity',0);
			$(target).hide();
		}
		////////////////////
		// TRANSITION END //
		////////////////////
		$(target).off(transitionend).on(transitionend,function() {
			if(inOut == 0) {
				$(target).remove();
			} else {
				//fast resizing
				$(target).css(prefix + 'transition-duration', '0s');
			}
			if(typeof callback === 'function') {
				callback();
				callback = '';
			}
		});
		//////////////////
		// SET ANIMATED //
		//////////////////
		$(target).css(prefix + 'transition', 'opacity ease ' + (duration/1000) + 's');
		///////////////////////////////////
		// SET OPACITY ~ ENFORCE REMOVAL //
		///////////////////////////////////
		if(inOut == 1) {
			$(target).show();
		}
		//setTimeout(function() {
			$(target).css('opacity',inOut);
			setTimeout(function() {
				if($(target).length && callback !== '') {
					$(target).trigger(transitionend);
				}
			//ENFORCE
			},300);
		//DEFER
		//},0);
	},
	////////////////
	// ACTIVE ROW //
	////////////////
	activeRowTouches : [],
	activeRowBlock   : [],
	activeRowTimer   : [],
	activeLastId     : [],
	activeRow : function (target, style, callback,callbackCondition) {
		var t = searchalize(target);
		var isButton = style == 'button' ? 40 : 40;
		if(app.is.scrollable && app.device.desktop) {
			isButton = 1;
		}
		//RESET
		app.handlers.activeRowTouches[t] = 0;
		app.handlers.activeRowBlock[t]   = 0;
		app.handlers.activeLastId[t]     = '';
		clearTimeout(app.handlers.activeRowTimer[t]);
		////////////////
		// SET PARENT //
		////////////////
		var targetParent = target;
		if (target.match(' ')) {
			targetParent = target.split(' ')[0] + ', ' + target;
		}
		//////////////
		// TOUCHEND //
		//////////////
		$(target).on(touchend, function (evt) {
			if($(this).hasClass(style) && app.handlers.activeRowBlock[t] == 0) {
				if (typeof callback === 'function') {
					app.handlers.activeRowBlock[t] = 1;
					if(style == 'button') {
						callback(evt);
					} else {
						callback($(this).attr('id'));
					}
					$(this).addClass(style);
					app.handlers.activeLastId[t] = this;
					app.handlers.activeRowTouches[t] = 0;
					app.handlers.activeRowBlock[t]   = 0;
					clearTimeout(app.handlers.activeRowTimer[t]);
					if(style != 'activeOverflow') {
						$(app.handlers.activeLastId[t]).removeClass(style);
					}
				}
			} else {
				app.handlers.activeRowTouches[t] = 0;
				app.handlers.activeRowBlock[t]   = 0;
				clearTimeout(app.handlers.activeRowTimer[t]);
			}
			if(style == 'false') {
				var falseThis = this;
				$(falseThis).css('pointer-events','none');
				app.timeout('tapSelect',500,function() {
					$(falseThis).css('pointer-events','auto');
				});
			}
		});
		////////////////
		// TOUCHSTART //
		////////////////
		setTimeout(function () {
			$(target).on(touchstart, function (evt) {
				if(!$(this).hasClass(style)) {
					$(app.handlers.activeLastId[t]).removeClass(style);
				}
				var localTarget = this;
				app.handlers.activeRowTouches[t] = 0;
				clearTimeout(app.handlers.activeRowTimer[t]);
				app.handlers.activeRowTimer[t] = setTimeout(function () {
					if (app.handlers.activeRowTouches[t] == 0 && app.handlers.activeRowBlock[t] == 0) {
						$(localTarget).addClass(style);
						app.handlers.activeLastId[t] = localTarget;
					} else {
						$(app.handlers.activeLastId[t]).removeClass(style);
					}
				}, isButton);
				//CALLBACK CONDITION
				if(callbackCondition) {
					if(callbackCondition() === false) {
						clearTimeout(app.handlers.activeRowTimer[t]);
					}
				}
				//no drag
				//if(style == 'button') {
				//	return false;
				//}
			});
		}, 400);
		//////////////////////
		// ROW LEAVE CANCEL //
		//////////////////////
		if(app.device.windows8) {
			$(target).on(touchout + ' ' + touchleave + ' ' + touchcancel, function (evt) {
				$(app.handlers.activeLastId[t]).removeClass(style);
				clearTimeout(app.handlers.activeRowTimer[t]);
			});
		} else {
			$(targetParent).on(touchout + ' ' + touchleave + ' ' + touchcancel, function (evt) {
				app.handlers.activeRowTouches[t]++;
				if(!app.device.wp8 && style != 'activeOverflow') {
					clearTimeout(app.handlers.activeRowTimer[t]);
					$(app.handlers.activeLastId[t]).removeClass(style);
				}
			});
		}
		////////////////////////
		// SCROLL/MOVE CANCEL //
		////////////////////////
		if(!app.device.windows8) {
			var moveCancel = app.device.osxapp || app.device.osx ? 'mouseout' : touchmove;
			$(targetParent).on('scroll ' + moveCancel, function (evt) {
				app.handlers.activeRowTouches[t]++;
				clearTimeout(app.handlers.activeRowTimer[t]);
				if (app.handlers.activeRowTouches[t] > 7 || (app.handlers.activeRowTouches[t] > 1 && app.device.android)) {
					$(app.handlers.activeLastId[t]).removeClass(style);
					if(app.device.osxapp || app.device.osx) {
						$('.activeOverflow').removeClass(style);
					}
					app.handlers.activeRowTouches[t] = 0;
				}
			});
		}
		///////////////////////
		// SCROLL TIME BLOCK //
		///////////////////////
		$(targetParent).on('scroll', function (evt) {
			app.handlers.activeRowBlock[t] = 1;
			setTimeout(function () {
				app.handlers.activeRowBlock[t] = 0;
			}, 100);
		});
	},
	///////////////////
	// HIGHLIGHT ROW //
	///////////////////
	highlight: function(target,callback) {
		$(target).removeClass('activeOverflow');
		$(target).addClass('yellow');
		setTimeout(function () {
			$(target).css(prefix + 'transition','background linear .5s');
			setTimeout(function () {
				$(target).removeClass('yellow');
				setTimeout(function () {
					$(target).css(prefix + 'transition','background linear 0s');
					if(typeof callback === 'function') {
						callback();
					}
				}, 500);
			}, 100);
		}, 100);
	},
	///////////////
	// BUILD ROW //
	///////////////
	buildRows: function(data,filter) {
		//////////////////
		// TOTAL WEIGHT //
		//////////////////
		var totalWeight = app.get.totalweight();
		////////////////
		// LOOP ARRAY //
		////////////////
		var rowHtml = '';
		var rowSql  = '';
		var i = data.length;
		while(i--) {
			/////////////////////
			// FILTER REPEATED //
			/////////////////////
			if (data[i].id) {
				var favClass = (data[i].fib === 'fav') ? ' favItem' : '';
				if((JSON.stringify(data[i].id)).length >= 13) {
					favClass = favClass + ' customItem';
				}
				var rowType  = (data[i].type == '0000' || data[i].type == 'exercise') ? 'exercise' : 'food';
				var catClass = 'cat' + (data[i].type).split('food').join('9999').split('exercise').join('0000');
				///////////////////////////
				// AJUST WEIGHT EXERCISE //
				///////////////////////////
				var kcals = data[i].kcal;
				if (rowType == 'exercise') {
					kcals = Math.round(((data[i].kcal * totalWeight) / 60) * 30);
				}
				//FORCE DECIMAL
				data[i].name = sanitizeSql(data[i].name);
				if(!data[i].pro)  { data[i].pro  = 0; }
				if(!data[i].car)  { data[i].car  = 0; }
				if(!data[i].fat)  { data[i].fat  = 0; }
				if(!data[i].fii)  { data[i].fii  = 0; }
				if(!data[i].sug)  { data[i].sug  = 0; }
				if(!data[i].sod)  { data[i].sod  = 0; }
				data[i].pro  = Math.round(data[i].pro  * 100) / 100;
				data[i].car  = Math.round(data[i].car  * 100) / 100;
				data[i].fat  = Math.round(data[i].fat  * 100) / 100;
				data[i].fii  = Math.round(data[i].fii  * 100) / 100;
				data[i].sug  = Math.round(data[i].sug  * 100) / 100;
				data[i].sod  = Math.round(data[i].sod  * 100) / 100;
				data[i].fib  = (data[i].fib).split('diary_food').join('');
				//////////////
				// ROW HTML //
				//////////////
				rowHtml += '\
				<div class="searcheable' + favClass + ' ' + rowType + ' ' + data[i].id + ' ' + catClass + '" id="' + data[i].id + '">\
				<div class="foodName ' + rowType + '">' + data[i].name + '</div>\
				<span class="foodKcal"><span class="preSpan">' + LANG.KCAL[lang] + '</span>' + kcals + '</span>';
				////////////////////////
				// ADD NUTRITION INFO //
				////////////////////////
				if (rowType === 'food') {
					rowHtml += '\
					<span class="foodPro ' + rowType + '"><span class="preSpan">' + LANG.PRO[lang] + '</span>' + data[i].pro + '</span>\
					<span class="foodCar ' + rowType + '"><span class="preSpan">' + LANG.CAR[lang] + '</span>' + data[i].car + '</span>\
					<span class="foodFat ' + rowType + '"><span class="preSpan">' + LANG.FAT[lang] + '</span>' + data[i].fat + '</span>';
				}
				rowHtml += '</div>';
				///////////////
				// BUILD SQL //
				///////////////
				if(filter) {
					if(!rowSql.contains(data[i].id)) {
						rowSql += "INSERT OR REPLACE INTO \"diary_food\" VALUES(#^#" + Number(data[i].id) + "#^#,'" + data[i].type + "','" + data[i].code + "','" + data[i].name + "','" + sanitize(data[i].name) + "','" + Number(data[i].kcal) + "','" + Number(data[i].pro) + "','" + Number(data[i].car) + "','" + Number(data[i].fat) + "','" + data[i].fib + "','" + Number(data[i].fii) + "','" + Number(data[i].sug) + "','" + Number(data[i].sod) + "');\n";
					}
				}
			}
		}
		///////////////
		// WRITE SQL //
		///////////////
		if(filter) {
			//PREPARE
			if(rowSql == '') {
				rowSql = ' ';
			} else {
				rowSql = app.fixSql(rowSql);
			}
			///////////////////
			// FIX MALFORMED //
			///////////////////
			//FAV~CUSTOM
			if(filter === 'fav') {
				app.save('customFavSql', rowSql);
			} else {
				app.save('customItemsSql', rowSql);
			}
		}
		/////////////////
		// RETURN HTML //
		/////////////////
		if(rowHtml == '') {
			if($('#foodSearch').is(':focus')) {
				rowHtml = '<div class="searcheable noContent"><div><em>' + LANG.NO_MATCHES[lang] + '</em></div></div>';
			} else {
				rowHtml = '<div class="searcheable noContent"><div><em>' + LANG.NO_ENTRIES[lang] + '</em></div></div>';
			}
		}
		////////////
		// OUTPUT //
		////////////
		return rowHtml;
	},
	//@//////////@//
	//@ REPEATER @//
	//@//////////@//
	repeaterTrigger: '',
	repeaterLoop:    '',
	repeater: function(target,style,triggerMs,repeatMs,callback) {
		$(target).removeClass(style);
		clearTimeout(app.repeaterTrigger);
		clearTimeout(app.repeaterLoop);
		///////////////
		// AUTOCLEAR //
		///////////////
		var clearActions = touchend + ' mouseout mouseleave touchleave touchcancel';
		$(target).off(clearActions).on(clearActions, function (evt) {
			if(!app.device.ios && !app.device.firefoxos) {
				evt.preventDefault();
			}
			$(target).removeClass(style);
			clearTimeout(app.repeaterTrigger);
			clearTimeout(app.repeaterLoop);
		});
		/////////////
		// TRIGGER //
		/////////////
		$(target).off(touchstart).on(touchstart, function (evt) {
			if(!app.device.ios && !app.device.firefoxos) {
				evt.preventDefault();
			}
			clearTimeout(app.repeaterTrigger);
			clearTimeout(app.repeaterLoop);
			//TAP
			$(target).addClass(style);
			callback();
			//START
			app.repeaterTrigger = setTimeout(function() {
				//REPEAT
				(function repeatMe() {
					clearTimeout(app.repeaterTrigger);
					clearTimeout(app.repeaterLoop);
					callback();
					app.repeaterLoop = setTimeout(repeatMe,repeatMs);
				})();
			}, triggerMs);
			return false;
		});
	}
};
////////////////
// ADD/REMOVE //
////////////////
app.handlers.addRemove = function(target,minValue,maxValue,valueType) {
	if(!minValue) { minValue = 0;    }
	if(!maxValue) { maxValue = 9999; }
	//HTML
	if(!$( target + 'Neg').html()) {
		$(target).before2('<p class="neg" id="' + target.replace('#','') + 'Neg"></p><p class="pos" id="' + target.replace('#','') + 'Pos"></p>');
	}
	//NEG
	app.handlers.repeater(target + 'Neg','active',400,25,function() {
		var inputValue = valueType == 'int' ? parseInt($(target).val()) : parseFloat($(target).val());
		if(inputValue >= minValue + 1) {
			inputValue = inputValue - 1;
		} else {
			inputValue = 0;
		}
		$(target).val(decimalize(inputValue,-1));
	});
	//POS
	app.handlers.repeater(target + 'Pos','active',400,25,function() {
		if($(target).val() == '') {
			$(target).val(0);
		}
		var inputValue = valueType == 'int' ? parseInt($(target).val()) : parseFloat($(target).val());
		if(inputValue <= maxValue - 1) {
			inputValue = inputValue + 1;
		}
		$(target).val( decimalize(inputValue,-1) );
	});
};
/////////////
// APP GET //
/////////////
////////////////
// SCREENSHOT //
////////////////
app.screenshot = function() {
//SCREENSHOT
	var day = 60 * 60 * 24 * 1000;
	clearEntries(function() {
		saveEntry({raw: true, id: app.now()-(0*day), title: 1300, body: '', published: app.now()-(0*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(1*day), title: 1800, body: '', published: app.now()-(1*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(2*day), title: 1500, body: '', published: app.now()-(2*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(3*day), title: 1000, body: '', published: app.now()-(3*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(4*day), title: 1300, body: '', published: app.now()-(4*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(5*day), title: 1800, body: '', published: app.now()-(5*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(6*day), title: 1300, body: '', published: app.now()-(6*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		saveEntry({raw: true, id: app.now()-(7*day), title: 1000, body: '', published: app.now()-(7*day), info: '', kcal: '', pro: 12, car: 19, fat: 4, fib: '', fii: 2, sug: 1, sod: 9});
		app.save('config_start_time',app.now()-(7.7*day));
		app.save('config_kcals_day_0',1400);
		$('#timerDailyInput').val(app.read('config_kcals_day_0'));
		updateTimer();
		app.exec.updateEntries();
	});
};
//KCALS
app.get.kcals = function(opt) {
	if(app.read('config_kcals_type','cyclic')) {
		if(app.read('config_kcals_day','d')) {
			if(opt == 'reset') {
				return 2000;
			}
			if(opt == 'key') {
				return 'config_kcals_day_2';
			}
			return app.read('config_kcals_day_2');
		} else {
			if(opt == 'reset') {
				return 1600;
			}
			if(opt == 'key') {
				return 'config_kcals_day_1';
			}
			return app.read('config_kcals_day_1');
		}
	} else {
		if(opt == 'reset') {
			return 2000;
		}
		if(opt == 'key') {
			return 'config_kcals_day_0';
		}
		return app.read('config_kcals_day_0');
	}
};
//#///////////#//
//# MOBILE OS #//
//#///////////#//
function getIsDesktop() {}
var isItDesktop = getIsDesktop;
function isDesktop() {
	return isItDesktop;
}
///////////
// LOADER //
///////////
if($('#loadMask').html() == '') {
	$('#loadMask').html2('\
<table width="100%" height="100%" border="0">\
  <tbody>\
    <tr>\
      <td align="center" valign="middle"><span></span></td>\
    </tr>\
  </tbody>\
</table>');
}
document.addEventListener("DOMContentLoaded", function(event) {
	$('body').addClass('domcontentloaded');
},false);
//#///////////////#//
//# GET USERAGENT #//
//#///////////////#//
var prefix;
var vendorClass;
var transitionend;
     if(/MSAppHost\/3.0/i.test(app.ua))				{ prefix = '';         transitionend = 'transitionend';       vendorClass = 'msie';   }
else if((/edge|trident|IEMobile/i).test(app.ua))	{ prefix = '-ms-';     transitionend = 'transitionend';       vendorClass = 'msie';   }
else if((/Firefox/i).test(app.ua))					{ prefix = '-moz-';    transitionend = 'transitionend';       vendorClass = 'moz';    }
else												{ prefix = '-webkit-'; transitionend = 'webkitTransitionEnd'; vendorClass = 'webkit'; }
///////////////////////////////////
// STANDALONE CONVERT CSS PREFIX //
///////////////////////////////////
if (!$("#plainLoad").length && !$("#superBlockCSS").length && isCurrentCacheValid !== 1) {
	if (vendorClass == "moz" || vendorClass == "msie") {
		var cssPath = 'css/index.css';
		$.support.cors = true;
		$.ajax({
			url : hostLocal + cssPath,
			dataType : "text",
			success : function (dataCSS) {
				if(vendorClass == 'moz') {
					dataCSS = dataCSS.split('-webkit-box-shadow').join('box-shadow');
					dataCSS = dataCSS.split('-webkit-').join('-moz-');
				}
				if(vendorClass == 'msie') {
					dataCSS = dataCSS.split('-webkit-box-shadow').join('box-shadow');
					dataCSS = dataCSS.split('-webkit-box-sizing').join('box-sizing');
					if(/MSAppHost\/3.0/i.test(app.ua)) {
						//MSAPP3
						dataCSS = dataCSS.split('-webkit-').join('');
					} else {
						//MSAPP2
						dataCSS = dataCSS.split('-webkit-').join('-ms-');
					}
				}
				$("#coreCss").remove();
				$("#coreFonts").prepend2("<style type='text/css' id='coreCss'></style>");
				$("#coreCss").html2(dataCSS);
			}
		});
	}
}
////////////////////////
// UPDATE USER COLORS //
////////////////////////
app.updateColorPicker = function() {
	if(!document.getElementById('colorPickerStyle')) {
		$('head').append2('<style type="text/css" id="colorPickerStyle"></style>');
	}
	var deficitColor  = app.read('colorDeficit');
	var balancedColor = app.read('colorBalanced');
	var surplusColor  = app.read('colorSurplus');

var pickerCss = '\
body.tab1 #appFooter li#tab1,\
body.tab2 #appFooter li#tab2,\
body.tab3 #appFooter li#tab3,\
body.tab4 #appFooter li#tab4			{ color: ' + balancedColor + '!important ; }\
body.tab1.surplus #appFooter li#tab1,\
body.tab2.surplus #appFooter li#tab2,\
body.tab3.surplus #appFooter li#tab3,\
body.tab4.surplus #appFooter li#tab4	{ color: ' + surplusColor  + '!important ; }\
body.tab1.deficit #appFooter li#tab1,\
body.tab2.deficit #appFooter li#tab2,\
body.tab3.deficit #appFooter li#tab3,\
body.tab4.deficit #appFooter li#tab4	{ color: ' + deficitColor  + '!important ; }\
body.balanced #appHeader		{ background-color: ' + balancedColor  +  '!important; }\
body.deficit #appHeader,\
body.over.deficit #appHeader	{ background-color: ' + deficitColor  +  '!important; }\
body.surplus #appHeader,\
body.over.surplus #appHeader	{ background-color: ' + surplusColor  +  '!important; }\
.android2 #balanceBar:before	{ background: -webkit-gradient(linear, left top, right top, color-stop(25.5%,' + deficitColor + '), color-stop(25.5%,' + balancedColor + '), color-stop(73.9%,' + balancedColor + '), color-stop(73.9%,'+surplusColor+')); }\
#balanceBar:before				{ background: -webkit-linear-gradient(left,                                  ' + deficitColor + ' 25.5%,             ' + balancedColor + ' 25.5%,             ' + balancedColor + ' 73.9%,             '+surplusColor+' 73.9%); }\
body.deficit #appStatusBalance #balanceBar:after	{ color: ' + deficitColor + '!important; }\
body.surplus #appStatusBalance #balanceBar:after	{ color: ' + surplusColor + '!important; }\
body.error.surplus #appHeader,\
body.error.deficit #appHeader		{ background-color: #000 !important; }\
body.error #timerKcalsInput			{ text-shadow: 0 0 1px rgba(255,255,255,.4) !important; }\
body.error.deficit #timerKcalsInput,\
body.error.deficit #timerKcals span,\
body.error.deficit #timerDailyInput,\
body.error.deficit #timerDaily span	{ color: #E54B1D !important; text-shadow: 0 0 1px rgba(255,255,255,.4) !important; }\
body.error.surplus #timerKcalsInput,\
body.error.surplus #timerKcals span,\
body.error.surplus #timerDailyInput,\
body.error.surplus #timerDaily span	{ color: #2DB454 !important; text-shadow: 0 0 1px rgba(255,255,255,.4) !important; }\
';
	//VENDOR PREFIX
	if(vendorClass == 'moz') {
		pickerCss = pickerCss.split('-webkit-').join('-moz-');
	}
	if(vendorClass == 'msie') {
		if(/MSAppHost\/3.0/i.test(app.ua)) {
			//MSAPP3
			pickerCss = pickerCss.split('-webkit-').join('');
		} else {
			//MSAPP2
			pickerCss = pickerCss.split('-webkit-').join('-ms-');
		}
	}
	$('#colorPickerStyle').html2(pickerCss);
};
app.updateColorPicker();
//#///////////////#//
//# TOUCH ? CLICK #//
//#///////////////#//
//test
try {
	document.createEvent('TouchEvent');
	app.touch = true;
} catch (err) {
	app.touch = false;
}
//
function isCordova() {
	return isMobileCordova;
}
function getAndroidVersion() {
	if((/Android/i).test(userAgent) && !app.http) {
		//android L
		if((/Build\/L/i).test(userAgent)) { return 4.4; }
		return parseFloat(userAgent.match(/Android [\d+\.]{3,5}/)[0].replace('Android ',''));
	} else {
		return -1;
	}
}
var gotAndroidVersion = getAndroidVersion();
var androidVersion = function() {
	return gotAndroidVersion;
};

var varHasTouch = !app.http && (/(iPhone|iPod|iPad|Android|BlackBerry|PlayBook)/).test(userAgent);
function hasTouch() {
	return varHasTouch;
}
var varHasTap = ((('ontouchstart' in document) || ('ontouchstart' in window)) && !app.device.linux) ? true : false;
function hasTap() {
	return varHasTap;
}
var touchstart  = hasTap() ? 'touchstart'  : 'mousedown';
var touchend    = hasTap() ? 'touchend'    : 'mouseup';
var touchmove   = hasTap() ? 'touchmove'   : 'mousemove';
var tap         = hasTap() ? 'tap'         : 'click';
var doubletap   = hasTap() ? 'doubleTap'   : 'dblclick';
var touchcancel = hasTap() ? 'touchcancel' : 'touchcancel';
var touchleave  = hasTap() ? 'touchleave'  : 'mouseleave';
var touchout    = hasTap() ? 'touchout'    : 'mouseout';

if(window.PointerEvent) {
	//IE11
	touchend    = 'pointerup';
	touchstart  = 'pointerdown';
	touchmove   = 'pointermove';
	touchcancel = 'pointercancel';
	touchleave  = 'pointerleave';
	touchout    = 'pointerout';
} else if (window.MSPointerEvent) {
	//IE10
	touchend    = 'MSPointerUp';
	touchstart  = 'MSPointerDown';
	touchmove   = 'MSPointerMove';
	touchcancel = 'MSPointerOver';
	touchleave  = 'MSPointerLeave';
	touchout    = 'MSPointerOut';
}
//
if (app.device.firefoxos || app.device.blackberry) {
	tap = 'click';
}
///////////////
// SAFE EXEC //
///////////////
app.safeExec = function (callback) {
	if (app.device.msapp) {
		MSApp.execUnsafeLocalFunction(function () {
			callback();
		});
	} else {
		callback();
	}
};
///////////////////
// ERROR HANDLER //
///////////////////
function errorHandler(error,callback) {
	if(typeof error === 'undefined') {
		error = '';
	}
	//STRINGIFY
	if(typeof error !== 'string') {
		error = JSON.stringify(error);
	}
	//DEV
	if(app.beenDev) {
		console.log('errorHandler Log: ' + error);
	}
	//DEV ALERT
	if (app.dev && blockAlerts == 0) {
		if (app.device.windows8) {
			if (typeof alert !== 'undefined') {
				alert(error);
			}
		} else {
			if (window.confirm(error)) {
				blockAlerts = 0;
			} else {
				blockAlerts = 1;
			}
		}
	} else {
		//LOG ERROR
		app.save('error_log_handled','handled log: ' + error)
		//TRACK
		app.analytics('error','handled: ' + error);
	}
	//////////////
	// CALLBACK //
	//////////////
	if (typeof callback === 'function') {
		callback();
	}
}
/////////////////
// NUMBER ONLY //
/////////////////
function isNumberKey(evt){
	var keyCode = (evt.which) ? evt.which : evt.keyCode;
	//backspace, enter, shift, left, right
	if(keyCode == 8 || keyCode == 13 || keyCode == 16 || keyCode == 37 || keyCode == 39) {
		return true;
	}
	if(keyCode != 46 && keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
		return false;
	}
	return true;
}
app.handlers.validate = function(target,config,preProcess,postProcess,focusProcess,blurProcess) {
	var inputHandler = (app.device.android == 4.1 || app.device.wp8) ? 'keydown' : 'keypress';
	//SETTINGS
	if(!config)           { config = {}; }
	if(!config.maxValue)  { config.maxValue  = 9999; }
	if(!config.maxLength) { config.maxLength = 4;    }
	//if(!config.allowDots) { config.allowDots = 0; }
	//if(!config.inverter)  { config.inverter  = 0; }
	////////////////////////
	// KEYDOWN VALIDATION //
	////////////////////////
	var keydownId;
	var keydownValue;
	$(target).on(inputHandler, function(evt) {
		keydownId    = evt.target.id;
		keydownValue = JSON.stringify($(this).val());
		var keyCode  = evt.which || evt.keyCode;
		//PRE HANDLERS
		if(preProcess) {
			preProcess();
		}
		////////////
		// CONFIG //
		////////////
		//ENTER
		if(keyCode == 13)								{ $(this).blur(); return true; }
		//MINUS INVERTER
		if(keyCode == 45 && config.inverter == true)	{ $(this).val( $(this).val()*-1 ); return false; }
		if(keyCode == 46 && config.inverter == true)	{ $(this).val( $(this).val()*-1 ); return false; }
		//DOT
		if(keyCode == 46 || (keyCode == 190 && app.device.wp8)) {
			if(config.allowDots != true || keydownValue.split('.').join('').length < keydownValue.length) {
				return false;
			}
			return true;
		}
		///////////////////
		// ENFORCE LIMIT //
		///////////////////
		keydownValue = $(this).val();
		if(parseInt($(this).val()) > config.maxValue || JSON.stringify($(this).val()).length > config.maxLength+1) {
			if(config.allowDots == true)  {
				$(this).val( parseFloat($(this).val()) );
			} else {
				$(this).val( parseInt($(this).val()) );
			}
			//PRE-CHECK
			if(isNumberKey(evt)) {
				keydownValue = $(this).val();
				$(this).val( $(this).val().slice(0,-1) );
			}
		}
		//CHECK
		return isNumberKey(evt);
	});
	//////////////////////
	// KEYUP VALIDATION //
	//////////////////////
	$(target).on('keyup change input paste', function(evt) {
		var keyCode = evt.which || evt.keyCode;
		//' bug
		if(keyCode == 222 || isNaN($(this).val())) {
			$('#' + keydownId).val( keydownValue );
		}
		//NO NEGATIVE
		if(!config.inverter) {
			if(parseInt($(this).val()) < 0) {
				$(this).val(Math.abs($(this).val()));
			}
		}
		//limit to 2 decimals
		if(($(this).val()).contains('.')) {
			var number = $(this).val().split('.');
			if (number[1].length > 2) {
				$(this).val( parseFloat(number[0] + '.' + number[1].slice(0,2)) );
			}
		}
		//POST HANDLERS
		if(postProcess) {
			postProcess();
		}
	});
	///////////
	// FOCUS //
	///////////
	$(target).on('focus', function(evt) {
		if($(this).val() == '0') {
			$(this).val('');
		}
		//FOCUS HANDLER
		if(focusProcess) {
			focusProcess();
		}
	});
	//////////
	// BLUR //
	//////////
	$(target).on('blur', function(evt) {
		if($(this).val().length == 0 || parseFloat($(this).val()) == 0 || isNaN($(this).val())) {
			if(config.defaultValue) {
				$(this).val(config.defaultValue);
			} else {
				$(this).val('0');
			}
		}
		if(config.minValue) {
			if($(this).val() < config.minValue) {
				$(this).val(config.minValue);
			}
		}
		if(config.maxValue) {
			if($(this).val() > config.maxValue) {
				$(this).val(config.maxValue);
			}
		}
		//BLUR HANDLER
		if(blurProcess) {
			blurProcess();
		}
	});
	/////////////////
	// PROPAGATION //
	/////////////////
	$(target).on(touchmove, function(evt) {
		evt.preventDefault();
	});
};
app.fixSql = function(fetchEntries) {
	if(!fetchEntries) { return ''; }
	//NULL
	fetchEntries = fetchEntries.split('undefined').join('');
	fetchEntries = fetchEntries.split('NaN').join('');
	//ZEROES
	fetchEntries = fetchEntries.split("'0,'").join("'0','");
	fetchEntries = fetchEntries.split("'0.0,'").join("'0.0','");
	fetchEntries = fetchEntries.split("'0.00,'").join("'0.00','");
	//NUMERIC
	fetchEntries = fetchEntries.split("0,'").join("0','");
	fetchEntries = fetchEntries.split("1,'").join("1','");
	fetchEntries = fetchEntries.split("2,'").join("2','");
	fetchEntries = fetchEntries.split("3,'").join("3','");
	fetchEntries = fetchEntries.split("4,'").join("4','");
	fetchEntries = fetchEntries.split("5,'").join("5','");
	fetchEntries = fetchEntries.split("6,'").join("6','");
	fetchEntries = fetchEntries.split("7,'").join("7','");
	fetchEntries = fetchEntries.split("8,'").join("8','");
	fetchEntries = fetchEntries.split("9,'").join("9','");
	//CUSTOM
	fetchEntries = fetchEntries.split("'fav,").join("'fav',");
	fetchEntries = fetchEntries.split("'nonFav,").join("'nonFav',");
	fetchEntries = fetchEntries.split("'custom,").join("'custom',");
	//GENERIC
	fetchEntries = fetchEntries.split("'','").join("','");
	fetchEntries = fetchEntries.split("',''").join("','");
	//ENDINGS
	fetchEntries = fetchEntries.split("(''").join("('");
	fetchEntries = fetchEntries.split(",');").join(",'');");
	//REFILL
	fetchEntries = fetchEntries.split(",',").join(",'',");
	//RESTORE
	fetchEntries = fetchEntries.split("#^#").join("");
	//
	return fetchEntries;
};
//////////
// TRIM //
//////////
function trim(str) {
	if(str) {
		if(str.length) {
			str = str.replace(/^\s+/, '');
			str = str.replace(/(^[ \t]*\n)/gm, "");
			for(var i = str.length - 1; i >= 0; i--) {
				if(/\S/i.test(str.charAt(i))) {
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
		}
	}
	return '';
}
function trimDot(x) {
	if(x.length) {
		return x.replace(/\.$/, '').replace(/\,$/, '');
	}
}
///////////////
// ISEMPTY() //
///////////////
function isEmpty(val){
	if (typeof val === 'undefined' || !val) {
		return true;
	} else {
		return false;
	}
}
//////////////////////
// PROTOTYPE.TRIM() //
//////////////////////
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		if (typeof this !== 'undefined') {
			if (this.length) {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			}
		}
		return '';
	};
}
///////////////
// HIGHLIGHT //
///////////////
app.highlight = function (target, duration, startColor, endColor, callback, forceWait) {
	if (!startColor) { startColor = 'rgba(255,200,0,0.5)'; }
	if (!endColor)   { endColor   = 'rgba(255,255,255,0)'; }
	if (!duration)   { duration   = 1000; }
	//
	$(target).css(prefix + 'transition', 'background linear 0s');
	$(target).css('background-color', startColor);	
	setTimeout(function () {
		$(target).css(prefix + 'transition', 'background linear ' + JSON.stringify(duration) + 'ms');
		$(target).css('background-color', endColor);
		$(target).css('pointer-events','none');
		//WAIT TO DISABLE
		setTimeout(function () {
			$(target).css(prefix + 'transition', 'background linear 0s');
			$(target).css('pointer-events','auto');
			//
			if (typeof callback === 'function') {
				callback();
			}
		}, duration);
	}, 0);
};
////////////////
// CAPITALIZE //
////////////////
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
///////////
// isOdd //
///////////
function isOdd(val) {
	return val % Math.round(2);
}
////////////////
// DECIMALIZE //
////////////////
function decimalize(val,p) {
	if((Math.round(Number(val) *  10) / 10)  == 0 && p == -1) { return '0';    }
	if((Math.round(Number(val) *  10) / 10)  == 0 && p ==  1)  { return '0.0';  }
	if((Math.round(Number(val) * 100) / 100) == 0)			  { return '0.00'; }
	if(p == 1)				{
		return Math.round(Number(val) * 10) / 10;
	}
	return Math.round(Number(val) * 100) / 100;
}
/////////////
// TOASCII //
/////////////
var base64map=JSON.parse(decodeURIComponent(escape(atob("eyLDgSI6IkEiLCLEgiI6IkEiLCLhuq4iOiJBIiwi4bq2IjoiQSIsIuG6sCI6IkEiLCLhurIiOiJBIiwi4bq0IjoiQSIsIseNIjoiQSIsIsOCIjoiQSIsIuG6pCI6IkEiLCLhuqwiOiJBIiwi4bqmIjoiQSIsIuG6qCI6IkEiLCLhuqoiOiJBIiwiw4QiOiJBIiwix54iOiJBIiwiyKYiOiJBIiwix6AiOiJBIiwi4bqgIjoiQSIsIsiAIjoiQSIsIsOAIjoiQSIsIuG6oiI6IkEiLCLIgiI6IkEiLCLEgCI6IkEiLCLEhCI6IkEiLCLDhSI6IkEiLCLHuiI6IkEiLCLhuIAiOiJBIiwiyLoiOiJBIiwiw4MiOiJBIiwi6pyyIjoiQUEiLCLDhiI6IkFFIiwix7wiOiJBRSIsIseiIjoiQUUiLCLqnLQiOiJBTyIsIuqctiI6IkFVIiwi6py4IjoiQVYiLCLqnLoiOiJBViIsIuqcvCI6IkFZIiwi4biCIjoiQiIsIuG4hCI6IkIiLCLGgSI6IkIiLCLhuIYiOiJCIiwiyYMiOiJCIiwixoIiOiJCIiwixIYiOiJDIiwixIwiOiJDIiwiw4ciOiJDIiwi4biIIjoiQyIsIsSIIjoiQyIsIsSKIjoiQyIsIsaHIjoiQyIsIsi7IjoiQyIsIsSOIjoiRCIsIuG4kCI6IkQiLCLhuJIiOiJEIiwi4biKIjoiRCIsIuG4jCI6IkQiLCLGiiI6IkQiLCLhuI4iOiJEIiwix7IiOiJEIiwix4UiOiJEIiwixJAiOiJEIiwixosiOiJEIiwix7EiOiJEWiIsIseEIjoiRFoiLCLDiSI6IkUiLCLElCI6IkUiLCLEmiI6IkUiLCLIqCI6IkUiLCLhuJwiOiJFIiwiw4oiOiJFIiwi4bq+IjoiRSIsIuG7hiI6IkUiLCLhu4AiOiJFIiwi4buCIjoiRSIsIuG7hCI6IkUiLCLhuJgiOiJFIiwiw4siOiJFIiwixJYiOiJFIiwi4bq4IjoiRSIsIsiEIjoiRSIsIsOIIjoiRSIsIuG6uiI6IkUiLCLIhiI6IkUiLCLEkiI6IkUiLCLhuJYiOiJFIiwi4biUIjoiRSIsIsSYIjoiRSIsIsmGIjoiRSIsIuG6vCI6IkUiLCLhuJoiOiJFIiwi6p2qIjoiRVQiLCLhuJ4iOiJGIiwixpEiOiJGIiwix7QiOiJHIiwixJ4iOiJHIiwix6YiOiJHIiwixKIiOiJHIiwixJwiOiJHIiwixKAiOiJHIiwixpMiOiJHIiwi4bigIjoiRyIsIsekIjoiRyIsIuG4qiI6IkgiLCLIniI6IkgiLCLhuKgiOiJIIiwixKQiOiJIIiwi4rGnIjoiSCIsIuG4piI6IkgiLCLhuKIiOiJIIiwi4bikIjoiSCIsIsSmIjoiSCIsIsONIjoiSSIsIsSsIjoiSSIsIsePIjoiSSIsIsOOIjoiSSIsIsOPIjoiSSIsIuG4riI6IkkiLCLEsCI6IkkiLCLhu4oiOiJJIiwiyIgiOiJJIiwiw4wiOiJJIiwi4buIIjoiSSIsIsiKIjoiSSIsIsSqIjoiSSIsIsSuIjoiSSIsIsaXIjoiSSIsIsSoIjoiSSIsIuG4rCI6IkkiLCLqnbkiOiJEIiwi6p27IjoiRiIsIuqdvSI6IkciLCLqnoIiOiJSIiwi6p6EIjoiUyIsIuqehiI6IlQiLCLqnawiOiJJUyIsIsS0IjoiSiIsIsmIIjoiSiIsIuG4sCI6IksiLCLHqCI6IksiLCLEtiI6IksiLCLisakiOiJLIiwi6p2CIjoiSyIsIuG4siI6IksiLCLGmCI6IksiLCLhuLQiOiJLIiwi6p2AIjoiSyIsIuqdhCI6IksiLCLEuSI6IkwiLCLIvSI6IkwiLCLEvSI6IkwiLCLEuyI6IkwiLCLhuLwiOiJMIiwi4bi2IjoiTCIsIuG4uCI6IkwiLCLisaAiOiJMIiwi6p2IIjoiTCIsIuG4uiI6IkwiLCLEvyI6IkwiLCLisaIiOiJMIiwix4giOiJMIiwixYEiOiJMIiwix4ciOiJMSiIsIuG4viI6Ik0iLCLhuYAiOiJNIiwi4bmCIjoiTSIsIuKxriI6Ik0iLCLFgyI6Ik4iLCLFhyI6Ik4iLCLFhSI6Ik4iLCLhuYoiOiJOIiwi4bmEIjoiTiIsIuG5hiI6Ik4iLCLHuCI6Ik4iLCLGnSI6Ik4iLCLhuYgiOiJOIiwiyKAiOiJOIiwix4siOiJOIiwiw5EiOiJOIiwix4oiOiJOSiIsIsOTIjoiTyIsIsWOIjoiTyIsIseRIjoiTyIsIsOUIjoiTyIsIuG7kCI6Ik8iLCLhu5giOiJPIiwi4buSIjoiTyIsIuG7lCI6Ik8iLCLhu5YiOiJPIiwiw5YiOiJPIiwiyKoiOiJPIiwiyK4iOiJPIiwiyLAiOiJPIiwi4buMIjoiTyIsIsWQIjoiTyIsIsiMIjoiTyIsIsOSIjoiTyIsIuG7jiI6Ik8iLCLGoCI6Ik8iLCLhu5oiOiJPIiwi4buiIjoiTyIsIuG7nCI6Ik8iLCLhu54iOiJPIiwi4bugIjoiTyIsIsiOIjoiTyIsIuqdiiI6Ik8iLCLqnYwiOiJPIiwixYwiOiJPIiwi4bmSIjoiTyIsIuG5kCI6Ik8iLCLGnyI6Ik8iLCLHqiI6Ik8iLCLHrCI6Ik8iLCLDmCI6Ik8iLCLHviI6Ik8iLCLDlSI6Ik8iLCLhuYwiOiJPIiwi4bmOIjoiTyIsIsisIjoiTyIsIsaiIjoiT0kiLCLqnY4iOiJPTyIsIsaQIjoiRSIsIsaGIjoiTyIsIsiiIjoiT1UiLCLhuZQiOiJQIiwi4bmWIjoiUCIsIuqdkiI6IlAiLCLGpCI6IlAiLCLqnZQiOiJQIiwi4rGjIjoiUCIsIuqdkCI6IlAiLCLqnZgiOiJRIiwi6p2WIjoiUSIsIsWUIjoiUiIsIsWYIjoiUiIsIsWWIjoiUiIsIuG5mCI6IlIiLCLhuZoiOiJSIiwi4bmcIjoiUiIsIsiQIjoiUiIsIsiSIjoiUiIsIuG5niI6IlIiLCLJjCI6IlIiLCLisaQiOiJSIiwi6py+IjoiQyIsIsaOIjoiRSIsIsWaIjoiUyIsIuG5pCI6IlMiLCLFoCI6IlMiLCLhuaYiOiJTIiwixZ4iOiJTIiwixZwiOiJTIiwiyJgiOiJTIiwi4bmgIjoiUyIsIuG5oiI6IlMiLCLhuagiOiJTIiwixaQiOiJUIiwixaIiOiJUIiwi4bmwIjoiVCIsIsiaIjoiVCIsIsi+IjoiVCIsIuG5qiI6IlQiLCLhuawiOiJUIiwixqwiOiJUIiwi4bmuIjoiVCIsIsauIjoiVCIsIsWmIjoiVCIsIuKxryI6IkEiLCLqnoAiOiJMIiwixpwiOiJNIiwiyYUiOiJWIiwi6pyoIjoiVFoiLCLDmiI6IlUiLCLFrCI6IlUiLCLHkyI6IlUiLCLDmyI6IlUiLCLhubYiOiJVIiwiw5wiOiJVIiwix5ciOiJVIiwix5kiOiJVIiwix5siOiJVIiwix5UiOiJVIiwi4bmyIjoiVSIsIuG7pCI6IlUiLCLFsCI6IlUiLCLIlCI6IlUiLCLDmSI6IlUiLCLhu6YiOiJVIiwixq8iOiJVIiwi4buoIjoiVSIsIuG7sCI6IlUiLCLhu6oiOiJVIiwi4busIjoiVSIsIuG7riI6IlUiLCLIliI6IlUiLCLFqiI6IlUiLCLhuboiOiJVIiwixbIiOiJVIiwixa4iOiJVIiwixagiOiJVIiwi4bm4IjoiVSIsIuG5tCI6IlUiLCLqnZ4iOiJWIiwi4bm+IjoiViIsIsayIjoiViIsIuG5vCI6IlYiLCLqnaAiOiJWWSIsIuG6giI6IlciLCLFtCI6IlciLCLhuoQiOiJXIiwi4bqGIjoiVyIsIuG6iCI6IlciLCLhuoAiOiJXIiwi4rGyIjoiVyIsIuG6jCI6IlgiLCLhuooiOiJYIiwiw50iOiJZIiwixbYiOiJZIiwixbgiOiJZIiwi4bqOIjoiWSIsIuG7tCI6IlkiLCLhu7IiOiJZIiwixrMiOiJZIiwi4bu2IjoiWSIsIuG7viI6IlkiLCLIsiI6IlkiLCLJjiI6IlkiLCLhu7giOiJZIiwixbkiOiJaIiwixb0iOiJaIiwi4bqQIjoiWiIsIuKxqyI6IloiLCLFuyI6IloiLCLhupIiOiJaIiwiyKQiOiJaIiwi4bqUIjoiWiIsIsa1IjoiWiIsIsSyIjoiSUoiLCLFkiI6Ik9FIiwi4bSAIjoiQSIsIuG0gSI6IkFFIiwiypkiOiJCIiwi4bSDIjoiQiIsIuG0hCI6IkMiLCLhtIUiOiJEIiwi4bSHIjoiRSIsIuqcsCI6IkYiLCLJoiI6IkciLCLKmyI6IkciLCLKnCI6IkgiLCLJqiI6IkkiLCLKgSI6IlIiLCLhtIoiOiJKIiwi4bSLIjoiSyIsIsqfIjoiTCIsIuG0jCI6IkwiLCLhtI0iOiJNIiwiybQiOiJOIiwi4bSPIjoiTyIsIsm2IjoiT0UiLCLhtJAiOiJPIiwi4bSVIjoiT1UiLCLhtJgiOiJQIiwiyoAiOiJSIiwi4bSOIjoiTiIsIuG0mSI6IlIiLCLqnLEiOiJTIiwi4bSbIjoiVCIsIuKxuyI6IkUiLCLhtJoiOiJSIiwi4bScIjoiVSIsIuG0oCI6IlYiLCLhtKEiOiJXIiwiyo8iOiJZIiwi4bSiIjoiWiIsIsOhIjoiYSIsIsSDIjoiYSIsIuG6ryI6ImEiLCLhurciOiJhIiwi4bqxIjoiYSIsIuG6syI6ImEiLCLhurUiOiJhIiwix44iOiJhIiwiw6IiOiJhIiwi4bqlIjoiYSIsIuG6rSI6ImEiLCLhuqciOiJhIiwi4bqpIjoiYSIsIuG6qyI6ImEiLCLDpCI6ImEiLCLHnyI6ImEiLCLIpyI6ImEiLCLHoSI6ImEiLCLhuqEiOiJhIiwiyIEiOiJhIiwiw6AiOiJhIiwi4bqjIjoiYSIsIsiDIjoiYSIsIsSBIjoiYSIsIsSFIjoiYSIsIuG2jyI6ImEiLCLhupoiOiJhIiwiw6UiOiJhIiwix7siOiJhIiwi4biBIjoiYSIsIuKxpSI6ImEiLCLDoyI6ImEiLCLqnLMiOiJhYSIsIsOmIjoiYWUiLCLHvSI6ImFlIiwix6MiOiJhZSIsIuqctSI6ImFvIiwi6py3IjoiYXUiLCLqnLkiOiJhdiIsIuqcuyI6ImF2Iiwi6py9IjoiYXkiLCLhuIMiOiJiIiwi4biFIjoiYiIsIsmTIjoiYiIsIuG4hyI6ImIiLCLhtawiOiJiIiwi4baAIjoiYiIsIsaAIjoiYiIsIsaDIjoiYiIsIsm1IjoibyIsIsSHIjoiYyIsIsSNIjoiYyIsIsOnIjoiYyIsIuG4iSI6ImMiLCLEiSI6ImMiLCLJlSI6ImMiLCLEiyI6ImMiLCLGiCI6ImMiLCLIvCI6ImMiLCLEjyI6ImQiLCLhuJEiOiJkIiwi4biTIjoiZCIsIsihIjoiZCIsIuG4iyI6ImQiLCLhuI0iOiJkIiwiyZciOiJkIiwi4baRIjoiZCIsIuG4jyI6ImQiLCLhta0iOiJkIiwi4baBIjoiZCIsIsSRIjoiZCIsIsmWIjoiZCIsIsaMIjoiZCIsIsSxIjoiaSIsIsi3IjoiaiIsIsmfIjoiaiIsIsqEIjoiaiIsIsezIjoiZHoiLCLHhiI6ImR6Iiwiw6kiOiJlIiwixJUiOiJlIiwixJsiOiJlIiwiyKkiOiJlIiwi4bidIjoiZSIsIsOqIjoiZSIsIuG6vyI6ImUiLCLhu4ciOiJlIiwi4buBIjoiZSIsIuG7gyI6ImUiLCLhu4UiOiJlIiwi4biZIjoiZSIsIsOrIjoiZSIsIsSXIjoiZSIsIuG6uSI6ImUiLCLIhSI6ImUiLCLDqCI6ImUiLCLhursiOiJlIiwiyIciOiJlIiwixJMiOiJlIiwi4biXIjoiZSIsIuG4lSI6ImUiLCLisbgiOiJlIiwixJkiOiJlIiwi4baSIjoiZSIsIsmHIjoiZSIsIuG6vSI6ImUiLCLhuJsiOiJlIiwi6p2rIjoiZXQiLCLhuJ8iOiJmIiwixpIiOiJmIiwi4bWuIjoiZiIsIuG2giI6ImYiLCLHtSI6ImciLCLEnyI6ImciLCLHpyI6ImciLCLEoyI6ImciLCLEnSI6ImciLCLEoSI6ImciLCLJoCI6ImciLCLhuKEiOiJnIiwi4baDIjoiZyIsIselIjoiZyIsIuG4qyI6ImgiLCLInyI6ImgiLCLhuKkiOiJoIiwixKUiOiJoIiwi4rGoIjoiaCIsIuG4pyI6ImgiLCLhuKMiOiJoIiwi4bilIjoiaCIsIsmmIjoiaCIsIuG6liI6ImgiLCLEpyI6ImgiLCLGlSI6Imh2Iiwiw60iOiJpIiwixK0iOiJpIiwix5AiOiJpIiwiw64iOiJpIiwiw68iOiJpIiwi4bivIjoiaSIsIuG7iyI6ImkiLCLIiSI6ImkiLCLDrCI6ImkiLCLhu4kiOiJpIiwiyIsiOiJpIiwixKsiOiJpIiwixK8iOiJpIiwi4baWIjoiaSIsIsmoIjoiaSIsIsSpIjoiaSIsIuG4rSI6ImkiLCLqnboiOiJkIiwi6p28IjoiZiIsIuG1uSI6ImciLCLqnoMiOiJyIiwi6p6FIjoicyIsIuqehyI6InQiLCLqna0iOiJpcyIsIsewIjoiaiIsIsS1IjoiaiIsIsqdIjoiaiIsIsmJIjoiaiIsIuG4sSI6ImsiLCLHqSI6ImsiLCLEtyI6ImsiLCLisaoiOiJrIiwi6p2DIjoiayIsIuG4syI6ImsiLCLGmSI6ImsiLCLhuLUiOiJrIiwi4baEIjoiayIsIuqdgSI6ImsiLCLqnYUiOiJrIiwixLoiOiJsIiwixpoiOiJsIiwiyawiOiJsIiwixL4iOiJsIiwixLwiOiJsIiwi4bi9IjoibCIsIsi0IjoibCIsIuG4tyI6ImwiLCLhuLkiOiJsIiwi4rGhIjoibCIsIuqdiSI6ImwiLCLhuLsiOiJsIiwixYAiOiJsIiwiyasiOiJsIiwi4baFIjoibCIsIsmtIjoibCIsIsWCIjoibCIsIseJIjoibGoiLCLFvyI6InMiLCLhupwiOiJzIiwi4bqbIjoicyIsIuG6nSI6InMiLCLhuL8iOiJtIiwi4bmBIjoibSIsIuG5gyI6Im0iLCLJsSI6Im0iLCLhta8iOiJtIiwi4baGIjoibSIsIsWEIjoibiIsIsWIIjoibiIsIsWGIjoibiIsIuG5iyI6Im4iLCLItSI6Im4iLCLhuYUiOiJuIiwi4bmHIjoibiIsIse5IjoibiIsIsmyIjoibiIsIuG5iSI6Im4iLCLGniI6Im4iLCLhtbAiOiJuIiwi4baHIjoibiIsIsmzIjoibiIsIsOxIjoibiIsIseMIjoibmoiLCLDsyI6Im8iLCLFjyI6Im8iLCLHkiI6Im8iLCLDtCI6Im8iLCLhu5EiOiJvIiwi4buZIjoibyIsIuG7kyI6Im8iLCLhu5UiOiJvIiwi4buXIjoibyIsIsO2IjoibyIsIsirIjoibyIsIsivIjoibyIsIsixIjoibyIsIuG7jSI6Im8iLCLFkSI6Im8iLCLIjSI6Im8iLCLDsiI6Im8iLCLhu48iOiJvIiwixqEiOiJvIiwi4bubIjoibyIsIuG7oyI6Im8iLCLhu50iOiJvIiwi4bufIjoibyIsIuG7oSI6Im8iLCLIjyI6Im8iLCLqnYsiOiJvIiwi6p2NIjoibyIsIuKxuiI6Im8iLCLFjSI6Im8iLCLhuZMiOiJvIiwi4bmRIjoibyIsIserIjoibyIsIsetIjoibyIsIsO4IjoibyIsIse/IjoibyIsIsO1IjoibyIsIuG5jSI6Im8iLCLhuY8iOiJvIiwiyK0iOiJvIiwixqMiOiJvaSIsIuqdjyI6Im9vIiwiyZsiOiJlIiwi4baTIjoiZSIsIsmUIjoibyIsIuG2lyI6Im8iLCLIoyI6Im91Iiwi4bmVIjoicCIsIuG5lyI6InAiLCLqnZMiOiJwIiwixqUiOiJwIiwi4bWxIjoicCIsIuG2iCI6InAiLCLqnZUiOiJwIiwi4bW9IjoicCIsIuqdkSI6InAiLCLqnZkiOiJxIiwiyqAiOiJxIiwiyYsiOiJxIiwi6p2XIjoicSIsIsWVIjoiciIsIsWZIjoiciIsIsWXIjoiciIsIuG5mSI6InIiLCLhuZsiOiJyIiwi4bmdIjoiciIsIsiRIjoiciIsIsm+IjoiciIsIuG1syI6InIiLCLIkyI6InIiLCLhuZ8iOiJyIiwiybwiOiJyIiwi4bWyIjoiciIsIuG2iSI6InIiLCLJjSI6InIiLCLJvSI6InIiLCLihoQiOiJjIiwi6py/IjoiYyIsIsmYIjoiZSIsIsm/IjoiciIsIsWbIjoicyIsIuG5pSI6InMiLCLFoSI6InMiLCLhuaciOiJzIiwixZ8iOiJzIiwixZ0iOiJzIiwiyJkiOiJzIiwi4bmhIjoicyIsIuG5oyI6InMiLCLhuakiOiJzIiwiyoIiOiJzIiwi4bW0IjoicyIsIuG2iiI6InMiLCLIvyI6InMiLCLJoSI6ImciLCLhtJEiOiJvIiwi4bSTIjoibyIsIuG0nSI6InUiLCLFpSI6InQiLCLFoyI6InQiLCLhubEiOiJ0IiwiyJsiOiJ0IiwiyLYiOiJ0Iiwi4bqXIjoidCIsIuKxpiI6InQiLCLhuasiOiJ0Iiwi4bmtIjoidCIsIsatIjoidCIsIuG5ryI6InQiLCLhtbUiOiJ0IiwixqsiOiJ0IiwiyogiOiJ0IiwixaciOiJ0Iiwi4bW6IjoidGgiLCLJkCI6ImEiLCLhtIIiOiJhZSIsIsedIjoiZSIsIuG1tyI6ImciLCLJpSI6ImgiLCLKriI6ImgiLCLKryI6ImgiLCLhtIkiOiJpIiwiyp4iOiJrIiwi6p6BIjoibCIsIsmvIjoibSIsIsmwIjoibSIsIuG0lCI6Im9lIiwiybkiOiJyIiwiybsiOiJyIiwiyboiOiJyIiwi4rG5IjoiciIsIsqHIjoidCIsIsqMIjoidiIsIsqNIjoidyIsIsqOIjoieSIsIuqcqSI6InR6Iiwiw7oiOiJ1Iiwixa0iOiJ1Iiwix5QiOiJ1Iiwiw7siOiJ1Iiwi4bm3IjoidSIsIsO8IjoidSIsIseYIjoidSIsIseaIjoidSIsIsecIjoidSIsIseWIjoidSIsIuG5syI6InUiLCLhu6UiOiJ1IiwixbEiOiJ1IiwiyJUiOiJ1Iiwiw7kiOiJ1Iiwi4bunIjoidSIsIsawIjoidSIsIuG7qSI6InUiLCLhu7EiOiJ1Iiwi4burIjoidSIsIuG7rSI6InUiLCLhu68iOiJ1IiwiyJciOiJ1IiwixasiOiJ1Iiwi4bm7IjoidSIsIsWzIjoidSIsIuG2mSI6InUiLCLFryI6InUiLCLFqSI6InUiLCLhubkiOiJ1Iiwi4bm1IjoidSIsIuG1qyI6InVlIiwi6p24IjoidW0iLCLisbQiOiJ2Iiwi6p2fIjoidiIsIuG5vyI6InYiLCLKiyI6InYiLCLhtowiOiJ2Iiwi4rGxIjoidiIsIuG5vSI6InYiLCLqnaEiOiJ2eSIsIuG6gyI6InciLCLFtSI6InciLCLhuoUiOiJ3Iiwi4bqHIjoidyIsIuG6iSI6InciLCLhuoEiOiJ3Iiwi4rGzIjoidyIsIuG6mCI6InciLCLhuo0iOiJ4Iiwi4bqLIjoieCIsIuG2jSI6IngiLCLDvSI6InkiLCLFtyI6InkiLCLDvyI6InkiLCLhuo8iOiJ5Iiwi4bu1IjoieSIsIuG7syI6InkiLCLGtCI6InkiLCLhu7ciOiJ5Iiwi4bu/IjoieSIsIsizIjoieSIsIuG6mSI6InkiLCLJjyI6InkiLCLhu7kiOiJ5IiwixboiOiJ6Iiwixb4iOiJ6Iiwi4bqRIjoieiIsIsqRIjoieiIsIuKxrCI6InoiLCLFvCI6InoiLCLhupMiOiJ6IiwiyKUiOiJ6Iiwi4bqVIjoieiIsIuG1tiI6InoiLCLhto4iOiJ6IiwiypAiOiJ6IiwixrYiOiJ6IiwiyYAiOiJ6Iiwi76yAIjoiZmYiLCLvrIMiOiJmZmkiLCLvrIQiOiJmZmwiLCLvrIEiOiJmaSIsIu+sgiI6ImZsIiwixLMiOiJpaiIsIsWTIjoib2UiLCLvrIYiOiJzdCIsIuKCkCI6ImEiLCLigpEiOiJlIiwi4bWiIjoiaSIsIuKxvCI6ImoiLCLigpIiOiJvIiwi4bWjIjoiciIsIuG1pCI6InUiLCLhtaUiOiJ2Iiwi4oKTIjoieCJ9"))));
function toAscii(string) { return string.replace(/[^A-Za-z0-9\[\] ]/g, function(a) { return base64map[a]||a}) };
/////////////////
// SEARCHALIZE //
/////////////////
function searchalize(str) {
	if(!str || str == '')	{ return ''; }
	if(str === null)		{ return ''; }
	str = toAscii(str);
	str = str.split('	').join('');
	str = str.toLowerCase();
	str = str.split('0').join('');
	str = str.split('1').join('');
	str = str.split('2').join('');
	str = str.split('3').join('');
	str = str.split('4').join('');
	str = str.split('5').join('');
	str = str.split('6').join('');
	str = str.split('7').join('');
	str = str.split('8').join('');
	str = str.split('9').join('');
	str = str.split(' ').join('');
	str = str.split('.').join('');
	str = str.split(',').join('');
	str = str.split('-').join('');
	str = str.split('_').join('');
	str = str.split(':').join('');
	str = str.split(';').join('');
	str = str.split('"').join('');
	str = str.split('“').join('');
	str = str.split('”').join('');
	str = str.split("'").join('');
	str = str.split('‘').join('');
	str = str.split("’").join('');
	str = str.split('(').join('');
	str = str.split(')').join('');
	str = str.split('{').join('');
	str = str.split('}').join('');
	str = str.split('[').join('');
	str = str.split(']').join('');
	str = str.split('%').join('');
	str = str.split('&').join('');
	str = str.split('/').join('');
	str = str.split('~').join('');
	str = str.split('*').join('');
	str = str.split('`').join('');
	str = str.split('!').join('');
	str = str.split('@').join('');
	str = str.split('#').join('');
	str = str.split('$').join('');
	str = str.split('^').join('');
	str = str.split('+').join('');
	str = str.split('|').join('');
	str = str.split('?').join('');
	str = str.split('>').join('');
	str = str.split('<').join('');
	str = str.split('=').join('');
	str = str.split('\\').join('');
	str = str.split('।').join('');
	str = str.split('。').join('');
	str = str.split('、').join('');
	return trim(str);
}
////////////////
// ARRAY FIND //
////////////////
if (!Array.prototype.find) {
	Array.prototype.find = function (predicate) {
		if (this === null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	};
}
/////////////////////
// ARRAY FINDINDEX //
/////////////////////
if (!Array.prototype.findIndex) {
	Array.prototype.findIndex = function (predicate) {
		if (this === null) {
			throw new TypeError('Array.prototype.findIndex called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return i;
			}
		}
		return -1;
	};
}
//////////////////
// ARRAY FILTER //
//////////////////
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun) {
		'use strict';
		if (this === void 0 || this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== 'function') {
			throw new TypeError();
		}
		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i];
				if (fun.call(thisArg, val, i, t)) {
					res.push(val);
				}
			}
		}
		return res;
	};
}
///////////////
// ARRAY MAP //
///////////////
if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		var T,A,k;
		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}
		if (arguments.length > 1) {
			T = thisArg;
		}
		A = new Array(len);
		k = 0;
		while (k < len) {
			var kValue,
			mappedValue;
			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue, k, O);
				A[k] = mappedValue;
			}
			k++;
		}
		return A;
	};
}
//////////////
// INCLUDES //
//////////////
if (!Array.prototype.includes) {
	Array.prototype.includes = function (searchElement /*, fromIndex*/
	) {
		'use strict';
		var O = Object(this);
		var len = parseInt(O.length) || 0;
		if (len === 0) {
			return false;
		}
		var n = parseInt(arguments[1]) || 0;
		var k;
		if (n >= 0) {
			k = n;
		} else {
			k = len + n;
			if (k < 0) {
				k = 0;
			}
		}
		var currentElement;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				(searchElement !== searchElement && currentElement !== currentElement)) {
				return true;
			}
			k++;
		}
		return false;
	};
}
//////////////
// CONTAINS //
//////////////
// ARRAY //
Array.prototype.contains = function(obj) {
	return (JSON.stringify(this)).indexOf(JSON.stringify(obj)) > -1;
	//return JSON.stringify(this).indexOf(obj) > -1;
};
// STRING //
String.prototype.contains = function () {
	return String.prototype.indexOf.apply(this, arguments) !== -1;
};
////////////////
// SORTBYATTR //
////////////////
Array.prototype.sortbyattr = function(attr,order) {
	// NORMAL ATTR SORT
	this.sort(function(a, b) {
		if(order == 'desc') {
			return (b[attr] > a[attr]) ? 1 : ((b[attr] < a[attr]) ? -1 : 0);
		} else {
			return (a[attr] > b[attr]) ? 1 : ((a[attr] < b[attr]) ? -1 : 0);
		}
	});
	return this;
};
// OBJECT
function sortObject(obj) {
	var arr = [];
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			arr.push([prop,obj[prop]]);
		}
	}
	return arr.sort().reverse();
}
/////////////////
// PUSH UNIQUE //
/////////////////
Array.prototype.pushUnique = function (item) {
	if (this.indexOf(item) == -1) {
		//if(jQuery.inArray(item, this) == -1) {
		this.push(item);
		return true;
	}
	return false;
};
/////////////////
// DATE FORMAT //
/////////////////
function dtFormat(input) {
    if(!input) { return ""; }
	input        = new Date(input);
	var gotMonth = input.getMonth()+1;
	var gotDate  = input.getDate();
	var hour     = input.getHours();
    var minute   = input.getMinutes(); //+1;
    if(minute < 10)   { minute = "0" + minute; }
	if(gotMonth < 10) { gotMonth = "0" + gotMonth; }
	if(gotDate  < 10) { gotDate  = "0" + gotDate;  }
	//
	return input.getFullYear() + "/" + gotMonth + "/" + gotDate + ' - ' + hour + ":" + minute;
}
////////////////////
// DAY UTC FORMAT //
////////////////////
function DayUtcFormat(input) {
    if(!input) { return ""; }
	input = new Date(input);
	var gotMonth = input.getMonth()+1;
	var gotDate  = input.getDate();
	if(gotMonth < 10) { gotMonth = "0" + gotMonth; }
	if(gotDate  < 10) { gotDate  = "0" + gotDate;  }
	return input.getFullYear() + "/" + gotMonth + "/" + gotDate;
}
////////////////
// DAY FORMAT //
////////////////
function dayFormat(input) {
    if(!input) { return ""; }
	input = new Date(input);
	var gotMonth = input.getMonth()+1;
	var gotDate  = input.getDate();
	if(gotMonth < 10) { gotMonth = "0" + gotMonth; }
	if(gotDate  < 10) { gotDate  = "0" + gotDate;  }
	return input.getFullYear() + "/" + gotMonth + "/" + gotDate;
}
//////////////
// DATEDIFF //
//////////////
function dateDiff(date1,date2) {
	//no future dates
	//if(date1 > date2) { date1 = new Date().getTime(); }

	//Get 1 day in milliseconds
	var one_day  = 1000*60*60*24;
	// Convert both dates to milliseconds
	var date1_ms = date1;
	var date2_ms = date2;
	// Calculate the difference in milliseconds
	var difference_ms = date2_ms - date1_ms;
	var showAgo = difference_ms >= 0 ? true : false;
	difference_ms = Math.abs(difference_ms);

	//take out milliseconds
	difference_ms = difference_ms/1000;
	var seconds   = Math.floor(difference_ms % 60);
	difference_ms = difference_ms/60;
	var minutes   = Math.floor(difference_ms % 60);
	difference_ms = difference_ms/60;
	var hours     = Math.floor(difference_ms % 24);
	var days      = Math.floor(difference_ms/24);

	var lMinutes = " " + LANG.MINUTES[lang] + " ";
	var lHours   = " " + LANG.HOURS[lang] + " ";
	var lDays    = " " + LANG.DAYS[lang] + " ";

	if(minutes == 0) { lMinutes = ""; minutes = ""; }
	if(hours   == 0) { lHours   = ""; hours   = ""; }
	if(days    == 0) { lDays    = ""; days    = ""; }

	if(minutes == 1) { lMinutes = " " + LANG.MINUTE[lang] + " "; }
	if(hours   == 1) { lHours   = " " + LANG.HOUR[lang] + " ";   }
	if(days    == 1) { lDays    = " " + LANG.DAY[lang] + " ";    }

	if(days    > 3)                             { lHours   = ""; hours   = ""; }
	if(days    > 0)                             { lMinutes = ""; minutes = ""; }
	if(days    > 0 && hours   > 0)              { lDays    = lDays  + LANG.AND[lang] + " "; }
	if(hours   > 0 && minutes > 0)              { lHours   = lHours + LANG.AND[lang] + " "; }
	if(days == 0 && hours == 0 && minutes == 0) { minutes = 0; lMinutes = " " + LANG.MINUTES[lang] + " "; }

	if(showAgo == true) {
		return LANG.PREAGO[lang] + " " + days + lDays + hours + lHours + minutes + lMinutes + " " + LANG.AGO[lang] + " ";
	} else
		return days + lDays + hours + lHours + minutes + lMinutes + " "; {
	}

}
////////////////////////
// WINDOW ORIENTATION //
////////////////////////
function getOrientation() {
	if(window.orientation == 90 || window.orientation == -90) {
		return "landscape";
	}
	else if (window.orientation == 0 || window.orientation == 180) {
		return "portrait";
	}
}
//////////////////////
// ANDROID 2 SELECT //
//////////////////////
function android2Select() {
	if(app.device.android && app.device.android < 4) {
		$('body').append2('<input type="number" id="dummyInput" style="opacity: 0.001;" />');
		$('#dummyInput').focus();
		$('#dummyInput').blur();
		$('#dummyInput').remove();
	}
}
////////////////////
// CSS LOAD COUNT //
////////////////////
function cssLoadCount(num,total) {
	var loadCounter = " (" + num + "/" + total + ")";
	if(num == 0 && total == 0) { loadCounter = ''; }
	$("#cssAutoUpdate").html2("\
		.loading #advancedAutoUpdate:before	  { content: '" + LANG.DOWNLOADING[lang]     + loadCounter + "'; }\
		.pending #advancedAutoUpdate:before	  { content: '" + LANG.RESTART_PENDING[lang] + "'; }\
		.uptodate #advancedAutoUpdate:before  { content: '" + LANG.UP_TO_DATE[lang]      + "'; }\
		.corrupted #advancedAutoUpdate:before { content: '" + LANG.CORRUPTED[lang]       + "'; }\
		.spinnerMask #loadMask:before		  { content: '" + LANG.PREPARING_DB[lang]    + "'; }\
		.spinnerMask.updtdb #loadMask:before  { content: '" + LANG.UPDATING_DB[lang]     + "'; }\
	");
}
//////////////
// KICKDOWN //
//////////////
function kickDown(el) {
	if(!el) { el = '#appContent'; }
	if(!$('body').hasClass('android2')) {
		if(!app.device.desktop || app.device.windows8) {
			window.scrollTo(0, 0);
			if(document.body) {
				document.body.scrollTop = 0;
			}
			//window.scroll($(el)[0].scrollTop,0,0);
		}
	} else {
		$(el).scrollTop($(el).scrollTop());
	}
}
///////////////////
// TRACK INSTALL //
///////////////////
app.trackInstall = function () {
	if (!app.read('app_installed') && app.read('intro_dismissed','done')) {
		if (!app.http && (app.device.ios || app.device.android || app.device.blackberry || app.device.playbook || app.device.wp8 || app.device.msapp || app.device.windows8 || app.device.osxapp || app.device.amazon)) {
			//INTALL
			app.analytics('install');
		} else {
			//WEBINSTALL
			app.analytics('webinstall');
		}
		//LOCK
		app.save('app_installed', 'installed');
	}
};
//#//////////////#//
//# ONLINE USERS #//
//#//////////////#//
app.online = function () {
	$.ajax({type: 'GET', dataType: 'text', url: app.https + 'kcals.net/' + 'update.php?type=usr', success: function(onlineUsers) {
		app.save('online_users',onlineUsers);
		if(app.read('app_last_tab','tab1')) {
			$('#onlineUsers span').html2(app.read('online_users'));
		}
	}});
};
//#//////////////#//
//# BLOCK PIRACY #//
//#//////////////#//
app.piracy = function (force) {
	if (force == 1 || typeof baseVersion === 'undefined' || typeof LANG.BACKUP_AND_SYNC === 'undefined' || baseVersion < 1.9) {
		app.analytics('blocked');
		clearTimeout(app.timers['popTimer']);
		app.timers['popTimer'] = setTimeout(function () {
			appConfirm('Warning! Critical Update!', 'This version of KCals is built on a distribution of Apache Cordova that contains security vulnerabilities. Please update now!', function (button) {
				if (button) {
					if (app.device.android) {
						app.url('android');
					} else if (app.device.ios) {
						app.url('ios');
					} else if (app.device.wp8) {
						app.url('wp8');
					} else if (app.device.amazon) {
						app.url('amazon');
					} else if (app.device.windows8) {
						app.url('windows8');
					} else if (app.device.blackberry) {
						app.url('blackberry');
					} else if (app.device.playbook) {
						app.url('playbook');
					} else {
						app.url('web');
					}
				}
			}, LANG.OK[lang], LANG.CANCEL[lang]);
		}, 2000);
	}
};
/////////////////
// MSAPP METRO //
/////////////////
if(app.device.windows8) {
	/////////////////
	// METRO ALERT //
	/////////////////
	(function() {
		var alertsToShow = [];
		var dialogVisible = false;
		function showPendingAlerts() {
			if (dialogVisible || !alertsToShow.length) {
				return;
			}
			dialogVisible = true;
			(new Windows.UI.Popups.MessageDialog(alertsToShow.shift())).showAsync().done(function () {
				dialogVisible = false;
				showPendingAlerts();
			});
		}
		window.alert = function (message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
			alertsToShow.push(message);
			showPendingAlerts();
		};
	})();
}
//##/////////////##//
//## APP.ALERT() ##//
//##/////////////##//
window.azert = window.alert;
window.alert = {};
window.alert = function (title, msg, button, callback) {
	if (typeof title    !== 'undefined' && typeof msg === 'undefined') { msg  = ' '; }
	if (typeof title    === 'undefined') { title  = 'alert';       }
	if (typeof msg      === 'undefined') { msg    = 'msg';         }
	if (typeof button   === 'undefined') { button = LANG.OK[lang]; }
	if (typeof callback !== 'function')  { callback = voidThis;    }
	//
	if (app.device.playbook) {
		try {
			blackberry.ui.dialog.customAskAsync(msg, [button], function(button) { callback(button+1); }, {title : title});
		} catch(err) { errorHandler(err); }
	} else if (typeof navigator.notification !== 'undefined' && !app.http && !app.device.windows8) {
		navigator.notification.alert(msg, callback, title, button);
	} else {
		if ((msg != 'msg' && msg != ' ') || title == 'alert') { msg = '\n' + msg; }
		if (window.azert(title + '\n' + msg))
		setTimeout(function () {
			callback();
		}, 0);
	}
};
//##//////////////##//
//## APP.PROMPT() ##//
//##//////////////##// prompt: function(message, resultCallback, title, buttonLabels, defaultText) {
app.prompt = function(title,content,callback) {
	var usrPrompt = window.prompt(title,content);
	if(usrPrompt !== null) {
		callback(usrPrompt);
	}
};
/*window.navigator.notification.prompt(
    new String(), // message
    function(answer) {
        if (answer.buttonIndex === 1) {
            // Ok
            var newcat = answer.input1;
            transaction.executeSql("INSERT INTO cat (Name) VALUES (?)", [newcat]);
        }
        else {
            // Exit
        }
    }, // callback
    "ADD CATEGORY", //title
    ["Ok", "Exit"], // button titles
    new String() // defaultText
);*/
//##///////////////////##//
//## APP CONFIRM LAYER ##//
//##///////////////////##// appConfirm(title, msg, callback, LANG.OK[lang], LANG.CANCEL[lang]);
var MSDialog;
var MSNext = [];
function appConfirm(title, msg, callback, ok, cancel) {
	var okCancel = (cancel == 'hide') ? [ok] : [cancel, ok];
	///////////
	// MSAPP //
	///////////
	if (app.device.windows8) {
		//STORE NEXT
		if (MSDialog == true) {
			var isRepeated = 0;
			//NOREPEAT
			$.each(MSNext, function (key, value) {
				if (title == MSNext[key][0]) {
					isRepeated = 1;
				}
			});
			if (isRepeated == 0) {
				MSNext.push([title, msg, callback, ok, cancel]);
			}
			return;
		}
		// SHOW
		try {
			MSDialog = true;
			var md = new Windows.UI.Popups.MessageDialog(msg, title);
			md.commands.append(new Windows.UI.Popups.UICommand(ok));
			if (cancel != "hide") {
				md.commands.append(new Windows.UI.Popups.UICommand(cancel));
			}
			md.showAsync()
			.then(function (command) {
				if(typeof command !== 'undefined' && typeof command !== 'null') {
					if (command.label == ok) { callback(2); } else if (command.label == cancel) { callback(1); }
				}
			})
			.done(function () {
				MSDialog = false;
				if (MSNext.length) {
					appConfirm(MSNext[0][0], MSNext[0][1], MSNext[0][2], MSNext[0][3], MSNext[0][4]);
					MSNext.shift();
				}
			});
		} catch (err) {
			MSDialog = false;
			errorHandler(err);
		}
	//////////////
	// PLAYBOOK //
	//////////////
	} else if (app.device.playbook) {
		try {
			blackberry.ui.dialog.customAskAsync(msg, [cancel, ok], function(button) { callback(button+1); }, {title : title});
		} catch(err) { errorHandler(err); }
	////////////////////
	// CORDOVA PLUGIN //
	////////////////////
	} else if (typeof navigator.notification !== 'undefined') {
		navigator.notification.confirm(msg, callback, title, okCancel);
	//////////////
	// FALLBACK //
	//////////////
	} else {
		if (window.confirm(title + "\n" + msg)) {
			callback(2);
		} else {
			callback(1);
		}
	}
}
//////////////
// SENDMAIL //
//////////////
app.sendmail = function (usrMail, usrMsg, callback) {
	if (usrMsg && usrMail) {
		$.ajax({
			type : 'POST',
			url : app.https + 'kcals.net/mail.php',
			data : {
				mail: usrMail,
				msg: usrMsg,
				usr: app.get.platform() + ' - ' + lang
			},
			dataType : 'text'
		}).error(function(xhr, statusText) {
			callback(false);
		}).success(function (result) {
			if (typeof callback === 'function') {
				callback(true);
			}
		});
	}
};
///////////////////////
// CUSTOM JQUERY TAP //
///////////////////////
$.prototype.tap = function (style, callback, callbackCondition) {
	var target = this.selector;
	var t = searchalize(target);
	var isButton = style == 'button' ? 40 : 40;
	if (app.is.scrollable && app.device.desktop) {
		isButton = 1;
	}
	//RESET
	app.handlers.activeRowTouches[t] = 0;
	app.handlers.activeRowBlock[t] = 0;
	app.handlers.activeLastId[t] = '';
	clearTimeout(app.handlers.activeRowTimer[t]);
	////////////////
	// SET PARENT //
	////////////////
	var targetParent = target;
	if (target.match(' ')) {
		targetParent = target.split(' ')[0] + ', ' + target;
	}
	//////////////
	// TOUCHEND //
	//////////////
	$(target).on(touchend, function (evt) {
		if ($(this).hasClass(style) && app.handlers.activeRowBlock[t] == 0) {
			if (typeof callback === 'function') {
				app.handlers.activeRowBlock[t] = 1;
				if (style == 'button') {
					callback(evt, style);
				} else {
					callback($(this).attr('id'), style);
				}
				$(this).addClass(style);
				app.handlers.activeLastId[t] = this;
				app.handlers.activeRowTouches[t] = 0;
				app.handlers.activeRowBlock[t] = 0;
				clearTimeout(app.handlers.activeRowTimer[t]);
				if (style != 'activeOverflow') {
					$(app.handlers.activeLastId[t]).removeClass(style);
				}
			}
		} else {
			app.handlers.activeRowTouches[t] = 0;
			app.handlers.activeRowBlock[t] = 0;
			clearTimeout(app.handlers.activeRowTimer[t]);
		}
		if (style == 'false') {
			var falseThis = this;
			$(falseThis).css('pointer-events', 'none');
			app.timeout('tapSelect', 500, function () {
				$(falseThis).css('pointer-events', 'auto');
			});
		}
	});
	////////////////
	// TOUCHSTART //
	////////////////
	setTimeout(function () {
		$(target).on(touchstart, function (evt) {
			if (!$(this).hasClass(style)) {
				$(app.handlers.activeLastId[t]).removeClass(style);
			}
			var localTarget = this;
			app.handlers.activeRowTouches[t] = 0;
			clearTimeout(app.handlers.activeRowTimer[t]);
			app.handlers.activeRowTimer[t] = setTimeout(function () {
					if (app.handlers.activeRowTouches[t] == 0 && app.handlers.activeRowBlock[t] == 0) {
						$(localTarget).addClass(style);
						app.handlers.activeLastId[t] = localTarget;
					} else {
						$(app.handlers.activeLastId[t]).removeClass(style);
					}
				}, isButton);
			//CALLBACK CONDITION
			if (callbackCondition) {
				if (callbackCondition() === false) {
					clearTimeout(app.handlers.activeRowTimer[t]);
				}
			}
			//no drag
			//if(style == 'button') {
			//	return false;
			//}
		});
	}, 400);
	//////////////////////
	// ROW LEAVE CANCEL //
	//////////////////////
	if (app.device.windows8) {
		$(target).on(touchout + ' ' + touchleave + ' ' + touchcancel, function (evt) {
			$(app.handlers.activeLastId[t]).removeClass(style);
			clearTimeout(app.handlers.activeRowTimer[t]);
		});
	} else {
		$(targetParent).on(touchout + ' ' + touchleave + ' ' + touchcancel, function (evt) {
			app.handlers.activeRowTouches[t]++;
			if (!app.device.wp8 && style != 'activeOverflow') {
				clearTimeout(app.handlers.activeRowTimer[t]);
				$(app.handlers.activeLastId[t]).removeClass(style);
			}
		});
	}
	////////////////////////
	// SCROLL/MOVE CANCEL //
	////////////////////////
	if (!app.device.windows8) {
		var moveCancel = app.device.osxapp || app.device.osx ? 'mouseout' : touchmove;
		$(targetParent).on('scroll ' + moveCancel, function (evt) {
			app.handlers.activeRowTouches[t]++;
			clearTimeout(app.handlers.activeRowTimer[t]);
			if (app.handlers.activeRowTouches[t] > 7 || (app.handlers.activeRowTouches[t] > 1 && app.device.android)) {
				$(app.handlers.activeLastId[t]).removeClass(style);
				if (app.device.osxapp || app.device.osx) {
					$('.activeOverflow').removeClass(style);
				}
				app.handlers.activeRowTouches[t] = 0;
			}
		});
	}
	///////////////////////
	// SCROLL TIME BLOCK //
	///////////////////////
	$(targetParent).on('scroll', function (evt) {
		app.handlers.activeRowBlock[t] = 1;
		setTimeout(function () {
			app.handlers.activeRowBlock[t] = 0;
		}, 100);
	});
};
//#/////////////////////#//
//# DETECT PRIVATE MODE #//
//#/////////////////////#//
function retry(isDone, next) {
	var current_trial = 0,
		max_retry = 50,
		interval = 10,
		is_timeout = false;
	var id = window.setInterval(function() {
		if (isDone()) {
			window.clearInterval(id);
			next(is_timeout);
		}
		if (current_trial++ > max_retry) {
			window.clearInterval(id);
			is_timeout = true;
			next(is_timeout);
		}
	}, 10);
}
function isIE10OrLater(user_agent) {
	var ua = user_agent.toLowerCase();
	if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
		return false;
	}
	var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
	if (match && parseInt(match[1], 10) >= 10) {
		return true;
	}
	return false;
}
function detectPrivateMode(callback) {
	var is_private;
	if (window.webkitRequestFileSystem) {
		window.webkitRequestFileSystem(window.TEMPORARY, 1, function() {
			is_private = false;
		}, function(e) {
			console.log(e);
			is_private = true;
		});
	} else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
		var db;
		try {
			db = window.indexedDB.open('test');
		} catch (e) {
			is_private = true;
		}
		if (typeof is_private === 'undefined') {
			retry(function isDone() {
				return db.readyState === 'done' ? true : false;
			}, function next(is_timeout) {
				if (!is_timeout) {
					is_private = db.result ? false : true;
				}
			});
		}
	} else if (isIE10OrLater(window.navigator.userAgent)) {
		is_private = false;
		try {
			if (!window.indexedDB) {
				is_private = true;
			}
		} catch (e) {
			is_private = true;
		}
	} else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
		try {
			window.localStorage.setItem('test', 1);
		} catch (e) {
			is_private = true;
		}
		if (typeof is_private === 'undefined') {
			is_private = false;
			window.localStorage.removeItem('test');
		}
	}
	retry(function isDone() {
		return typeof is_private !== 'undefined' ? true : false;
	}, function next(is_timeout) {
		callback(is_private);
	});
}
//#/////#//
//# MD5 #//
//#/////#//
var md5=function(r){function n(r,n){return r<<n|r>>>32-n}function t(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,t=1073741824&r,o=1073741824&n,f=(1073741823&r)+(1073741823&n),t&o?2147483648^f^e^u:t|o?1073741824&f?3221225472^f^e^u:1073741824^f^e^u:f^e^u}function o(r,n,t){return r&n|~r&t}function e(r,n,t){return r&t|n&~t}function u(r,n,t){return r^n^t}function f(r,n,t){return n^(r|~t)}function i(r,e,u,f,i,a,c){return r=t(r,t(t(o(e,u,f),i),c)),t(n(r,a),e)}function a(r,o,u,f,i,a,c){return r=t(r,t(t(e(o,u,f),i),c)),t(n(r,a),o)}function c(r,o,e,f,i,a,c){return r=t(r,t(t(u(o,e,f),i),c)),t(n(r,a),o)}function C(r,o,e,u,i,a,c){return r=t(r,t(t(f(o,e,u),i),c)),t(n(r,a),o)}function g(r){for(var n,t=r.length,o=t+8,e=(o-o%64)/64,u=16*(e+1),f=Array(u-1),i=0,a=0;t>a;)n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|r.charCodeAt(a)<<i,a++;return n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|128<<i,f[u-2]=t<<3,f[u-1]=t>>>29,f}function h(r){var n,t,o="",e="";for(t=0;3>=t;t++)n=r>>>8*t&255,e="0"+n.toString(16),o+=e.substr(e.length-2,2);return o}function d(r){r=r.replace(/\r\n/g,"\n");for(var n="",t=0;t<r.length;t++){var o=r.charCodeAt(t);128>o?n+=String.fromCharCode(o):o>127&&2048>o?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n}var v,m,S,l,A,s,y,b,p,w=Array(),L=7,j=12,k=17,q=22,x=5,z=9,B=14,D=20,E=4,F=11,G=16,H=23,I=6,J=10,K=15,M=21;for(r=d(r),w=g(r),s=1732584193,y=4023233417,b=2562383102,p=271733878,v=0;v<w.length;v+=16)m=s,S=y,l=b,A=p,s=i(s,y,b,p,w[v+0],L,3614090360),p=i(p,s,y,b,w[v+1],j,3905402710),b=i(b,p,s,y,w[v+2],k,606105819),y=i(y,b,p,s,w[v+3],q,3250441966),s=i(s,y,b,p,w[v+4],L,4118548399),p=i(p,s,y,b,w[v+5],j,1200080426),b=i(b,p,s,y,w[v+6],k,2821735955),y=i(y,b,p,s,w[v+7],q,4249261313),s=i(s,y,b,p,w[v+8],L,1770035416),p=i(p,s,y,b,w[v+9],j,2336552879),b=i(b,p,s,y,w[v+10],k,4294925233),y=i(y,b,p,s,w[v+11],q,2304563134),s=i(s,y,b,p,w[v+12],L,1804603682),p=i(p,s,y,b,w[v+13],j,4254626195),b=i(b,p,s,y,w[v+14],k,2792965006),y=i(y,b,p,s,w[v+15],q,1236535329),s=a(s,y,b,p,w[v+1],x,4129170786),p=a(p,s,y,b,w[v+6],z,3225465664),b=a(b,p,s,y,w[v+11],B,643717713),y=a(y,b,p,s,w[v+0],D,3921069994),s=a(s,y,b,p,w[v+5],x,3593408605),p=a(p,s,y,b,w[v+10],z,38016083),b=a(b,p,s,y,w[v+15],B,3634488961),y=a(y,b,p,s,w[v+4],D,3889429448),s=a(s,y,b,p,w[v+9],x,568446438),p=a(p,s,y,b,w[v+14],z,3275163606),b=a(b,p,s,y,w[v+3],B,4107603335),y=a(y,b,p,s,w[v+8],D,1163531501),s=a(s,y,b,p,w[v+13],x,2850285829),p=a(p,s,y,b,w[v+2],z,4243563512),b=a(b,p,s,y,w[v+7],B,1735328473),y=a(y,b,p,s,w[v+12],D,2368359562),s=c(s,y,b,p,w[v+5],E,4294588738),p=c(p,s,y,b,w[v+8],F,2272392833),b=c(b,p,s,y,w[v+11],G,1839030562),y=c(y,b,p,s,w[v+14],H,4259657740),s=c(s,y,b,p,w[v+1],E,2763975236),p=c(p,s,y,b,w[v+4],F,1272893353),b=c(b,p,s,y,w[v+7],G,4139469664),y=c(y,b,p,s,w[v+10],H,3200236656),s=c(s,y,b,p,w[v+13],E,681279174),p=c(p,s,y,b,w[v+0],F,3936430074),b=c(b,p,s,y,w[v+3],G,3572445317),y=c(y,b,p,s,w[v+6],H,76029189),s=c(s,y,b,p,w[v+9],E,3654602809),p=c(p,s,y,b,w[v+12],F,3873151461),b=c(b,p,s,y,w[v+15],G,530742520),y=c(y,b,p,s,w[v+2],H,3299628645),s=C(s,y,b,p,w[v+0],I,4096336452),p=C(p,s,y,b,w[v+7],J,1126891415),b=C(b,p,s,y,w[v+14],K,2878612391),y=C(y,b,p,s,w[v+5],M,4237533241),s=C(s,y,b,p,w[v+12],I,1700485571),p=C(p,s,y,b,w[v+3],J,2399980690),b=C(b,p,s,y,w[v+10],K,4293915773),y=C(y,b,p,s,w[v+1],M,2240044497),s=C(s,y,b,p,w[v+8],I,1873313359),p=C(p,s,y,b,w[v+15],J,4264355552),b=C(b,p,s,y,w[v+6],K,2734768916),y=C(y,b,p,s,w[v+13],M,1309151649),s=C(s,y,b,p,w[v+4],I,4149444226),p=C(p,s,y,b,w[v+11],J,3174756917),b=C(b,p,s,y,w[v+2],K,718787259),y=C(y,b,p,s,w[v+9],M,3951481745),s=t(s,m),y=t(y,S),b=t(b,l),p=t(p,A);var N=h(s)+h(y)+h(b)+h(p);return N.toLowerCase()};
//#//////////////#//
//# COLOR PICKER #//
//#//////////////#//
!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports&&"object"==typeof module?module.exports=t:t(jQuery)}(function(t,e){"use strict";function r(e,r,n,a){for(var i=[],s=0;s<e.length;s++){var o=e[s];if(o){var l=tinycolor(o),c=l.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";c+=tinycolor.equals(r,o)?" sp-thumb-active":"";var f=l.toString(a.preferredFormat||"rgb"),u=b?"background-color:"+l.toRgbString():"filter:"+l.toFilter();i.push('<span title="'+f+'" data-color="'+l.toRgbString()+'" class="'+c+'"><span class="sp-thumb-inner" style="'+u+';" /></span>')}else{var h="sp-clear-display";i.push(t("<div />").append(t('<span data-color="" style="background-color:transparent;" class="'+h+'"></span>').attr("title",a.noColorSelectedText)).html())}}return"<div class='sp-cf "+n+"'>"+i.join("")+"</div>"}function n(){for(var t=0;t<p.length;t++)p[t]&&p[t].hide()}function a(e,r){var n=t.extend({},d,e);return n.callbacks={move:c(n.move,r),change:c(n.change,r),show:c(n.show,r),hide:c(n.hide,r),beforeShow:c(n.beforeShow,r)},n}function i(i,o){function c(){if(W.showPaletteOnly&&(W.showPalette=!0),De.text(W.showPaletteOnly?W.togglePaletteMoreText:W.togglePaletteLessText),W.palette){de=W.palette.slice(0),pe=t.isArray(de[0])?de:[de],ge={};for(var e=0;e<pe.length;e++)for(var r=0;r<pe[e].length;r++){var n=tinycolor(pe[e][r]).toRgbString();ge[n]=!0}}ke.toggleClass("sp-flat",X),ke.toggleClass("sp-input-disabled",!W.showInput),ke.toggleClass("sp-alpha-enabled",W.showAlpha),ke.toggleClass("sp-clear-enabled",Je),ke.toggleClass("sp-buttons-disabled",!W.showButtons),ke.toggleClass("sp-palette-buttons-disabled",!W.togglePaletteOnly),ke.toggleClass("sp-palette-disabled",!W.showPalette),ke.toggleClass("sp-palette-only",W.showPaletteOnly),ke.toggleClass("sp-initial-disabled",!W.showInitial),ke.addClass(W.className).addClass(W.containerClassName),z()}function d(){function e(e){return e.data&&e.data.ignore?(O(t(e.target).closest(".sp-thumb-el").data("color")),j()):(O(t(e.target).closest(".sp-thumb-el").data("color")),j(),I(!0),W.hideAfterPaletteSelect&&T()),!1}if(g&&ke.find("*:not(input)").attr("unselectable","on"),c(),Be&&_e.after(Le).hide(),Je||je.hide(),X)_e.after(ke).hide();else{var r="parent"===W.appendTo?_e.parent():t(W.appendTo);1!==r.length&&(r=t("body")),r.append(ke)}y(),Ke.bind("click.spectrum touchstart.spectrum",function(e){xe||A(),e.stopPropagation(),t(e.target).is("input")||e.preventDefault()}),(_e.is(":disabled")||W.disabled===!0)&&V(),ke.click(l),Fe.change(P),Fe.bind("paste",function(){setTimeout(P,1)}),Fe.keydown(function(t){13==t.keyCode&&P()}),Ee.text(W.cancelText),Ee.bind("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),F(),T()}),je.attr("title",W.clearText),je.bind("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),Qe=!0,j(),X&&I(!0)}),qe.text(W.chooseText),qe.bind("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),g&&Fe.is(":focus")&&Fe.trigger("change"),E()&&(I(!0),T())}),De.text(W.showPaletteOnly?W.togglePaletteMoreText:W.togglePaletteLessText),De.bind("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),W.showPaletteOnly=!W.showPaletteOnly,W.showPaletteOnly||X||ke.css("left","-="+(Se.outerWidth(!0)+5)),c()}),f(He,function(t,e,r){he=t/se,Qe=!1,r.shiftKey&&(he=Math.round(10*he)/10),j()},S,C),f(Ae,function(t,e){ce=parseFloat(e/ae),Qe=!1,W.showAlpha||(he=1),j()},S,C),f(Ce,function(t,e,r){if(r.shiftKey){if(!ye){var n=fe*ee,a=re-ue*re,i=Math.abs(t-n)>Math.abs(e-a);ye=i?"x":"y"}}else ye=null;var s=!ye||"x"===ye,o=!ye||"y"===ye;s&&(fe=parseFloat(t/ee)),o&&(ue=parseFloat((re-e)/re)),Qe=!1,W.showAlpha||(he=1),j()},S,C),$e?(O($e),q(),Ye=Xe||tinycolor($e).format,w($e)):q(),X&&M();var n=g?"mousedown.spectrum":"click.spectrum touchstart.spectrum";Oe.delegate(".sp-thumb-el",n,e),Ne.delegate(".sp-thumb-el:nth-child(1)",n,{ignore:!0},e)}function y(){if(G&&window.localStorage){try{var e=window.localStorage[G].split(",#");e.length>1&&(delete window.localStorage[G],t.each(e,function(t,e){w(e)}))}catch(r){}try{be=window.localStorage[G].split(";")}catch(r){}}}function w(e){if(Y){var r=tinycolor(e).toRgbString();if(!ge[r]&&-1===t.inArray(r,be))for(be.push(r);be.length>ve;)be.shift();if(G&&window.localStorage)try{window.localStorage[G]=be.join(";")}catch(n){}}}function _(){var t=[];if(W.showPalette)for(var e=0;e<be.length;e++){var r=tinycolor(be[e]).toRgbString();ge[r]||t.push(be[e])}return t.reverse().slice(0,W.maxSelectionSize)}function x(){var e=N(),n=t.map(pe,function(t,n){return r(t,e,"sp-palette-row sp-palette-row-"+n,W)});y(),be&&n.push(r(_(),e,"sp-palette-row sp-palette-row-selection",W)),Oe.html(n.join(""))}function k(){if(W.showInitial){var t=We,e=N();Ne.html(r([t,e],e,"sp-palette-row-initial",W))}}function S(){(0>=re||0>=ee||0>=ae)&&z(),te=!0,ke.addClass(me),ye=null,_e.trigger("dragstart.spectrum",[N()])}function C(){te=!1,ke.removeClass(me),_e.trigger("dragstop.spectrum",[N()])}function P(){var t=Fe.val();if(null!==t&&""!==t||!Je){var e=tinycolor(t);e.isValid()?(O(e),I(!0)):Fe.addClass("sp-validation-error")}else O(null),I(!0)}function A(){Z?T():M()}function M(){var e=t.Event("beforeShow.spectrum");return Z?void z():(_e.trigger(e,[N()]),void(J.beforeShow(N())===!1||e.isDefaultPrevented()||(n(),Z=!0,t(we).bind("keydown.spectrum",R),t(we).bind("click.spectrum",H),t(window).bind("resize.spectrum",U),Le.addClass("sp-active"),ke.removeClass("sp-hidden"),z(),q(),We=N(),k(),J.show(We),_e.trigger("show.spectrum",[We]))))}function R(t){27===t.keyCode&&T()}function H(t){2!=t.button&&(te||(Ge?I(!0):F(),T()))}function T(){Z&&!X&&(Z=!1,t(we).unbind("keydown.spectrum",R),t(we).unbind("click.spectrum",H),t(window).unbind("resize.spectrum",U),Le.removeClass("sp-active"),ke.addClass("sp-hidden"),J.hide(N()),_e.trigger("hide.spectrum",[N()]))}function F(){O(We,!0)}function O(t,e){if(tinycolor.equals(t,N()))return void q();var r,n;!t&&Je?Qe=!0:(Qe=!1,r=tinycolor(t),n=r.toHsv(),ce=n.h%360/360,fe=n.s,ue=n.v,he=n.a),q(),r&&r.isValid()&&!e&&(Ye=Xe||r.getFormat())}function N(t){return t=t||{},Je&&Qe?null:tinycolor.fromRatio({h:ce,s:fe,v:ue,a:Math.round(100*he)/100},{format:t.format||Ye})}function E(){return!Fe.hasClass("sp-validation-error")}function j(){q(),J.move(N()),_e.trigger("move.spectrum",[N()])}function q(){Fe.removeClass("sp-validation-error"),D();var t=tinycolor.fromRatio({h:ce,s:1,v:1});Ce.css("background-color",t.toHexString());var e=Ye;1>he&&(0!==he||"name"!==e)&&("hex"===e||"hex3"===e||"hex6"===e||"name"===e)&&(e="rgb");var r=N({format:e}),n="";if(Ve.removeClass("sp-clear-display"),Ve.css("background-color","transparent"),!r&&Je)Ve.addClass("sp-clear-display");else{var a=r.toHexString(),i=r.toRgbString();if(b||1===r.alpha?Ve.css("background-color",i):(Ve.css("background-color","transparent"),Ve.css("filter",r.toFilter())),W.showAlpha){var s=r.toRgb();s.a=0;var o=tinycolor(s).toRgbString(),l="linear-gradient(left, "+o+", "+a+")";g?Re.css("filter",tinycolor(o).toFilter({gradientType:1},a)):(Re.css("background","-webkit-"+l),Re.css("background","-moz-"+l),Re.css("background","-ms-"+l),Re.css("background","linear-gradient(to right, "+o+", "+a+")"))}n=r.toString(e)}W.showInput&&Fe.val(n),W.showPalette&&x(),k()}function D(){var t=fe,e=ue;if(Je&&Qe)Te.hide(),Me.hide(),Pe.hide();else{Te.show(),Me.show(),Pe.show();var r=t*ee,n=re-e*re;r=Math.max(-ne,Math.min(ee-ne,r-ne)),n=Math.max(-ne,Math.min(re-ne,n-ne)),Pe.css({top:n+"px",left:r+"px"});var a=he*se;Te.css({left:a-oe/2+"px"});var i=ce*ae;Me.css({top:i-le+"px"})}}function I(t){var e=N(),r="",n=!tinycolor.equals(e,We);e&&(r=e.toString(Ye),w(e)),Ie&&_e.val(r),t&&n&&(J.change(e),_e.trigger("change",[e]))}function z(){ee=Ce.width(),re=Ce.height(),ne=Pe.height(),ie=Ae.width(),ae=Ae.height(),le=Me.height(),se=He.width(),oe=Te.width(),X||(ke.css("position","absolute"),ke.offset(W.offset?W.offset:s(ke,Ke))),D(),W.showPalette&&x(),_e.trigger("reflow.spectrum")}function B(){_e.show(),Ke.unbind("click.spectrum touchstart.spectrum"),ke.remove(),Le.remove(),p[Ue.id]=null}function L(r,n){return r===e?t.extend({},W):n===e?W[r]:(W[r]=n,void c())}function K(){xe=!1,_e.attr("disabled",!1),Ke.removeClass("sp-disabled")}function V(){T(),xe=!0,_e.attr("disabled",!0),Ke.addClass("sp-disabled")}function $(t){W.offset=t,z()}var W=a(o,i),X=W.flat,Y=W.showSelectionPalette,G=W.localStorageKey,Q=W.theme,J=W.callbacks,U=u(z,10),Z=!1,te=!1,ee=0,re=0,ne=0,ae=0,ie=0,se=0,oe=0,le=0,ce=0,fe=0,ue=0,he=1,de=[],pe=[],ge={},be=W.selectionPalette.slice(0),ve=W.maxSelectionSize,me="sp-dragging",ye=null,we=i.ownerDocument,_e=(we.body,t(i)),xe=!1,ke=t(m,we).addClass(Q),Se=ke.find(".sp-picker-container"),Ce=ke.find(".sp-color"),Pe=ke.find(".sp-dragger"),Ae=ke.find(".sp-hue"),Me=ke.find(".sp-slider"),Re=ke.find(".sp-alpha-inner"),He=ke.find(".sp-alpha"),Te=ke.find(".sp-alpha-handle"),Fe=ke.find(".sp-input"),Oe=ke.find(".sp-palette"),Ne=ke.find(".sp-initial"),Ee=ke.find(".sp-cancel"),je=ke.find(".sp-clear"),qe=ke.find(".sp-choose"),De=ke.find(".sp-palette-toggle"),Ie=_e.is("input"),ze=Ie&&"color"===_e.attr("type")&&h(),Be=Ie&&!X,Le=Be?t(v).addClass(Q).addClass(W.className).addClass(W.replacerClassName):t([]),Ke=Be?Le:_e,Ve=Le.find(".sp-preview-inner"),$e=W.color||Ie&&_e.val(),We=!1,Xe=W.preferredFormat,Ye=Xe,Ge=!W.showButtons||W.clickoutFiresChange,Qe=!$e,Je=W.allowEmpty&&!ze;d();var Ue={show:M,hide:T,toggle:A,reflow:z,option:L,enable:K,disable:V,offset:$,set:function(t){O(t),I()},get:N,destroy:B,container:ke};return Ue.id=p.push(Ue)-1,Ue}function s(e,r){var n=0,a=e.outerWidth(),i=e.outerHeight(),s=r.outerHeight(),o=e[0].ownerDocument,l=o.documentElement,c=l.clientWidth+t(o).scrollLeft(),f=l.clientHeight+t(o).scrollTop(),u=r.offset();return u.top+=s,u.left-=Math.min(u.left,u.left+a>c&&c>a?Math.abs(u.left+a-c):0),u.top-=Math.min(u.top,u.top+i>f&&f>i?Math.abs(i+s-n):n),u}function o(){}function l(t){t.stopPropagation()}function c(t,e){var r=Array.prototype.slice,n=r.call(arguments,2);return function(){return t.apply(e,n.concat(r.call(arguments)))}}function f(e,r,n,a){function i(t){t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.returnValue=!1}function s(t){if(f){if(g&&c.documentMode<9&&!t.button)return l();var n=t.originalEvent&&t.originalEvent.touches&&t.originalEvent.touches[0],a=n&&n.pageX||t.pageX,s=n&&n.pageY||t.pageY,o=Math.max(0,Math.min(a-u.left,d)),b=Math.max(0,Math.min(s-u.top,h));p&&i(t),r.apply(e,[o,b,t])}}function o(r){var a=r.which?3==r.which:2==r.button;a||f||n.apply(e,arguments)!==!1&&(f=!0,h=t(e).height(),d=t(e).width(),u=t(e).offset(),t(c).bind(b),t(c.body).addClass("sp-dragging"),s(r),i(r))}function l(){f&&(t(c).unbind(b),t(c.body).removeClass("sp-dragging"),setTimeout(function(){a.apply(e,arguments)},0)),f=!1}r=r||function(){},n=n||function(){},a=a||function(){};var c=document,f=!1,u={},h=0,d=0,p="ontouchstart"in window,b={};b.selectstart=i,b.dragstart=i,b["touchmove mousemove"]=s,b["touchend mouseup"]=l,t(e).bind("touchstart mousedown",o)}function u(t,e,r){var n;return function(){var a=this,i=arguments,s=function(){n=null,t.apply(a,i)};r&&clearTimeout(n),(r||!n)&&(n=setTimeout(s,e))}}function h(){return t.fn.spectrum.inputTypeColorSupport()}var d={beforeShow:o,move:o,change:o,show:o,hide:o,color:!1,flat:!1,showInput:!1,allowEmpty:!1,showButtons:!0,clickoutFiresChange:!0,showInitial:!1,showPalette:!1,showPaletteOnly:!1,hideAfterPaletteSelect:!1,togglePaletteOnly:!1,showSelectionPalette:!0,localStorageKey:!1,appendTo:"body",maxSelectionSize:7,cancelText:"cancel",chooseText:"choose",togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected",preferredFormat:!1,className:"",containerClassName:"",replacerClassName:"",showAlpha:!1,theme:"sp-light",palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[],disabled:!1,offset:null},p=[],g=!!/msie/i.exec(window.navigator.userAgent),b=function(){function t(t,e){return!!~(""+t).indexOf(e)}var e=document.createElement("div"),r=e.style;return r.cssText="background-color:rgba(0,0,0,.5)",t(r.backgroundColor,"rgba")||t(r.backgroundColor,"hsla")}(),v=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),m=function(){var t="";if(g)for(var e=1;6>=e;e++)t+="<div class='sp-"+e+"'></div>";return["<div class='sp-container sp-hidden'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>",t,"</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("")}(),y="spectrum.id";t.fn.spectrum=function(e){if("string"==typeof e){var r=this,n=Array.prototype.slice.call(arguments,1);return this.each(function(){var a=p[t(this).data(y)];if(a){var i=a[e];if(!i)throw new Error("Spectrum: no such method: '"+e+"'");"get"==e?r=a.get():"container"==e?r=a.container:"option"==e?r=a.option.apply(a,n):"destroy"==e?(a.destroy(),t(this).removeData(y)):i.apply(a,n)}}),r}return this.spectrum("destroy").each(function(){var r=t.extend({},e,t(this).data()),n=i(this,r);t(this).data(y,n.id)})},t.fn.spectrum.load=!0,t.fn.spectrum.loadOpts={},t.fn.spectrum.draggable=f,t.fn.spectrum.defaults=d,t.fn.spectrum.inputTypeColorSupport=function w(){if("undefined"==typeof w._cachedResult){var e=t("<input type='color'/>")[0];w._cachedResult="color"===e.type&&""!==e.value}return w._cachedResult},t.spectrum={},t.spectrum.localization={},t.spectrum.palettes={},t.fn.spectrum.processNativeColorInputs=function(){var e=t("input[type=color]");e.length&&!h()&&e.spectrum({preferredFormat:"hex6"})},function(){function t(t){var r={r:0,g:0,b:0},a=1,s=!1,o=!1;return"string"==typeof t&&(t=F(t)),"object"==typeof t&&(t.hasOwnProperty("r")&&t.hasOwnProperty("g")&&t.hasOwnProperty("b")?(r=e(t.r,t.g,t.b),s=!0,o="%"===String(t.r).substr(-1)?"prgb":"rgb"):t.hasOwnProperty("h")&&t.hasOwnProperty("s")&&t.hasOwnProperty("v")?(t.s=R(t.s),t.v=R(t.v),r=i(t.h,t.s,t.v),s=!0,o="hsv"):t.hasOwnProperty("h")&&t.hasOwnProperty("s")&&t.hasOwnProperty("l")&&(t.s=R(t.s),t.l=R(t.l),r=n(t.h,t.s,t.l),s=!0,o="hsl"),t.hasOwnProperty("a")&&(a=t.a)),a=x(a),{ok:s,format:t.format||o,r:D(255,I(r.r,0)),g:D(255,I(r.g,0)),b:D(255,I(r.b,0)),a:a}}function e(t,e,r){return{r:255*k(t,255),g:255*k(e,255),b:255*k(r,255)}}function r(t,e,r){t=k(t,255),e=k(e,255),r=k(r,255);var n,a,i=I(t,e,r),s=D(t,e,r),o=(i+s)/2;if(i==s)n=a=0;else{var l=i-s;switch(a=o>.5?l/(2-i-s):l/(i+s),i){case t:n=(e-r)/l+(r>e?6:0);break;case e:n=(r-t)/l+2;break;case r:n=(t-e)/l+4}n/=6}return{h:n,s:a,l:o}}function n(t,e,r){function n(t,e,r){return 0>r&&(r+=1),r>1&&(r-=1),1/6>r?t+6*(e-t)*r:.5>r?e:2/3>r?t+(e-t)*(2/3-r)*6:t}var a,i,s;if(t=k(t,360),e=k(e,100),r=k(r,100),0===e)a=i=s=r;else{var o=.5>r?r*(1+e):r+e-r*e,l=2*r-o;a=n(l,o,t+1/3),i=n(l,o,t),s=n(l,o,t-1/3)}return{r:255*a,g:255*i,b:255*s}}function a(t,e,r){t=k(t,255),e=k(e,255),r=k(r,255);var n,a,i=I(t,e,r),s=D(t,e,r),o=i,l=i-s;if(a=0===i?0:l/i,i==s)n=0;else{switch(i){case t:n=(e-r)/l+(r>e?6:0);break;case e:n=(r-t)/l+2;break;case r:n=(t-e)/l+4}n/=6}return{h:n,s:a,v:o}}function i(t,e,r){t=6*k(t,360),e=k(e,100),r=k(r,100);var n=j.floor(t),a=t-n,i=r*(1-e),s=r*(1-a*e),o=r*(1-(1-a)*e),l=n%6,c=[r,s,i,i,o,r][l],f=[o,r,r,s,i,i][l],u=[i,i,o,r,r,s][l];return{r:255*c,g:255*f,b:255*u}}function s(t,e,r,n){var a=[M(q(t).toString(16)),M(q(e).toString(16)),M(q(r).toString(16))];return n&&a[0].charAt(0)==a[0].charAt(1)&&a[1].charAt(0)==a[1].charAt(1)&&a[2].charAt(0)==a[2].charAt(1)?a[0].charAt(0)+a[1].charAt(0)+a[2].charAt(0):a.join("")}function o(t,e,r,n){var a=[M(H(n)),M(q(t).toString(16)),M(q(e).toString(16)),M(q(r).toString(16))];return a.join("")}function l(t,e){e=0===e?0:e||10;var r=B(t).toHsl();return r.s-=e/100,r.s=S(r.s),B(r)}function c(t,e){e=0===e?0:e||10;var r=B(t).toHsl();return r.s+=e/100,r.s=S(r.s),B(r)}function f(t){return B(t).desaturate(100)}function u(t,e){e=0===e?0:e||10;var r=B(t).toHsl();return r.l+=e/100,r.l=S(r.l),B(r)}function h(t,e){e=0===e?0:e||10;var r=B(t).toRgb();return r.r=I(0,D(255,r.r-q(255*-(e/100)))),r.g=I(0,D(255,r.g-q(255*-(e/100)))),r.b=I(0,D(255,r.b-q(255*-(e/100)))),B(r)}function d(t,e){e=0===e?0:e||10;var r=B(t).toHsl();return r.l-=e/100,r.l=S(r.l),B(r)}function p(t,e){var r=B(t).toHsl(),n=(q(r.h)+e)%360;return r.h=0>n?360+n:n,B(r)}function g(t){var e=B(t).toHsl();return e.h=(e.h+180)%360,B(e)}function b(t){var e=B(t).toHsl(),r=e.h;return[B(t),B({h:(r+120)%360,s:e.s,l:e.l}),B({h:(r+240)%360,s:e.s,l:e.l})]}function v(t){var e=B(t).toHsl(),r=e.h;return[B(t),B({h:(r+90)%360,s:e.s,l:e.l}),B({h:(r+180)%360,s:e.s,l:e.l}),B({h:(r+270)%360,s:e.s,l:e.l})]}function m(t){var e=B(t).toHsl(),r=e.h;return[B(t),B({h:(r+72)%360,s:e.s,l:e.l}),B({h:(r+216)%360,s:e.s,l:e.l})]}function y(t,e,r){e=e||6,r=r||30;var n=B(t).toHsl(),a=360/r,i=[B(t)];for(n.h=(n.h-(a*e>>1)+720)%360;--e;)n.h=(n.h+a)%360,i.push(B(n));return i}function w(t,e){e=e||6;for(var r=B(t).toHsv(),n=r.h,a=r.s,i=r.v,s=[],o=1/e;e--;)s.push(B({h:n,s:a,v:i})),i=(i+o)%1;return s}function _(t){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[t[r]]=r);return e}function x(t){return t=parseFloat(t),(isNaN(t)||0>t||t>1)&&(t=1),t}function k(t,e){P(t)&&(t="100%");var r=A(t);return t=D(e,I(0,parseFloat(t))),r&&(t=parseInt(t*e,10)/100),j.abs(t-e)<1e-6?1:t%e/parseFloat(e)}function S(t){return D(1,I(0,t))}function C(t){return parseInt(t,16)}function P(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)}function A(t){return"string"==typeof t&&-1!=t.indexOf("%")}function M(t){return 1==t.length?"0"+t:""+t}function R(t){return 1>=t&&(t=100*t+"%"),t}function H(t){return Math.round(255*parseFloat(t)).toString(16)}function T(t){return C(t)/255}function F(t){t=t.replace(O,"").replace(N,"").toLowerCase();var e=!1;if(L[t])t=L[t],e=!0;else if("transparent"==t)return{r:0,g:0,b:0,a:0,format:"name"};var r;return(r=V.rgb.exec(t))?{r:r[1],g:r[2],b:r[3]}:(r=V.rgba.exec(t))?{r:r[1],g:r[2],b:r[3],a:r[4]}:(r=V.hsl.exec(t))?{h:r[1],s:r[2],l:r[3]}:(r=V.hsla.exec(t))?{h:r[1],s:r[2],l:r[3],a:r[4]}:(r=V.hsv.exec(t))?{h:r[1],s:r[2],v:r[3]}:(r=V.hsva.exec(t))?{h:r[1],s:r[2],v:r[3],a:r[4]}:(r=V.hex8.exec(t))?{a:T(r[1]),r:C(r[2]),g:C(r[3]),b:C(r[4]),format:e?"name":"hex8"}:(r=V.hex6.exec(t))?{r:C(r[1]),g:C(r[2]),b:C(r[3]),format:e?"name":"hex"}:(r=V.hex3.exec(t))?{r:C(r[1]+""+r[1]),g:C(r[2]+""+r[2]),b:C(r[3]+""+r[3]),format:e?"name":"hex"}:!1}var O=/^[\s,#]+/,N=/\s+$/,E=0,j=Math,q=j.round,D=j.min,I=j.max,z=j.random,B=function(e,r){if(e=e?e:"",r=r||{},e instanceof B)return e;if(!(this instanceof B))return new B(e,r);var n=t(e);this._originalInput=e,this._r=n.r,this._g=n.g,this._b=n.b,this._a=n.a,this._roundA=q(100*this._a)/100,this._format=r.format||n.format,this._gradientType=r.gradientType,this._r<1&&(this._r=q(this._r)),this._g<1&&(this._g=q(this._g)),this._b<1&&(this._b=q(this._b)),this._ok=n.ok,this._tc_id=E++};B.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},setAlpha:function(t){return this._a=x(t),this._roundA=q(100*this._a)/100,this},toHsv:function(){var t=a(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=a(this._r,this._g,this._b),e=q(360*t.h),r=q(100*t.s),n=q(100*t.v);return 1==this._a?"hsv("+e+", "+r+"%, "+n+"%)":"hsva("+e+", "+r+"%, "+n+"%, "+this._roundA+")"},toHsl:function(){var t=r(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=r(this._r,this._g,this._b),e=q(360*t.h),n=q(100*t.s),a=q(100*t.l);return 1==this._a?"hsl("+e+", "+n+"%, "+a+"%)":"hsla("+e+", "+n+"%, "+a+"%, "+this._roundA+")"},toHex:function(t){return s(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(){return o(this._r,this._g,this._b,this._a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:q(this._r),g:q(this._g),b:q(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+q(this._r)+", "+q(this._g)+", "+q(this._b)+")":"rgba("+q(this._r)+", "+q(this._g)+", "+q(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:q(100*k(this._r,255))+"%",g:q(100*k(this._g,255))+"%",b:q(100*k(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+q(100*k(this._r,255))+"%, "+q(100*k(this._g,255))+"%, "+q(100*k(this._b,255))+"%)":"rgba("+q(100*k(this._r,255))+"%, "+q(100*k(this._g,255))+"%, "+q(100*k(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":this._a<1?!1:K[s(this._r,this._g,this._b,!0)]||!1},toFilter:function(t){var e="#"+o(this._r,this._g,this._b,this._a),r=e,n=this._gradientType?"GradientType = 1, ":"";if(t){var a=B(t);r=a.toHex8String()}return"progid:DXImageTransform.Microsoft.gradient("+n+"startColorstr="+e+",endColorstr="+r+")"},toString:function(t){var e=!!t;t=t||this._format;var r=!1,n=this._a<1&&this._a>=0,a=!e&&n&&("hex"===t||"hex6"===t||"hex3"===t||"name"===t);return a?"name"===t&&0===this._a?this.toName():this.toRgbString():("rgb"===t&&(r=this.toRgbString()),"prgb"===t&&(r=this.toPercentageRgbString()),("hex"===t||"hex6"===t)&&(r=this.toHexString()),"hex3"===t&&(r=this.toHexString(!0)),"hex8"===t&&(r=this.toHex8String()),"name"===t&&(r=this.toName()),"hsl"===t&&(r=this.toHslString()),"hsv"===t&&(r=this.toHsvString()),r||this.toHexString())},_applyModification:function(t,e){var r=t.apply(null,[this].concat([].slice.call(e)));return this._r=r._r,this._g=r._g,this._b=r._b,this.setAlpha(r._a),this},lighten:function(){return this._applyModification(u,arguments)},brighten:function(){return this._applyModification(h,arguments)},darken:function(){return this._applyModification(d,arguments)},desaturate:function(){return this._applyModification(l,arguments)},saturate:function(){return this._applyModification(c,arguments)},greyscale:function(){return this._applyModification(f,arguments)},spin:function(){return this._applyModification(p,arguments)},_applyCombination:function(t,e){return t.apply(null,[this].concat([].slice.call(e)))},analogous:function(){return this._applyCombination(y,arguments)},complement:function(){return this._applyCombination(g,arguments)},monochromatic:function(){return this._applyCombination(w,arguments)},splitcomplement:function(){return this._applyCombination(m,arguments)},triad:function(){return this._applyCombination(b,arguments)},tetrad:function(){return this._applyCombination(v,arguments)}},B.fromRatio=function(t,e){if("object"==typeof t){var r={};for(var n in t)t.hasOwnProperty(n)&&(r[n]="a"===n?t[n]:R(t[n]));t=r}return B(t,e)},B.equals=function(t,e){return t&&e?B(t).toRgbString()==B(e).toRgbString():!1},B.random=function(){return B.fromRatio({r:z(),g:z(),b:z()})},B.mix=function(t,e,r){r=0===r?0:r||50;var n,a=B(t).toRgb(),i=B(e).toRgb(),s=r/100,o=2*s-1,l=i.a-a.a;n=o*l==-1?o:(o+l)/(1+o*l),n=(n+1)/2;var c=1-n,f={r:i.r*n+a.r*c,g:i.g*n+a.g*c,b:i.b*n+a.b*c,a:i.a*s+a.a*(1-s)};return B(f)},B.readability=function(t,e){var r=B(t),n=B(e),a=r.toRgb(),i=n.toRgb(),s=r.getBrightness(),o=n.getBrightness(),l=Math.max(a.r,i.r)-Math.min(a.r,i.r)+Math.max(a.g,i.g)-Math.min(a.g,i.g)+Math.max(a.b,i.b)-Math.min(a.b,i.b);return{brightness:Math.abs(s-o),color:l}},B.isReadable=function(t,e){var r=B.readability(t,e);return r.brightness>125&&r.color>500},B.mostReadable=function(t,e){for(var r=null,n=0,a=!1,i=0;i<e.length;i++){var s=B.readability(t,e[i]),o=s.brightness>125&&s.color>500,l=3*(s.brightness/125)+s.color/500;(o&&!a||o&&a&&l>n||!o&&!a&&l>n)&&(a=o,n=l,r=B(e[i]))}return r};var L=B.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},K=B.hexNames=_(L),V=function(){var t="[-\\+]?\\d+%?",e="[-\\+]?\\d*\\.\\d+%?",r="(?:"+e+")|(?:"+t+")",n="[\\s|\\(]+("+r+")[,|\\s]+("+r+")[,|\\s]+("+r+")\\s*\\)?",a="[\\s|\\(]+("+r+")[,|\\s]+("+r+")[,|\\s]+("+r+")[,|\\s]+("+r+")\\s*\\)?";return{rgb:new RegExp("rgb"+n),rgba:new RegExp("rgba"+a),hsl:new RegExp("hsl"+n),hsla:new RegExp("hsla"+a),hsv:new RegExp("hsv"+n),hsva:new RegExp("hsva"+a),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();window.tinycolor=B}(),t(function(){t.fn.spectrum.load&&t.fn.spectrum.processNativeColorInputs()})});
//#////////#//
//# OPENFB #//
//#////////#//
if(typeof openFB === 'undefined') { 
	var openFB = '';
}
openFB=function(){function e(e){if(!e.appId)throw"appId parameter not set in init()";u=e.appId,e.tokenStore&&(k=e.tokenStore),e.accessToken&&(k.fbAccessToken=e.accessToken),f=e.loginURL||f,h=e.logoutURL||h,v=e.oauthRedirectURL||v,w=e.cordovaOAuthRedirectURL||w,g=e.logoutRedirectURL||g}function o(e){var o=k.fbAccessToken,t={};o?(t.status="connected",t.authResponse={accessToken:o}):t.status="unknown",e&&e(t)}function t(e,o){function t(e){var o=e.url;if(o.indexOf("access_token=")>0||o.indexOf("error=")>0){var t=600-((new Date).getTime()-r);setTimeout(function(){c.close()},t>0?t:0),n(o)}}function s(){console.log("exit and remove listeners"),d&&!p&&d({status:"user_cancelled"}),c.removeEventListener("loadstop",loginWindow_loadStopHandler),c.removeEventListener("exit",s),c=null,console.log("done removing listeners")}var c,r,a="",i=l?w:v;return u?(o&&o.scope&&(a=o.scope),d=e,p=!1,r=(new Date).getTime(),c=window.open(f+"?client_id="+u+"&redirect_uri="+i+"&response_type=token&scope="+a,"_blank","location=no,clearcache=yes"),void(l&&(c.addEventListener("loadstart",t),c.addEventListener("exit",s)))):e({status:"unknown",error:"Facebook App Id not set."})}function n(e){var o,t;p=!0,e.indexOf("access_token=")>0?(o=e.substr(e.indexOf("#")+1),t=a(o),k.fbAccessToken=t.access_token,d&&d({status:"connected",authResponse:{accessToken:t.access_token}})):e.indexOf("error=")>0?(o=e.substring(e.indexOf("?")+1,e.indexOf("#")),t=a(o),d&&d({status:"not_authorized",error:t.error})):d&&d({status:"not_authorized"})}function s(e){var o,t=k.fbAccessToken;k.removeItem("fbAccessToken"),t&&(o=window.open(h+"?access_token="+t+"&next="+g,"_blank","location=no,clearcache=yes"),l&&setTimeout(function(){o.close()},700)),e&&e()}function c(e){var o,t=e.method||"GET",n=e.params||{},s=new XMLHttpRequest;n.access_token=k.fbAccessToken,o="https://graph.facebook.com"+e.path+"?"+i(n),s.onreadystatechange=function(){if(4===s.readyState)if(200===s.status)e.success&&e.success(JSON.parse(s.responseText));else{var o=s.responseText?JSON.parse(s.responseText).error:{message:"An error has occurred"};e.error&&e.error(o)}},s.open(t,o,!0),s.send()}function r(e,o){return c({method:"DELETE",path:"/me/permissions",success:function(){e()},error:o})}function a(e){var o=decodeURIComponent(e),t={},n=o.split("&");return n.forEach(function(e){var o=e.split("=");t[o[0]]=o[1]}),t}function i(e){var o=[];for(var t in e)e.hasOwnProperty(t)&&o.push(encodeURIComponent(t)+"="+encodeURIComponent(e[t]));return o.join("&")}var u,d,l,p,f="https://www.facebook.com/dialog/oauth",h="https://www.facebook.com/logout.php",k=window.sessionStorage,m=window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")),v=(location.protocol+"//"+location.hostname+(location.port?":"+location.port:"")+m,"https://kcals.net/oauthcallback.html"),w="https://www.facebook.com/connect/login_success.html",g="https://kcals.net/logoutcallback.html";return document.addEventListener("deviceready",function(){l=!0},!1),{init:e,login:t,logout:s,revokePermissions:r,api:c,oauthCallback:n,getLoginStatus:o}}();//#//////////////////////#//
//# JQUERY MOBILE EVENTS #//
//#//////////////////////#//
/*
!function(e){function t(){var e=c();e!==r&&(r=e,l.trigger("orientationchange"))}function a(t,a,n,o){var i=n.type;n.type=a,e.event.dispatch.call(t,n,o),n.type=i}e.attrFn=e.attrFn||{};var n=navigator.userAgent.toLowerCase(),o=n.indexOf("chrome")>-1&&(n.indexOf("windows")>-1||n.indexOf("macintosh")>-1||n.indexOf("linux")>-1)&&n.indexOf("mobile")<0&&n.indexOf("android")<0,i={tap_pixel_range:5,swipe_h_threshold:50,swipe_v_threshold:50,taphold_threshold:750,doubletap_int:500,touch_capable:window.navigator.msPointerEnabled?!1:"ontouchstart"in window&&!o,orientation_support:"orientation"in window&&"onorientationchange"in window,startevent:window.navigator.msPointerEnabled?"MSPointerDown":"ontouchstart"in window&&!o?"touchstart":"mousedown",endevent:window.navigator.msPointerEnabled?"MSPointerUp":"ontouchstart"in window&&!o?"touchend":"mouseup",moveevent:window.navigator.msPointerEnabled?"MSPointerMove":"ontouchstart"in window&&!o?"touchmove":"mousemove",tapevent:"ontouchstart"in window&&!o?"tap":"click",scrollevent:"ontouchstart"in window&&!o?"touchmove":"scroll",hold_timer:null,tap_timer:null};e.isTouchCapable=function(){return i.touch_capable},e.getStartEvent=function(){return i.startevent},e.getEndEvent=function(){return i.endevent},e.getMoveEvent=function(){return i.moveevent},e.getTapEvent=function(){return i.tapevent},e.getScrollEvent=function(){return i.scrollevent},e.each(["tapstart","tapend","tapmove","tap","tap2","tap3","tap4","singletap","doubletap","taphold","swipe","swipeup","swiperight","swipedown","swipeleft","swipeend","scrollstart","scrollend","orientationchange"],function(t,a){e.fn[a]=function(e){return e?this.on(a,e):this.trigger(a)},e.attrFn[a]=!0}),e.event.special.tapstart={setup:function(){var t=this,n=e(t);n.on(i.startevent,function(e){if(n.data("callee",arguments.callee),e.which&&1!==e.which)return!1;var o=e.originalEvent,s={position:{x:i.touch_capable?o.touches[0].screenX:e.screenX,y:i.touch_capable?o.touches[0].screenY:e.screenY},offset:{x:i.touch_capable?o.touches[0].pageX-o.touches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?o.touches[0].pageY-o.touches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target};return a(t,"tapstart",e,s),!0})},remove:function(){e(this).off(i.startevent,e(this).data.callee)}},e.event.special.tapmove={setup:function(){var t=this,n=e(t);n.on(i.moveevent,function(e){n.data("callee",arguments.callee);var o=e.originalEvent,s={position:{x:i.touch_capable?o.touches[0].screenX:e.screenX,y:i.touch_capable?o.touches[0].screenY:e.screenY},offset:{x:i.touch_capable?o.touches[0].pageX-o.touches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?o.touches[0].pageY-o.touches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target};return a(t,"tapmove",e,s),!0})},remove:function(){e(this).off(i.moveevent,e(this).data.callee)}},e.event.special.tapend={setup:function(){var t=this,n=e(t);n.on(i.endevent,function(e){n.data("callee",arguments.callee);var o=e.originalEvent,s={position:{x:i.touch_capable?o.changedTouches[0].screenX:e.screenX,y:i.touch_capable?o.changedTouches[0].screenY:e.screenY},offset:{x:i.touch_capable?o.changedTouches[0].pageX-o.changedTouches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?o.changedTouches[0].pageY-o.changedTouches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target};return a(t,"tapend",e,s),!0})},remove:function(){e(this).off(i.endevent,e(this).data.callee)}},e.event.special.taphold={setup:function(){var t,n=this,o=e(n),s={x:0,y:0},c=0,r=0;o.on(i.startevent,function(e){if(e.which&&1!==e.which)return!1;o.data("tapheld",!1),t=e.target;var h=e.originalEvent,u=Date.now(),l={x:i.touch_capable?h.touches[0].screenX:e.screenX,y:i.touch_capable?h.touches[0].screenY:e.screenY},p={x:i.touch_capable?h.touches[0].pageX-h.touches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?h.touches[0].pageY-h.touches[0].target.offsetTop:e.offsetY};return s.x=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageX:e.pageX,s.y=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageY:e.pageY,c=s.x,r=s.y,i.hold_timer=window.setTimeout(function(){var g=s.x-c,d=s.y-r;if(e.target==t&&(s.x==c&&s.y==r||g>=-i.tap_pixel_range&&g<=i.tap_pixel_range&&d>=-i.tap_pixel_range&&d<=i.tap_pixel_range)){o.data("tapheld",!0);var f=Date.now(),v={x:i.touch_capable?h.touches[0].screenX:e.screenX,y:i.touch_capable?h.touches[0].screenY:e.screenY},w={x:i.touch_capable?h.touches[0].pageX-h.touches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?h.touches[0].pageY-h.touches[0].target.offsetTop:e.offsetY};duration=f-u;var _={startTime:u,endTime:f,startPosition:l,startOffset:p,endPosition:v,endOffset:w,duration:duration,target:e.target};o.data("callee1",arguments.callee),a(n,"taphold",e,_)}},i.taphold_threshold),!0}).on(i.endevent,function(){o.data("callee2",arguments.callee),o.data("tapheld",!1),window.clearTimeout(i.hold_timer)}).on(i.moveevent,function(e){o.data("callee3",arguments.callee),c=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageX:e.pageX,r=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageY:e.pageY})},remove:function(){e(this).off(i.startevent,e(this).data.callee1).off(i.endevent,e(this).data.callee2).off(i.moveevent,e(this).data.callee3)}},e.event.special.doubletap={setup:function(){var t,n,o,s,c,r=this,h=e(r),u=!1;h.on(i.startevent,function(e){return e.which&&1!==e.which?!1:(h.data("doubletapped",!1),t=e.target,h.data("callee1",arguments.callee),s=e.originalEvent,o={position:{x:i.touch_capable?s.touches[0].screenX:e.screenX,y:i.touch_capable?s.touches[0].screenY:e.screenY},offset:{x:i.touch_capable?s.touches[0].pageX-s.touches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?s.touches[0].pageY-s.touches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target},!0)}).on(i.endevent,function(e){var s=Date.now(),l=h.data("lastTouch")||s+1,p=s-l;if(window.clearTimeout(n),h.data("callee2",arguments.callee),p<i.doubletap_int&&e.target==t&&p>100){h.data("doubletapped",!0),window.clearTimeout(i.tap_timer);var g={position:{x:i.touch_capable?e.originalEvent.changedTouches[0].screenX:e.screenX,y:i.touch_capable?e.originalEvent.changedTouches[0].screenY:e.screenY},offset:{x:i.touch_capable?e.originalEvent.changedTouches[0].pageX-e.originalEvent.changedTouches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?e.originalEvent.changedTouches[0].pageY-e.originalEvent.changedTouches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target},d={firstTap:o,secondTap:g,interval:g.time-o.time};u||a(r,"doubletap",e,d),u=!0,c=window.setTimeout(function(){u=!1},i.doubletap_int)}else h.data("lastTouch",s),n=window.setTimeout(function(){window.clearTimeout(n)},i.doubletap_int,[e]);h.data("lastTouch",s)})},remove:function(){e(this).off(i.startevent,e(this).data.callee1).off(i.endevent,e(this).data.callee2)}},e.event.special.singletap={setup:function(){var t=this,n=e(t),o=null,s=null,c={x:0,y:0};n.on(i.startevent,function(e){return e.which&&1!==e.which?!1:(s=Date.now(),o=e.target,n.data("callee1",arguments.callee),c.x=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageX:e.pageX,c.y=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageY:e.pageY,!0)}).on(i.endevent,function(e){n.data("callee2",arguments.callee),e.target==o&&(end_pos_x=e.originalEvent.changedTouches?e.originalEvent.changedTouches[0].pageX:e.pageX,end_pos_y=e.originalEvent.changedTouches?e.originalEvent.changedTouches[0].pageY:e.pageY,i.tap_timer=window.setTimeout(function(){if(!n.data("doubletapped")&&!n.data("tapheld")&&c.x==end_pos_x&&c.y==end_pos_y){var o=e.originalEvent,r={position:{x:i.touch_capable?o.changedTouches[0].screenX:e.screenX,y:i.touch_capable?o.changedTouches[0].screenY:e.screenY},offset:{x:i.touch_capable?o.changedTouches[0].pageX-o.changedTouches[0].target.offsetLeft:e.offsetX,y:i.touch_capable?o.changedTouches[0].pageY-o.changedTouches[0].target.offsetTop:e.offsetY},time:Date.now(),target:e.target};r.time-s<i.taphold_threshold&&a(t,"singletap",e,r)}},i.doubletap_int))})},remove:function(){e(this).off(i.startevent,e(this).data.callee1).off(i.endevent,e(this).data.callee2)}},e.event.special.tap={setup:function(){var t,n,o=this,s=e(o),c=!1,r=null,h={x:0,y:0};s.on(i.startevent,function(e){return s.data("callee1",arguments.callee),e.which&&1!==e.which?!1:(c=!0,h.x=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageX:e.pageX,h.y=e.originalEvent.targetTouches?e.originalEvent.targetTouches[0].pageY:e.pageY,t=Date.now(),r=e.target,n=e.originalEvent.targetTouches?e.originalEvent.targetTouches:[e],!0)}).on(i.endevent,function(e){s.data("callee2",arguments.callee);var u,l=e.originalEvent.targetTouches?e.originalEvent.changedTouches[0].pageX:e.pageX,p=e.originalEvent.targetTouches?e.originalEvent.changedTouches[0].pageY:e.pageY,g=h.x-l,d=h.y-p;if(r==e.target&&c&&Date.now()-t<i.taphold_threshold&&(h.x==l&&h.y==p||g>=-i.tap_pixel_range&&g<=i.tap_pixel_range&&d>=-i.tap_pixel_range&&d<=i.tap_pixel_range)){for(var f=e.originalEvent,v=[],w=0;w<n.length;w++){var _={position:{x:i.touch_capable?f.changedTouches[w].screenX:e.screenX,y:i.touch_capable?f.changedTouches[w].screenY:e.screenY},offset:{x:i.touch_capable?f.changedTouches[w].pageX-f.changedTouches[w].target.offsetLeft:e.offsetX,y:i.touch_capable?f.changedTouches[w].pageY-f.changedTouches[w].target.offsetTop:e.offsetY},time:Date.now(),target:e.target};v.push(_)}switch(n.length){case 1:u="tap";break;case 2:u="tap2";break;case 3:u="tap3";break;case 4:u="tap4"}a(o,u,e,v)}})},remove:function(){e(this).off(i.startevent,e(this).data.callee1).off(i.endevent,e(this).data.callee2)}},e.event.special.swipe={setup:function(){function t(t){c=e(t.currentTarget),c.data("callee1",arguments.callee),u.x=t.originalEvent.targetTouches?t.originalEvent.targetTouches[0].pageX:t.pageX,u.y=t.originalEvent.targetTouches?t.originalEvent.targetTouches[0].pageY:t.pageY,l.x=u.x,l.y=u.y,r=!0;var a=t.originalEvent;o={position:{x:i.touch_capable?a.touches[0].screenX:t.screenX,y:i.touch_capable?a.touches[0].screenY:t.screenY},offset:{x:i.touch_capable?a.touches[0].pageX-a.touches[0].target.offsetLeft:t.offsetX,y:i.touch_capable?a.touches[0].pageY-a.touches[0].target.offsetTop:t.offsetY},time:Date.now(),target:t.target}}function a(t){c=e(t.currentTarget),c.data("callee2",arguments.callee),l.x=t.originalEvent.targetTouches?t.originalEvent.targetTouches[0].pageX:t.pageX,l.y=t.originalEvent.targetTouches?t.originalEvent.targetTouches[0].pageY:t.pageY;var a,n=c.parent().data("xthreshold")?c.parent().data("xthreshold"):c.data("xthreshold"),s=c.parent().data("ythreshold")?c.parent().data("ythreshold"):c.data("ythreshold"),p="undefined"!=typeof n&&n!==!1&&parseInt(n)?parseInt(n):i.swipe_h_threshold,g="undefined"!=typeof s&&s!==!1&&parseInt(s)?parseInt(s):i.swipe_v_threshold;if(u.y>l.y&&u.y-l.y>g&&(a="swipeup"),u.x<l.x&&l.x-u.x>p&&(a="swiperight"),u.y<l.y&&l.y-u.y>g&&(a="swipedown"),u.x>l.x&&u.x-l.x>p&&(a="swipeleft"),void 0!=a&&r){u.x=0,u.y=0,l.x=0,l.y=0,r=!1;var d=t.originalEvent;endEvnt={position:{x:i.touch_capable?d.touches[0].screenX:t.screenX,y:i.touch_capable?d.touches[0].screenY:t.screenY},offset:{x:i.touch_capable?d.touches[0].pageX-d.touches[0].target.offsetLeft:t.offsetX,y:i.touch_capable?d.touches[0].pageY-d.touches[0].target.offsetTop:t.offsetY},time:Date.now(),target:t.target};var f=Math.abs(o.position.x-endEvnt.position.x),v=Math.abs(o.position.y-endEvnt.position.y),w={startEvnt:o,endEvnt:endEvnt,direction:a.replace("swipe",""),xAmount:f,yAmount:v,duration:endEvnt.time-o.time};h=!0,c.trigger("swipe",w).trigger(a,w)}}function n(t){c=e(t.currentTarget);var a="";if(c.data("callee3",arguments.callee),h){var n=c.data("xthreshold"),s=c.data("ythreshold"),u="undefined"!=typeof n&&n!==!1&&parseInt(n)?parseInt(n):i.swipe_h_threshold,l="undefined"!=typeof s&&s!==!1&&parseInt(s)?parseInt(s):i.swipe_v_threshold,p=t.originalEvent;endEvnt={position:{x:i.touch_capable?p.changedTouches[0].screenX:t.screenX,y:i.touch_capable?p.changedTouches[0].screenY:t.screenY},offset:{x:i.touch_capable?p.changedTouches[0].pageX-p.changedTouches[0].target.offsetLeft:t.offsetX,y:i.touch_capable?p.changedTouches[0].pageY-p.changedTouches[0].target.offsetTop:t.offsetY},time:Date.now(),target:t.target},o.position.y>endEvnt.position.y&&o.position.y-endEvnt.position.y>l&&(a="swipeup"),o.position.x<endEvnt.position.x&&endEvnt.position.x-o.position.x>u&&(a="swiperight"),o.position.y<endEvnt.position.y&&endEvnt.position.y-o.position.y>l&&(a="swipedown"),o.position.x>endEvnt.position.x&&o.position.x-endEvnt.position.x>u&&(a="swipeleft");var g=Math.abs(o.position.x-endEvnt.position.x),d=Math.abs(o.position.y-endEvnt.position.y),f={startEvnt:o,endEvnt:endEvnt,direction:a.replace("swipe",""),xAmount:g,yAmount:d,duration:endEvnt.time-o.time};c.trigger("swipeend",f)}r=!1,h=!1}var o,s=this,c=e(s),r=!1,h=!1,u={x:0,y:0},l={x:0,y:0};c.on(i.startevent,t),c.on(i.moveevent,a),c.on(i.endevent,n)},remove:function(){e(this).off(i.startevent,e(this).data.callee1).off(i.moveevent,e(this).data.callee2).off(i.endevent,e(this).data.callee3)}},e.event.special.scrollstart={setup:function(){function t(e,t){n=t,a(s,n?"scrollstart":"scrollend",e)}var n,o,s=this,c=e(s);c.on(i.scrollevent,function(e){c.data("callee",arguments.callee),n||t(e,!0),clearTimeout(o),o=setTimeout(function(){t(e,!1)},50)})},remove:function(){e(this).off(i.scrollevent,e(this).data.callee)}};var s,c,r,h,u,l=e(window),p={0:!0,180:!0};if(i.orientation_support){var g=window.innerWidth||l.width(),d=window.innerHeight||l.height(),f=50;h=g>d&&g-d>f,u=p[window.orientation],(h&&u||!h&&!u)&&(p={"-90":!0,90:!0})}e.event.special.orientationchange=s={setup:function(){return i.orientation_support?!1:(r=c(),l.on("throttledresize",t),!0)},teardown:function(){return i.orientation_support?!1:(l.off("throttledresize",t),!0)},add:function(e){var t=e.handler;e.handler=function(e){return e.orientation=c(),t.apply(this,arguments)}}},e.event.special.orientationchange.orientation=c=function(){var e=!0,t=document.documentElement;return e=i.orientation_support?p[window.orientation]:t&&t.clientWidth/t.clientHeight<1.1,e?"portrait":"landscape"},e.event.special.throttledresize={setup:function(){e(this).on("resize",m)},teardown:function(){e(this).off("resize",m)}};var v,w,_,T=250,m=function(){w=Date.now(),_=w-x,_>=T?(x=w,e(this).trigger("throttledresize")):(v&&window.clearTimeout(v),v=window.setTimeout(t,T-_))},x=0;e.each({scrollend:"scrollstart",swipeup:"swipe",swiperight:"swipe",swipedown:"swipe",swipeleft:"swipe",swipeend:"swipe",tap2:"tap"},function(t,a){e.event.special[t]={setup:function(){e(this).on(a,e.noop)}}})}(jQuery);
*/
