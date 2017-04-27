﻿//#/////////////////#//
//# CALCULATE WATER #//
//#/////////////////#//
app.calculateWater = function () {
	'use strict';
	/////////////////
	// DEFINE BASE // 
	///////////////// 30~35ml/kg
	app.define('waterConsumed', 0);
	app.define('waterLastDay',app.today());
	//app.define('dailyWaterIntake',2000);
	//TO KG
	var weight = app.read('calcForm#pA3B');
	if (!app.read('calcForm#pA3C', 'kilograms')) {
		weight = Math.round(weight * 0.454);
	}
	//SAVE PER KG CALCULATION
	var dailyWaterIntake = Math.round(weight * 35);
	
	//CHECK OVERRIDE
	if(app.read('override_water','on')) {
		dailyWaterIntake = app.read('override_water_value');
	}
	
	//SAVE
	app.save('dailyWaterIntake', dailyWaterIntake);

	updateNutriRatio();

	//NOTHING TO UPDATE
	if (app.read('waterConsumed') == 0) {
		//update empty water after start		
		//$('#appStatusBarsWot div').html2(app.read('dailyWaterIntake') + '' + LANG.ML[lang] );
		//ZERO on the middle percent value
		$('#appStatusBarsWat span').html2('0%');
		//RESET BAR CSS (NEW DAY)
		$('#appStatusBarsWat p').css2('width','0%');
		return;
	}
	////////////////
	// UPDATE DOM //
	////////////////
	var waterConsumed = app.read('waterConsumed');
	//FILL MINIBAR
	//$('#appStatusBarsWot p').html2(LANG.WATER[lang].toUpperCase());
	//$('#appStatusBarsWot div').html2(waterConsumed + ' / ' + dailyWaterIntake + ' ' + LANG.ML[lang]);
	//FULL BAR
	$('#appStatusBarsWat p').html2(LANG.WATER[lang].toUpperCase() + ' (' + waterConsumed + '' + LANG.ML[lang] + ')');
	//PERCENT VALUE
	var waterPercent = Math.round((waterConsumed / dailyWaterIntake) * 100);
	//CENTER PERCENT
	$('#appStatusBarsWat span').html2(waterPercent + '%');
	$('#appStatusBarsWat p').css2('width',(waterPercent > 100 ? 100 : waterPercent) + '%');
	if(waterPercent > 100) {
		$('#appStatusBarsWat p').addClass('over');
	} else {
		$('#appStatusBarsWat p').removeClass('over');
	}
};
//##//////////////////##//
//## GetWeightTracker ##//
//##//////////////////##//
var buildTracker;
function getWeightTracker() {
	'use strict';
	var measureUnit = app.read('calcForm#pA3C','pounds') ? LANG.LB[lang] : LANG.KG[lang];
	//tokg
	//totalWeight = Math.round(totalWeight) / (2.2));
	/////////////////////
	// DATA PROCESSING //
	/////////////////////
	var day = 24*60*60*1000;
	var currWeight = parseInt($('#pA3B').val());
	//new Date(1474855200000);
	//new Date(app.read('config_start_time'));
	var initVal = app.now() - day < app.read('config_start_time') ? app.now() - day : app.read('config_start_time');
	//
	//alert(app.read('weight_tracker','','object')[0][1]);
	//alert(new Date(app.read('weight_tracker')));
	//INITIAL DATAFILL
	//app.remove('weight_tracker');
	app.define('weight_tracker',[[toTime(toDate(app.now())),currWeight]],'object');
	var weightData = app.read('weight_tracker','','object').sort();
	//////////////////////
	// FIND LOWEST TIME //
	//////////////////////
	var lowestTime = toTime(toDate(app.now() - day));
	//
	$.each(weightData,function(key,value) {
		if(value[0] < lowestTime) {
			lowestTime = value[0];
		}
	});
	//////////////
	// HANDLERS //
	//////////////
	var appTrackerHandlers = function () {	
		/////////////////////////////
		// FULL-COMPACT CONTROLLER //
		/////////////////////////////			
		if(!document.getElementById('chartWidth')) {
			$('#newWindowWrapper').append2('<div id="chartToggle">•—•—•</div>');
		}
		//TOGGLE full/compact
		app.define('weight_chart','full');
		var chartFull = app.read('weight_chart','full') ? true : false;
		if(chartFull === true) { $('#chartToggle').addClass('active'); }
		//
		$('#chartToggle').on(tap,function() {
			if(!$('#chartToggle').hasClass('active')) {
				//FULL
				app.save('weight_chart','full');	
				$('#chartToggle').addClass('active');
				chartFull = true;
				//SHOW
				$('#newWindow').getNiceScroll().show();
			} else {
				//COMPACT
				app.save('weight_chart','base');	
				$('#chartToggle').removeClass('active');
				chartFull = false;
				//HIDE
				$('#newWindow').getNiceScroll().hide();
				//fix flicker
				buildTracker();
			}
			//UPDATE CHART
			setTimeout(function() {
				buildTracker();
				//force resize on not scrollable
				setTimeout(function() {
					if($.nicescroll) {
						$('#newWindow').getNiceScroll().resize();
					}
				},300);
			}, 100);
		});
		//add plus icon
		$('#saveButton').html2('');
		$('#saveButton').addClass('getAdd');
		///////////////////
		// APPEND EDITOR //
		///////////////////
		$('#saveButton').on(tap,function() {
			if(document.getElementById('appTrackerEditWrapper')) {
				app.handlers.fade(0, '#appTrackerEditWrapper', 300);
				return;
			}
			$('#newWindowWrapper').append2('\
			<div id="appTrackerEditWrapper">\
				<div id="appTrackerInputWrapper">\
					<span>' + measureUnit + '</span>\
					<input id="appTrackerEditInput" type="text" value="' + currWeight + '" />\
					<div id="appTrackerInputDateWrapper"><input type="text" id="appTrackerInputDate"></div>\
				</div>\
				<div id="appTrackerButtonWrapper">\
					<div id="appTrackerButtonDelete">' + LANG.DELETE[lang] + '</div>\
					<div id="appTrackerButtonCancel">' + LANG.CANCEL[lang] + '</div>\
					<div id="appTrackerButtonSave">'   + LANG.SAVE[lang]   + '</div>\
				</div>\
			</div>');		
			/////////////
			// ADD +/- //
			/////////////
			app.handlers.addRemove('#appTrackerEditInput',1,999,'dec');
			/////////////
			// BUTTONS //
			/////////////
			//CANCEL
			$('#appTrackerButtonCancel').on(tap,function(evt) {
				//evt.stopPropagation();
				evt.preventDefault();
				app.handlers.fade(0,'#appTrackerEditWrapper', 300);
			});
			//////////
			// SAVE //
			//////////
			$('#appTrackerButtonSave').on(tap,function(evt) {
				//evt.stopPropagation();
				evt.preventDefault();
				weightData = app.read('weight_tracker','','object').sort();
				var weightInput = parseFloat($('#appTrackerEditInput').val());
				var dateInput   = toTime($('#appTrackerInputDate').val());
				//////////////////
				// UPDATE ARRAY //
				//////////////////
				if(!weightData.contains(dateInput)) {
					//insert new
					weightData.push([dateInput,weightInput]);
				} else {
					//loop
					$.each(weightData,function(key,value) {
						//update
						if(typeof value !== 'undefined') {
							if(value[0] == dateInput) {
								weightData[key] = [dateInput,weightInput];
							}
						}
					});
				}
				//SAVE
				app.save('weight_tracker',weightData.sort(),'object');
				//FADE EDITOR
				app.handlers.fade(0,'#appTrackerEditWrapper', 300);
				//UPDATE CHART
				buildTracker();		
			});
			////////////
			// DELETE //
			////////////
			$('#appTrackerButtonDelete').on(tap,function(evt) {
				//evt.stopPropagation();
				evt.preventDefault();
				var weightInput = parseInt($('#appTrackerEditInput').val());
				var dateInput = toTime($('#appTrackerInputDate').val());
				//loop
				if(weightData.length > 1 && $('#appTrackerInputDate').val() != toDate(app.now())) {
					var tempData = [];
					$.each(weightData, function(key,value) {
						//update
						if(typeof value !== 'undefined') {
							if(value[0] === dateInput) {
								//delete weightData[key];
							} else {
								tempData.push([value[0],value][1]);
							}
						}
					});
					//////////
					// SAVE //
					//////////
					app.save('weight_tracker',tempData,'object');
				}
				//FADE EDITOR
				app.handlers.fade(0,'#appTrackerEditWrapper', 300);
				//UPDATE CHART
				buildTracker();
			});			
			////////////////////////////
			// READ EXISTING ONCHANGE //
			////////////////////////////
			$('#appTrackerInputDate').on('change',function(evt) {
				weightData = app.read('weight_tracker','','object').sort();
				var dateInput = toTime($('#appTrackerInputDate').val());				
				$.each(weightData, function(key,value) {
					//update match
					if(typeof value !== 'undefined') {
						if(typeof value[0] !== 'undefined') {						
							if(value[0] == dateInput) {
								$('#appTrackerEditInput').val(value[1]);
							}
						}
					}
				});	
			});
			/////////////////
			// DATE PICKER //
			/////////////////
			$('#appTrackerInputDate').mobiscroll().date({
				preset: 'datetime',
				minDate: new Date(initVal - day * 10),
				maxDate: new Date(),
				theme: 'ios7',
				lang: 'en',
				dateFormat: 'yyyy/mm/dd',
				dateOrder:  'dd MM yy',
				timeWheels: 'HH:ii',
			    timeFormat: 'HH:ii',
				setText: LANG.OK[lang].capitalize(),
				closeText: LANG.CANCEL[lang].capitalize(),
				cancelText: LANG.CANCEL[lang].capitalize(),
				dayText: LANG.DAY[lang].capitalize(),
				monthText: LANG.MONTH[lang].capitalize(),
				yearText: LANG.YEAR[lang].capitalize(),
				hourText: LANG.HOURS[lang].capitalize(),
				minuteText: LANG.MINUTES[lang].capitalize(),
				display: 'modal',
				stepMinute: 1,
				animate: 'none',
				monthNames: LANG.MONTH_SHORT[lang].split(', '),
				monthNamesShort: LANG.MONTH_SHORT[lang].split(', '),
				mode: 'scroller',
				showLabel: true,
				useShortLabels: true
		    });
			//////////////////////
			// SET INITIAL DATE //
			//////////////////////
			$('#appTrackerInputDate').scroller('setDate',new Date(), true);
			//$('#appTrackerInputDate').html(DayUtcFormat(app.now()));
			////////////////////////
			// TRIGGER DATEPICKER //
			////////////////////////
			$('#appTrackerInputDateWrapper').on(tap,function(evt) {
				//evt.stopPropagation();
				evt.preventDefault();
				setTimeout(function() {
					$('#appTrackerInputDate').click();
				}, 100);
			});
			/////////////////
			// SHOW EDITOR //
			/////////////////	
			app.handlers.fade(1, '#appTrackerEditWrapper', 300);
		});
		//#/////////////////////////#//
		//# REBUILD HISTORY SNIPPET #//
		//#/////////////////////////#//
			buildTracker = function () {
				//##////////////////##//
				//## HIGHCHART CODE ##//
				//##////////////////##//
				Highcharts.setOptions({
					lang : {
						shortMonths : LANG.MONTH_SHORT[lang].split(', '),
						weekdays : LANG.WEEKDAY_SHORT[lang].split(', ')
					}
				});
				///////////////
				// MIN WIDTH //
				///////////////
				var minWidth = $('#appContent').width() / ((app.now() - lowestTime) / day);
				if (minWidth < 50) {
					minWidth = 50;
				}
				if (minWidth > 100) {
					minWidth = 100;
				}
				minWidth = ((app.now() - lowestTime) / day) * minWidth;
				if (minWidth < $('#appContent').width()) {
					minWidth = $('#appContent').width();
				}
				////////////////
				// STATISTICS //
				////////////////
				var heightAdjust = $('body').hasClass('android2') ? 19 : 9;
				$('#appTracker').highcharts({
					chart : {
						reflow : false,
						spacingLeft : 2,
						spacingRight : 12,
						spacingTop : 0,
						spacingBottom : 9,
						marginTop: 52,
						height : $('#newWindow').height() - heightAdjust,
						width : chartFull ? minWidth : $('#appContent').width()
					},
					credits : {
						enabled : false
					},
					legend : {
						enabled : false
					},
					title : {
						text : ''
					},
					tooltip : {
						enabled : true
					},
					subtitle : {
						text : ''
					},
					yAxis : {
						title : {
							text : measureUnit,
								style : {
									'font-size' : '16px',
									'font-weight' : 'bold'
								},
						},
						//tickPositions : [0, 7, 75],
						gridLineColor : 'rgba(0,0,0,.25)',
						gridZIndex: 4,
						gridLineDashStyle : 'longdash',
						labels : {
							enabled : true,
							align : 'left',
							x : 4,
							y : -3,
							style : {
							color: '#aaa',
							fontSize : '10px'
							},
						},
					},
					xAxis : {
           // endOnTick: true,
           // showFirstLabel: true,
            startOnTick: true,
            type : 'datetime',
						minTickInterval: 24 * 60 * 60 * 1000,
					},
					plotOptions : {
						series : {
							dataLabels : {
								enabled : chartFull ? true : false,
								style : {
									textShadow : '0 0 3px white',
									fontSize : '10px',
									color: '#cc3300',
									fontWeight: 'normal'
								},
								x : 0,
								y : -3,
							},
							marker : {
								enabled : chartFull ? true : false,
								lineWidth : 0,
								lineColor : '#317FD8',
								fillColor : '#007aff',
								states : {
									hover : {
										lineWidth : 2
									}
								}
							},
							allowPointSelect : false,
							lineWidth : 2,
							states : {
								hover : {
									lineWidth : 2
								}
							}
						}
					},
					series : [{
							type : 'area',
							name : measureUnit,
							animation : false,
							lineColor : '#007aff',
							lineWidth: 2,
							fillColor : 'rgba(0,122,255,.0)',
							data : app.read('weight_tracker','','object').sort()
						}
					]
				});
				//remove top-bottom grid lines
				//$('.highcharts-grid path:eq(3)').remove();
		    	$('.highcharts-grid path:last').remove();
				//LEFT AUTOSCROLL
				$('#newWindow').scrollLeft($('.highcharts-container','#appTracker').width());
		};
		buildTracker();
	};
	//////////
	// HTML //
	//////////
	var appTrackerHtml = '<div id="appTracker"></div>';
	//////////
	// SAVE //
	//////////
	var appTrackerSave = function() {
		return false;
	};
	/////////////////
	// CALL WINDOW //
	/////////////////
	getNewWindow('Weight Tracker',appTrackerHtml,appTrackerHandlers,appTrackerSave);	
}
//##/////////////////##//
//## GET FULLHISTORY ##//
//##/////////////////##//
var rebuildHistory;
function getFullHistory() {
	'use strict';
	var fullArray   = [];
	var oldestEntry = new Date().getTime();
	var now         = new Date().getTime();
	var day         = 60*60*24*1000;
	var week        = day*7;
	var month       = day*30;
	var months      = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var monthName   = months[new Date().getMonth()];
	var todaysTime  = Date.parse(new Date(monthName + ' ' +  new Date().getDate() + ', ' + new Date().getFullYear()));
	var globalDayArray;
	/////////////////
	// GET ENTRIES //
	/////////////////
	getEntries(function(data) {
		for(var g=0, len=data.length; g<len; g++) {
			if(parseInt(data[g].published) <= app.now()) {
				fullArray.push({ date: DayUtcFormat(parseInt(data[g].published)),val: data[g].title});
			}
			//GET OLDEST
			if(oldestEntry > parseInt(data[g].published)) {
				oldestEntry = parseInt(data[g].published);
			}
		}
		//SORT
		fullArray = fullArray.sort(function(a, b) {
			return (a.date > b.date) ? 1 : ((a.date < b.date) ? -1 : 0);
		});
		// at least a week
		if(now - oldestEntry < week) {
			oldestEntry = now - week;
		}
		//at most a month
		//if(now - oldestEntry > month) {
			//oldestEntry = now - month;
		//}
		//MORE THAN A DAY
		//if(DayUtcFormat(now) != DayUtcFormat(oldestEntry)) {
		var countBack = todaysTime;
		var dayArray  = [];
		/////////////////////
		// DAY INJECT LOOP //
		/////////////////////
		var lowestDay = 0;
		var highestDay = app.read('config_kcals_day_0') * 1.5;
		if(app.read('config_kcals_type','cyclic')) {
			if(app.read('config_kcals_day','d')) {
				highestDay = app.read('config_kcals_day_2') * 1.5;
			} else {
				highestDay = app.read('config_kcals_day_1') * 1.5;
			}
		}

		//AVERAGE
		var totalCalories = 0;
		var totalCalDays  = 0;
		//
		while(oldestEntry-(day*1) < countBack) {
			var daySum = 0;
			//dump all day data in date array
			for(var h=0, hen=fullArray.length; h<hen; h++) {
				if(fullArray[h].date == DayUtcFormat(countBack)) {
					daySum = daySum + parseInt(fullArray[h].val);
					//highest & lowest
					if(daySum > highestDay) {
						highestDay = daySum;
					}
					if(daySum < lowestDay) {
						lowestDay = daySum;
					}
					//
				}
			}
			//insert
			dayArray.push([countBack,daySum]);
			//average data
			if(daySum != 0) {
				totalCalories = totalCalories + daySum;
				totalCalDays++;
			}
			//while
			countBack = countBack - day;
		}
		//update global
		globalDayArray = dayArray;
		//GLOBAL AVERAGE
		var globalAverage = 0;
		if(totalCalDays) {
			globalAverage = Math.round(totalCalories / totalCalDays);
		}
		//////////////
		// HANDLERS //
		//////////////
		var appHistoryHandlers = function () {
			//CSS AVERAGE BUTTON
			$('#saveButton').removeClass('button');
			$('#saveButton').css2('color','#666');
			$('#saveButton').css2('width','50%');
			//$('#saveButton').css2('font-weight','normal');
			$('#saveButton').css2('text-align','right');
			$('#saveButton').css2('padding-right','4px');
			$('#saveButton').css2('text-transform','lowercase');
			$('#saveButton').css2('font-size','11px');
			$('#saveButton').html('' + globalAverage + ' / ' + LANG.DAY[lang]);
			//#/////////////////////////#//
			//# REBUILD HISTORY SNIPPET #//
			//#/////////////////////////#//
			rebuildHistory = function () {
				//#///////////////#//
				//# TICK POSITION #//
				//#///////////////#//
				//var firstTick = 0;
				//var lastTick  = app.read('config_kcals_day_0') * 1.5;
				var origTick  = app.read('config_kcals_day_0');
				/////////////////
				// CYCLIC CASE //
				/////////////////
				if(app.read('config_kcals_type','cyclic')) {
					if(app.read('config_kcals_day','d')) {
						//highestDay = app.read('config_kcals_day_2') * 1.5;
						origTick = app.read('config_kcals_day_2');
					} else {
						//highestDay = app.read('config_kcals_day_1') * 1.5;
						origTick = app.read('config_kcals_day_1');
					}
				}
				//if(lowestDay < 0)			{ lowestDay = lowestDay - (origTick/2.5); }
				//if(highestDay < 600)		{ highestDay = highestDay+600; }
				//##////////////////##//
				//## HIGHCHART CODE ##//
				//##////////////////##//
				Highcharts.setOptions({
					lang : {
						shortMonths : LANG.MONTH_SHORT[lang].split(', '),
						weekdays : LANG.WEEKDAY_SHORT[lang].split(', ')
					}
				});
				///////////////
				// MIN WIDTH //
				///////////////
				var minWidth = $('#appContent').width() / dayArray.length;
				if (minWidth < 42) {
					minWidth = 42;
				}
				if (minWidth > 100) {
					minWidth = 100;
				}
				minWidth = dayArray.length * minWidth;
				if (minWidth < $('#appContent').width()) {
					minWidth = $('#appContent').width();
				}
				////////////////
				// STATISTICS //
				////////////////
				var heightAdjust = $('body').hasClass('android2') ? 19 : 9;
				$('#appHistory').highcharts({
					chart : {
						reflow : false,
						spacingLeft : 2,
						spacingRight : 6,
						spacingTop : 0,
						spacingBottom : 9,
						height : $('#newWindow').height() - heightAdjust,
						width : minWidth
					},
					credits : {
						enabled : false
					},
					legend : {
						enabled : false
					},
					title : {
						text : ''
					},
					tooltip : {
						enabled : true
					},
					subtitle : {
						text : ''
					},
					yAxis : {
						title : {
							text : ''
						},
						tickPositions : [lowestDay, origTick, highestDay+(origTick+75)],
						gridLineColor : 'rgba(204,51,0,.66)',
						gridZIndex: 4,
						gridLineDashStyle : 'longdash',
						showFirstLabel : false,
						showLastLabel : false,
						labels : {
							enabled : false,
							align : 'left',
							x : 4,
							y : -3,
							textSize : '9px'
						},
					},
					xAxis : {
						type : 'datetime'
					},
					plotOptions : {
						series : {
							dataLabels : {
								enabled : true,
								style : {
									textShadow : '0 0 3px white',
									fontSize : '10px',
									color: '#222',
									fontWeight: 'normal'
								},
								x : 0,
								y : -3,
							},
							marker : {
								enabled : true,
								lineWidth : 2,
								lineColor : '#317FD8',
								fillColor : 'white',
								states : {
									hover : {
										lineWidth : 2
									}
								}
							},
							allowPointSelect : false,
							lineWidth : 2,
							states : {
								hover : {
									lineWidth : 2
								}
							}
						}
					},
					series : [{
							type : 'area',
							name : LANG.KCAL[lang],
							animation : false,
							lineColor : '#317FD8',
							fillColor : '#EAF3FB',
							data : dayArray.sort()
						}
					]
				});
				//remove top-bottom grid lines
				$('.highcharts-grid path:eq(3)').remove();
		    	$('.highcharts-grid path:last').remove();
				////////////////////
				// globalDayArray //
				////////////////////
				//console.log(dayFormat(Number(globalDayArray[0][0])));
				//console.log(dayFormat(Number(globalDayArray[globalDayArray.length-1][0])));
				var dateStart = dayFormat(Number(globalDayArray[0][0]));
				var dateEnd   = dayFormat(Number(globalDayArray[globalDayArray.length-1][0]));
				//
				$('#highcharts-date-start').remove();
				$('#highcharts-date-end').remove();				
				$('#appHistory .highcharts-container').append('<div id="highcharts-date-start">' + dateStart + '</div><div id="highcharts-date-end">' + dateEnd + '</div>');
				//LEFT AUTOSCROLL
				$('#newWindow').scrollLeft($('.highcharts-container','#appHistory').width());
			};
			/////////////
			// EXECUTE //
			/////////////
			rebuildHistory();
		};
		//////////
		// HTML //
		//////////
		var appHistoryHtml = '<div id="appHistory"></div>';
		//DUMMY CLOSER
		var appHistoryCloser = function () { return false; };
		/////////////////
		// CALL WINDOW //
		/////////////////
		getNewWindow(LANG.STATISTICS[lang],appHistoryHtml,appHistoryHandlers,appHistoryCloser);
	});
}
//##////////////////##//
//## INTAKE HISTORY ##//
//##////////////////##//
function intakeHistory() {
	'use strict';
	//check exists
	if(!app.read('app_last_tab','tab1'))	{ return; }
	if(!$('#appStatusIntake').html())		{ return; }
	if($('body').hasClass('closer')) {
		$('body').removeClass('closer');
		$('body').addClass('reCloser');
	}
	//if($('#appStatusIntake div').length === 0) { return; }
	//go
	var firstTick = 0;
	var lastTick  = app.read('config_kcals_day_0') * 1.5;
	var origTick  = app.read('config_kcals_day_0');
	/////////////////
	// CYCLIC CASE //
	/////////////////
	if(app.read('config_kcals_type','cyclic')) {
		if(app.read('config_kcals_day','d')) {
			lastTick = app.read('config_kcals_day_2') * 1.5;
			origTick = app.read('config_kcals_day_2');
		} else {
			lastTick = app.read('config_kcals_day_1') * 1.5;
			origTick = app.read('config_kcals_day_1');
		}
	}
	///////////////////////////////////////
	// localized short weekday countback //
	///////////////////////////////////////
	var day = 60 * 60 * 24 * 1000;
	var now = new Date().getTime();
	//count back 7 days
	var past0days = DayUtcFormat(now);
	var past1days = DayUtcFormat(now - (day*1));
	var past2days = DayUtcFormat(now - (day*2));
	var past3days = DayUtcFormat(now - (day*3));
	var past4days = DayUtcFormat(now - (day*4));
	var past5days = DayUtcFormat(now - (day*5));
	var past6days = DayUtcFormat(now - (day*6));
	var past7days = DayUtcFormat(now - (day*7));
	//weekday lang array
	var weekdaysArray = LANG.WEEKDAY_SHORT[lang].split(', ');
	//parse date as time
	var past0daysTime = Date.parse(DayUtcFormat(past0days));
	var past1daysTime = Date.parse(DayUtcFormat(past1days));
	var past2daysTime = Date.parse(DayUtcFormat(past2days));
	var past3daysTime = Date.parse(DayUtcFormat(past3days));
	var past4daysTime = Date.parse(DayUtcFormat(past4days));
	var past5daysTime = Date.parse(DayUtcFormat(past5days));
	var past6daysTime = Date.parse(DayUtcFormat(past6days));
	var past7daysTime = Date.parse(DayUtcFormat(past7days));
	//get weekday n. from time
	var past0daysNumber = (new Date(past0daysTime)).getDay();
	var past1daysNumber = (new Date(past1daysTime)).getDay();
	var past2daysNumber = (new Date(past2daysTime)).getDay();
	var past3daysNumber = (new Date(past3daysTime)).getDay();
	var past4daysNumber = (new Date(past4daysTime)).getDay();
	var past5daysNumber = (new Date(past5daysTime)).getDay();
	var past6daysNumber = (new Date(past6daysTime)).getDay();
	var past7daysNumber = (new Date(past7daysTime)).getDay();
	///////////////////////////
	// usable weekday labels //
	///////////////////////////
	var past0daysLabel = weekdaysArray[past0daysNumber];
	var past1daysLabel = weekdaysArray[past1daysNumber];
	var past2daysLabel = weekdaysArray[past2daysNumber];
	var past3daysLabel = weekdaysArray[past3daysNumber];
	var past4daysLabel = weekdaysArray[past4daysNumber];
	var past5daysLabel = weekdaysArray[past5daysNumber];
	var past6daysLabel = weekdaysArray[past6daysNumber];
	var past7daysLabel = weekdaysArray[past7daysNumber];
	//////////////////////
	// WEEKDAY SUM LOOP //
	//////////////////////
	//sum vars
	var past0daysSum = 0;
	var past1daysSum = 0;
	var past2daysSum = 0;
	var past3daysSum = 0;
	var past4daysSum = 0;
	var past5daysSum = 0;
	var past6daysSum = 0;
	var past7daysSum = 0;
	//LOOP
	getEntries(function(data) {
		var dataPublished;
		var dataTitle;
		for(var i=0, len=data.length; i<len; i++) {
			if(parseInt(data[i].published) <= app.now()) {
				dataPublished = DayUtcFormat(parseInt(data[i].published));
				dataTitle     = parseInt(data[i].title);
				if(dataPublished == past0days) { past0daysSum = past0daysSum + dataTitle; }
				if(dataPublished == past1days) { past1daysSum = past1daysSum + dataTitle; }
				if(dataPublished == past2days) { past2daysSum = past2daysSum + dataTitle; }
				if(dataPublished == past3days) { past3daysSum = past3daysSum + dataTitle; }
				if(dataPublished == past4days) { past4daysSum = past4daysSum + dataTitle; }
				if(dataPublished == past5days) { past5daysSum = past5daysSum + dataTitle; }
				if(dataPublished == past6days) { past6daysSum = past6daysSum + dataTitle; }
				if(dataPublished == past7days) { past7daysSum = past7daysSum + dataTitle; }
				//reset
				dataPublished = 0;
				dataTitle     = 0;
			}
		}
		//null for zero
		//if(past0daysSum == 0) { past0daysSum = null; }
		//if(past1daysSum == 0) { past1daysSum = null; }
		//if(past2daysSum == 0) { past2daysSum = null; }
		//if(past3daysSum == 0) { past3daysSum = null; }
		//if(past4daysSum == 0) { past4daysSum = null; }
		//if(past5daysSum == 0) { past5daysSum = null; }
		//if(past6daysSum == 0) { past6daysSum = null; }
		//if(past7daysSum == 0) { past7daysSum = null; }
		//lastTick 500kcal buffer
		if(past0daysSum > lastTick-500)									{ lastTick = past0daysSum*1.5; }
		if(past1daysSum > lastTick-500 && past1daysSum > past0daysSum)	{ lastTick = past1daysSum*1.5; }
		if(past2daysSum > lastTick-500 && past2daysSum > past1daysSum)	{ lastTick = past2daysSum*1.5; }
		if(past3daysSum > lastTick-500 && past3daysSum > past2daysSum)	{ lastTick = past3daysSum*1.5; }
		if(past4daysSum > lastTick-500 && past4daysSum > past3daysSum)	{ lastTick = past4daysSum*1.5; }
		if(past5daysSum > lastTick-500 && past5daysSum > past4daysSum)	{ lastTick = past5daysSum*1.5; }
		if(past6daysSum > lastTick-500 && past6daysSum > past5daysSum)	{ lastTick = past6daysSum*1.5; }
		if(past7daysSum > lastTick-500 && past7daysSum > past6daysSum)	{ lastTick = past7daysSum*1.5; }
		//min lastTick val
		//if(lastTick < 300) { lastTick = 300; }
		if(lastTick < 600) { lastTick = lastTick+600; }
		//firstTick -500kcal buffer
		if(past0daysSum < 0)								{ firstTick = past0daysSum*2; }
		if(past1daysSum < 0 && past1daysSum < past0daysSum)	{ firstTick = past1daysSum*2; }
		if(past2daysSum < 0 && past2daysSum < past1daysSum)	{ firstTick = past2daysSum*2; }
		if(past3daysSum < 0 && past3daysSum < past2daysSum)	{ firstTick = past3daysSum*2; }
		if(past4daysSum < 0 && past4daysSum < past3daysSum)	{ firstTick = past4daysSum*2; }
		if(past5daysSum < 0 && past5daysSum < past4daysSum)	{ firstTick = past5daysSum*2; }
		if(past6daysSum < 0 && past6daysSum < past5daysSum)	{ firstTick = past6daysSum*2; }
		if(past7daysSum < 0 && past7daysSum < past6daysSum)	{ firstTick = past7daysSum*2; }
		//min neg pad start at -500
		if(firstTick < 0 && firstTick > -500) { firstTick = -500; }
		//no null yesterday label
		var past1daysColor = 'rgba(0,0,0,1)';
		var past2daysColor = 'rgba(0,0,0,1)';
		var past3daysColor = 'rgba(0,0,0,1)';
		var past4daysColor = 'rgba(0,0,0,1)';
		//
		if(past1daysSum == 0) { past1daysColor = 'rgba(0,0,0,0)'; }
		if(past2daysSum == 0) { past2daysColor = 'rgba(0,0,0,0)'; }
		if(past3daysSum == 0) { past3daysColor = 'rgba(0,0,0,0)'; }
		if(past4daysSum == 0) { past4daysColor = 'rgba(0,0,0,0)'; }
		////////////////////
		// GENERATE CHART //
		////////////////////
		$('#appStatusIntake div').css2('padding-top', '0px');
		var spacingBottom = Highcharts.version.contains('4.') ? 0 : -8;
		if(app.device.android2) { spacingBottom = Highcharts.version.contains('4.') ? -4 : -12; }
		//check exists
		if(!app.read('app_last_tab','tab1'))	{ return; }
		if(!$('#appStatusIntake').html())		{ return; }
		$('#appStatusIntake').highcharts({
			chart : {
				reflow: false,
				spacingLeft   : $('#appStatusIntake').width() / -6,
				spacingRight  : $('#appStatusIntake').width() / -7.2,
				spacingTop    : -1,
				spacingBottom : spacingBottom,
				height : (app.touch || app.device.osx) ? 64 : 66,
				width : $('#appStatusIntake').width()
			},
			credits : {
				enabled : false
			},
			legend : {
				enabled : false
			},
			title : {
				text : ''
			},
			subtitle : {
				text : ''
			},
			xAxis : {
				categories : ['', past4daysLabel, past3daysLabel, past2daysLabel, past1daysLabel, ''],
				labels : {
					style : {
						color : 'rgba(47, 126, 216, .45)',
						fontSize : '9px'
					},
					y : -2,
					x : 0
				}
			},
			yAxis : {
				title : {
					text : ''
				},
				tickPositions : [firstTick, origTick, lastTick],
				gridLineColor : 'rgba(204,51,0,.66)',
				gridLineDashStyle : 'longdash',
				labels : {
					enabled : false,
					align : 'left',
					x : 31,
					y : -1,
					textSize : '8px'
				},
				showFirstLabel : false,
				showLastLabel : false
			},
			tooltip : {
				enabled : false,
				formatter : function () {
					return '<b>' + this.series.name + '</b><br/>' + this.x + ': ' + this.y + '°C';
				}
			},
			plotOptions : {
            series: {
				allowPointSelect: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                }
            },
				line : {
					dataLabels : {
						enabled : true,
						style : {
							textShadow : '0 0 3px white',
							fontSize : '8px',
							fontWeight: 'normal'
						}
					},
					enableMouseTracking : false
				}
			},
			series : [{
					type : 'area',
					name : 'solid filler',
					animation : false,
					data : [
						past5daysSum,
						past4daysSum,
						past3daysSum,
						past2daysSum,
						past1daysSum,
						past0daysSum
					],
					lineWidth : 1,
					lineColor : 'rgba(47, 126, 216, .5)',
					fillColor : 'rgba(47, 126, 216, .1)',
					marker : {
						enabled : false,
						lineWidth : 0,
						lineColor : 'rgba(0, 0, 0, 0)',
						fillColor : 'rgba(0, 0, 0, 0)',
						states: {
							hover: {
								lineWidth : 1
							}
						}
					}
				},
				{
					type : 'line',
					name : 'line with labels',
					animation : false,
					data : [
						{ y : past5daysSum, dataLabels : { x : 0, color : 'rgba(0,0,0,0)' } },
						{ y : past4daysSum, dataLabels : { x : 0, color : past4daysColor  } },
						{ y : past3daysSum, dataLabels : { x : 0, color : past3daysColor  } },
						{ y : past2daysSum, dataLabels : { x : 0, color : past2daysColor  } },
						{ y : past1daysSum, dataLabels : { x : 0, color : past1daysColor  } },
						{ y : past0daysSum, dataLabels : { x : 0, color : 'rgba(0,0,0,0)' } }
					],
					lineWidth : 0,
					lineColor : 'rgba(0,0,0,.2)',
					fillColor : 'rgba(0,0,0,.05)',
					marker : {
						enabled : false
					},
					line : {
						dataLabels : {
							enabled : true,
							style : {
								textShadow : '0 0 3px white',
								fontSize : '8px',
								fontWeight: 'normal'
							}
						}
					}
				}
			]
		});
		//write cache
		app.save('appStatusIntake',$('#appStatusIntake').html());
		$('#appStatusIntake div').css2('padding-top', '0px');
		if($('body').hasClass('reCloser')) {
			$('body').removeClass('reCloser');
			$('body').addClass('closer');
		}
	});
	//wp8 nonstandand
	$('#appStatusIntake').on(touchend,function(){
		return false;
	});
}
//##///////////////////##//
//## GET NUTRI SLIDERS ##//
//##///////////////////##//
function getNutriSliders() {
	'use strict';
	///////////////////
	// AUTOFIX RATIO //
	///////////////////
	if(isNaN(parseInt(app.read('appNutrients').split('|')[0])) || isNaN(parseInt(app.read('appNutrients').split('|')[1])) || isNaN(parseInt(app.read('appNutrients').split('|')[2]))  ) {
		app.save('appNutrients','25|50|25');
	}
	///////////////////
	// SAVE CALLBACK //
	///////////////////
	var save = function() {
		if(parseInt(document.getElementById('sliderProInput').value) + parseInt(document.getElementById('sliderCarInput').value) + parseInt(document.getElementById('sliderFatInput').value) == 100) {
			app.save('appNutrients',parseInt(document.getElementById('sliderProInput').value) + '|' + parseInt(document.getElementById('sliderCarInput').value) + '|' + parseInt(document.getElementById('sliderFatInput').value));
			updateNutriRatio();
			//SAVE OVERRIDES
			$('#personalNutriWaterToggle').trigger('change');
			$('#personalNutriFiberToggle').trigger('change');
			$('#personalNutriSugarToggle').trigger('change');
			$('#personalNutriSodiumToggle').trigger('change');
			//
			return true;
		} else {
			alert(LANG.TOTAL_ERROR[lang],LANG.PLEASE_REVIEW[lang]);
			return false;
		}
	};
	/////////////////////
	// CLOSER CALLBACK //
	/////////////////////
	var closer = function() {
		//SAVE OVERRIDES
		$('#personalNutriWaterToggle').trigger('change');
		$('#personalNutriFiberToggle').trigger('change');
		$('#personalNutriSugarToggle').trigger('change');
		$('#personalNutriSodiumToggle').trigger('change');
	};
	///////////////////////
	// HANDLERS CALLBACK //
	///////////////////////
	var handlers = function() {
		//FIX PROPAGATION
		app.suspend('#sliderProWrapper,#sliderCarWrapper,#sliderFatWrapper',600);
		///////////////////
		// PREVENT FOCUS //
		///////////////////
		$('#newWindow input').on(touchstart,function() {
			return false;
		});
		///////////
		// CARPE //
		///////////
		if(document.getElementById('sliderProRange')) {
			$(document).trigger('carpeSlider');
			document.getElementById('sliderProRange').slider.setValue(0);
			document.getElementById('sliderCarRange').slider.setValue(0);
			document.getElementById('sliderFatRange').slider.setValue(0);
			document.getElementById('sliderProRange').slider.setValue(parseInt(app.read('appNutrients').split('|')[0]));
			document.getElementById('sliderCarRange').slider.setValue(parseInt(app.read('appNutrients').split('|')[1]));
			document.getElementById('sliderFatRange').slider.setValue(parseInt(app.read('appNutrients').split('|')[2]));
		}
		////////////////
		// PRO.UPDATE //
		////////////////
		if(document.getElementById('sliderProInput')) {
		document.getElementById('sliderProInput').update = function() {
			if(document.getElementById('sliderProInput')) {
				document.getElementById('sliderProInput').value = parseInt(document.getElementById('sliderProRange').value)+ '%';
				if(parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderCarRange').value) + parseInt(document.getElementById('sliderFatRange').value) > 100) {
					document.getElementById('sliderProInput').value = (100 - (parseInt(document.getElementById('sliderCarRange').value)) - (parseInt(document.getElementById('sliderFatRange').value))) + '%';
					document.getElementById('sliderProRange').slider.setValue(100 - (parseInt(document.getElementById('sliderCarRange').value)) - parseInt((document.getElementById('sliderFatRange').value)));
				}
				//update total
				document.getElementById('sliderTotalInput').value = LANG.TOTAL[lang] + ': ' + (parseInt(document.getElementById('sliderFatRange').value) + parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderCarRange').value)) + '%';
			}
		};
		}
		////////////////
		// CAR.UPDATE //
		////////////////
		if(document.getElementById('sliderCarInput')) {
		document.getElementById('sliderCarInput').update = function() {
			if(document.getElementById('sliderCarInput')) {
				document.getElementById('sliderCarInput').value = parseInt(document.getElementById('sliderCarRange').value)+ '%';
				if(parseInt(document.getElementById('sliderCarRange').value) + parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderFatRange').value) > 100) {
					document.getElementById('sliderCarInput').value = (100 - (parseInt(document.getElementById('sliderProRange').value)) - (parseInt(document.getElementById('sliderFatRange').value))) + '%';
					document.getElementById('sliderCarRange').slider.setValue(100 - (parseInt(document.getElementById('sliderProRange').value)) - parseInt((document.getElementById('sliderFatRange').value)));
				}
				//update total
				document.getElementById('sliderTotalInput').value = LANG.TOTAL[lang] + ': ' + (parseInt(document.getElementById('sliderFatRange').value) + parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderCarRange').value)) + '%';
			}
		};
		}
		////////////////
		// FAT.UPDATE //
		////////////////
		if(document.getElementById('sliderFatInput')) {
		document.getElementById('sliderFatInput').update = function() {
			if(document.getElementById('sliderFatInput')) {
				document.getElementById('sliderFatInput').value = parseInt(document.getElementById('sliderFatRange').value) + '%';
				if(parseInt(document.getElementById('sliderFatRange').value) + parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderCarRange').value) > 100) {
					document.getElementById('sliderFatInput').value = (100 - (parseInt(document.getElementById('sliderProRange').value)) - (parseInt(document.getElementById('sliderCarRange').value))) + '%';
					document.getElementById('sliderFatRange').slider.setValue(100 - (parseInt(document.getElementById('sliderProRange').value)) - parseInt((document.getElementById('sliderCarRange').value)));
				}
				//update total
				document.getElementById('sliderTotalInput').value = LANG.TOTAL[lang] + ': ' + (parseInt(document.getElementById('sliderFatRange').value) + parseInt(document.getElementById('sliderProRange').value) + parseInt(document.getElementById('sliderCarRange').value)) + '%';
			}
		};
		}
		/////////////////
		// INIT VALUES //
		/////////////////
		if(document.getElementById('sliderProRange')) {
			$('#sliderProInput').trigger('update');
			$('#sliderCarInput').trigger('update');
			$('#sliderFatInput').trigger('update');
		}
		///////////////////////
		// TIME SPAN CONTROL //
		///////////////////////
		$('#sliderTimeSpan div').on(touchstart,function(evt) {
			$('.activeOption').removeClass('activeOption');
			$(this).addClass('activeOption');
				 if($(this).prop('id') == 'divTimeSpan1') { app.save('appNutrientTimeSpan',1);  }
		    else if($(this).prop('id') == 'divTimeSpan2') { app.save('appNutrientTimeSpan',7);  }
			else if($(this).prop('id') == 'divTimeSpan3') { app.save('appNutrientTimeSpan',30); }
			else if($(this).prop('id') == 'divTimeSpan4') { app.save('appNutrientTimeSpan',0);  }
			return false;
		});
		//READ STORED
		     if(app.read('appNutrientTimeSpan',1))  { $('#divTimeSpan1').addClass('activeOption'); }
		else if(app.read('appNutrientTimeSpan',7))  { $('#divTimeSpan2').addClass('activeOption'); }
		else if(app.read('appNutrientTimeSpan',30)) { $('#divTimeSpan3').addClass('activeOption'); }
		else if(app.read('appNutrientTimeSpan',0))  { $('#divTimeSpan4').addClass('activeOption'); }
		//////////////
		// RATIO BY //
		//////////////
		$('#sliderRatioByG,#sliderRatioByKcal').on(touchstart,function(evt) {
			$('#sliderRatioByG,#sliderRatioByKcal').removeClass('active');
			$('#' + evt.target.id).addClass('active');
			if(evt.target.id == 'sliderRatioByG') {
				app.save('appRatioBy','g');
			} else {
				app.save('appRatioBy','kcal');
			}
			return false;
		});
		//
		if(app.read('appRatioBy','g')) {
			$('#sliderRatioByG').addClass('active');
		} else {
			$('#sliderRatioByKcal').addClass('active');
		}
		//#////////////////////#//
		//# OVERRRIDES SECTION #//
		//#////////////////////#//
		app.handlers.addRemove('#personalNutriWaterInput', 1,9999,'int');
		app.handlers.addRemove('#personalNutriFiberInput', 1,9999,'int');
		app.handlers.addRemove('#personalNutriSugarInput', 1,9999,'int');
		app.handlers.addRemove('#personalNutriSodiumInput',1,9999,'int');
		
		//WATER PER KG CALCULATION
		var weight = app.read('calcForm#pA3B');
		if (!app.read('calcForm#pA3C', 'kilograms')) {
			weight = Math.round(weight * 0.454);
		}
		//FIBER/SUGAR/SODIUM
		var intake = app.read('config_kcals_day_0');
		if(app.read('config_kcals_type','cyclic')) {
			intake = Math.round(((app.read('config_kcals_day_0')*3) + app.read('config_kcals_day_2'))/4);
		}
		//DEFINE
		app.define('override_water_value',  Math.round(weight * 35));
		app.define('override_fiber_value',  Math.round(intake * 0.014));
		app.define('override_sugar_value',  Math.round(intake * 0.025));
		app.define('override_sodium_value', Math.round(intake * 0.0325)*10);
		//READ
		$('#personalNutriWaterInput').val(app.read('override_water_value'));
		$('#personalNutriFiberInput').val(app.read('override_fiber_value'));
		$('#personalNutriSugarInput').val(app.read('override_sugar_value'));
		$('#personalNutriSodiumInput').val(app.read('override_sodium_value'));
		/////////////////////
		// CHANGE HANDLERS //
		/////////////////////
		///////////
		// WATER //
		///////////
		//READ SAVED
		if(app.read('override_water','on')) { $('#personalNutriWaterToggle').prop('checked',true); }
		//SAVE CHANGES
		$('#personalNutriWaterToggle').on('change',function() {
			//ON
			if($('#personalNutriWaterToggle').prop('checked')) {
				app.save('override_water','on');
			} else {
				app.save('override_water','off');
			}
			//
			app.save('override_water_value',$('#personalNutriWaterInput').val());
		});
		///////////
		// FIBER //
		///////////
		//READ SAVED
		if(app.read('override_fiber','on')) { $('#personalNutriFiberToggle').prop('checked',true); }
		//SAVE CHANGES
		$('#personalNutriFiberToggle').on('change',function() {
			//ON
			if($('#personalNutriFiberToggle').prop('checked')) {
				app.save('override_fiber','on');
			} else {
				app.save('override_fiber','off');
			}
			//
			app.save('override_fiber_value',$('#personalNutriFiberInput').val());
		});
		///////////
		// SUGAR //
		///////////
		//READ SAVED
		if(app.read('override_sugar','on')) { $('#personalNutriSugarToggle').prop('checked',true); }
		//SAVE CHANGES
		$('#personalNutriSugarToggle').on('change',function() {
			//ON
			if($('#personalNutriSugarToggle').prop('checked')) {
				app.save('override_sugar','on');
			} else {
				app.save('override_sugar','off');
			}
			//
			app.save('override_sugar_value',$('#personalNutriSugarInput').val());
		});
		////////////
		// SODIUM //
		////////////
		//READ SAVED
		if(app.read('override_sodium','on')) { $('#personalNutriSodiumToggle').prop('checked',true); }
		//SAVE CHANGES
		$('#personalNutriSodiumToggle').on('change',function() {
			//ON
			if($('#personalNutriSodiumToggle').prop('checked')) {
				app.save('override_sodium','on');
			} else {
				app.save('override_sodium','off');
			}
			//
			app.save('override_sodium_value',$('#personalNutriSodiumInput').val());
		});
		////////////////////////
	};
	////////////////
	// HTML BLOCK //
	////////////////
	var htmlContent = '\
		<input type="text" id="sliderTotalInput" />\
		<div id="sliderRatioBy">\
			<div id="sliderRatioByG">' + LANG.G[lang]       + '</div>\
			<div id="sliderRatioByKcal">' + LANG.KCAL[lang] + '</div>\
		</div>\
		<div id="sliderTimeSpan">\
			<div id="divTimeSpan1">' + LANG.TODAY[lang]    + '</div>\
			<div id="divTimeSpan2">' + LANG.LAST_7[lang]   + '</div>\
			<div id="divTimeSpan3">' + LANG.LAST_30[lang]  + '</div>\
			<div id="divTimeSpan4">' + LANG.ALL_DAYS[lang] + '</div>\
		</div>\
		<div id="sliderPro">\
			<input type="text" id="sliderProInput" />\
			<div id="sliderProLabel">' + LANG.PROTEINS[lang] + '</div>\
			<div id="sliderProWrapper"><input id="sliderProRange" type="range" min="0" max="100" step="1" value="0" data-carpe-targets="sliderProInput" data-carpe-decimals="0" /></div>\
		</div>\
		<div id="sliderCar">\
			<input type="text" id="sliderCarInput" />\
			<div id="sliderCarLabel">' + LANG.CARBS[lang] + '</div>\
			<div id="sliderCarWrapper"><input id="sliderCarRange" type="range" min="0" max="100" step="1" value="0" data-carpe-targets="sliderCarInput" data-carpe-decimals="0" /></div>\
		</div>\
		<div id="sliderFat">\
			<input type="text" id="sliderFatInput" />\
			<div id="sliderFatLabel">' + LANG.FATS[lang] + '</div>\
			<div id="sliderFatWrapper"><input id="sliderFatRange" type="range" min="0" max="100" step="1" value="0" data-carpe-targets="sliderFatInput" data-carpe-decimals="0" /></div>\
		</div>\
		<div id="personalNutriWrapper">\
		<div id="personalNutri">\
		<div id="personalNutriWater">\
			<input id="personalNutriWaterInput" type="text"><span class="nutriTitle">'+ LANG.WATER[lang] +'</span>\
			<input id="personalNutriWaterToggle" class="toggle" type="checkbox">\
			<label for="personalNutriWaterToggle"></label>\
		</div>\
		<div id="personalNutriFiber">\
			<input id="personalNutriFiberInput" type="text"><span class="nutriTitle">'+ LANG.FIBER[lang] +'</span>\
			<input id="personalNutriFiberToggle" class="toggle" type="checkbox">\
			<label for="personalNutriFiberToggle"></label>\
		</div>\
		<div id="personalNutriSugar">\
			<input id="personalNutriSugarInput" type="text"><span class="nutriTitle">'+ LANG.SUGAR[lang] +'</span>\
			<input id="personalNutriSugarToggle" class="toggle" type="checkbox">\
			<label for="personalNutriSugarToggle"></label>\
		</div>\
		<div id="personalNutriSodium">\
			<input id="personalNutriSodiumInput" type="text"><span class="nutriTitle">'+ LANG.SODIUM[lang] +'</span>\
			<input id="personalNutriSodiumToggle" class="toggle" type="checkbox">\
			<label for="personalNutriSodiumToggle"></label>\
		</div>\
		</div>\
		</div>\
	';
	/////////////////////
	// CALL NEW WINDOW //
	/////////////////////
	getNewWindow(LANG.NUTRIENT_TITLE[lang],htmlContent,handlers,save,closer);
}
//##///////////////##//
//## TODAYOVERVIEW ##//
//##///////////////##//
function updateTodayOverview(fullWindow) {
	'use strict';
	if (!app.read('app_last_tab', 'tab1')) {
		return;
	}
	//vars
	var today = [];
	today.food = app.read('config_ttf');
	today.exercise = Math.abs(app.read('config_tte'));
	today.intake = app.get.kcals();
	today.absIntake = today.intake + today.exercise;
	today.percent = Math.round((today.food - today.exercise) / ((today.intake) / 100));
	today.left = today.absIntake - today.food;
	//////////
	// calc //
	//////////
	if (today.left < today.exercise && today.exercise > 0 && today.left >= 0) {
		// partially compensaed
		today.Cexercise = today.exercise - today.left;
		today.Lexercise = today.exercise - today.Cexercise;
		today.left = 0;
	} else if (today.left < 0) {
		//fully compensated
		today.Cexercise = today.exercise;
		today.Lexercise = 0;
	} else {
		//still left
		today.Cexercise = 0;
		today.Lexercise = today.exercise;
	}
	//////////
	// HTML //
	//////////
	//update percent
	$('#circlePercentInner').html2(today.percent + '%');
	$('#totalConsumed').html2(today.food - today.exercise);
	$('#appDayA').html2(LANG.DAY[lang] + ' A');
	$('#appDayB').html2(LANG.DAY[lang] + ' B');
	$('#appDayC').html2(LANG.DAY[lang] + ' C');
	$('#appDayD').html2(LANG.DAY[lang] + ' D');
	//update intake
	if (app.read('config_kcals_type', 'cyclic')) {
		//highlight cycle day
		if (app.read('config_kcals_day')) {
			$('.current').removeClass('current');
			$('#' + 'appDay' + app.read('config_kcals_day').toUpperCase()).addClass('current');
		}
		//
		if (app.read('config_kcals_day', 'd')) {
			$('#totalIntake').html2('<div id="intakeContent">/ ' + app.read('config_kcals_day_1') + '~<span>' + app.read('config_kcals_day_2') + '</span></div>');
		} else {
			$('#totalIntake').html2('<div id="intakeContent">/ <span>' + app.read('config_kcals_day_1') + '</span>~' + app.read('config_kcals_day_2') + '</div>');
		}
	} else {
		$('#totalIntake').html2('<div id="intakeContent">/ ' + app.read('config_kcals_day_0') + ' ' + LANG.KCAL[lang] + '</div>');
	}
	///////////////////
	// CHART OPTIONS //
	///////////////////
	var pieOptions = {
		reflow : false,
		colors : ['#1eb618', '#2f7ed8', '#9947f0', '#ee704e', (fullWindow == 1) ? '#ddd' : '#f3f3f3'],
		credits : {
			enabled : false
		},
		chart : {
			reflow : false,
			spacingRight : 0,
			spacingLeft : (fullWindow == 1) ? 0 : -4,
			spacingTop : (fullWindow == 1) ? 10 : -5,
			spacingBottom : (fullWindow == 1) ? 20 : 0,
			height : (fullWindow == 1) ? 390 : 56,
			width : (fullWindow == 1) ? 300 : 60,
			plotBackgroundColor : '#fff',
			plotBorderWidth : 0,
			plotShadow : false
		},
		title : {
			text : ''
		},
		tooltip : {
			pointFormat : '',
			enabled : false
		},
		plotOptions : {
			pie : {
				borderColor : '#fff',
				borderWidth : (today.percent == 0 && today.food == 0) ? 0 : 1,
				allowPointSelect : false,
				cursor : 'pointer',
				dataLabels : {
					softConnector : false,
					enabled : (fullWindow == 1) ? true : false,
					format : '{point.y}',
					style : {
						fontWeight: 'normal',
						fontSize: '12px'
					},
				},
				showInLegend : (fullWindow == 1) ? true : false
			},
		},
		legend : {
			enabled : (fullWindow == 1) ? true : false,
			itemWidth : 250,
			layout : 'vertical',
			itemStyle : {
				lineHeight : '14px'
			},
			nagivation : {
				animation : 0
			},
			borderRadius : 0,
			borderWidth : 1
		},
		series : [{
				type : 'pie',
				name : '',
				color : '#fff',
				innerSize : (fullWindow == 1) ? '12' : '250%',
				size : (fullWindow == 1) ? '14' : '120%',
				animation : false,
				data : [
					[LANG.FOOD[lang].capitalize() + ' (' + LANG.SURPLUS[lang] + ')', today.left < 0 ? Math.abs(today.left) : 0],
					[LANG.FOOD[lang].capitalize(), today.left > 0 ? today.food : today.food - Math.abs(today.left)],
					[LANG.EXERCISE[lang].capitalize() + ' (' + LANG.COMPENSATED[lang] + ')', today.Cexercise],
					[LANG.EXERCISE[lang].capitalize() + ' (' + LANG.NON_COMPENSATED[lang] + ')', today.Lexercise],
					[LANG.CALORIES_LEFT[lang].capitalize(), today.left < 0 ? 0 : today.left]
				]
			}
		]
	};
	/////////////////////
	// CALL HIGHCHARTS //
	/////////////////////`
	if (fullWindow == 1) {
		getNewWindow(LANG.TODAY[lang].capitalize(), '\
			<div id="totalChartWrapper">\
				<div id="circlePercentInner">' + today.percent + '%</div>\
				<div id="totalChart"></div>\
			</div>', function () {
			if($('#totalChart').length) {
				$('#totalChart').highcharts(pieOptions);
				//info icon
				$('#saveButton').html2('');
				$('#saveButton').addClass('getInfo');
			}
		},function() {
			//info content replace
		if(!$('#newWindow').hasClass('getInfo')) {
			$('#newWindow').addClass('getInfo');
			app.globals.newWindowTitle    = $('#newWindowTitle').html();
			app.globals.newWindow = $('#newWindow').html();
			$('#newWindowTitle').html2('Help: Today Overview');
			$('#newWindow').html2(LANG.HELP_TOPICS_ARRAY['en']['Today Overview']);
			app.handlers.fade(1,'#newWindow');
		} else {
			$('#newWindow').removeClass('getInfo');
			$('#newWindowTitle').html2(app.globals.newWindowTitle);
			$('#newWindow').html2(app.globals.newWindow);
			app.handlers.fade(1,'#newWindow');
		}
		return 0;
		});
	} else {
		if($('#circlePercent').length) {
			$('#appStatusBlock2 #circlePercent').highcharts(pieOptions);
			app.save('pieCache',$('#appStatusBlock2').html());
		}
	}
}
//##/////////////##//
//## CYCLIC MENU ##//
//##/////////////##//
function getCyclicMenu() {
	'use strict';
	//////////
	// HTML //
	//////////
	var isCyclic = app.read('config_kcals_type','cyclic') ? 'checked' : '';
	var appModeHtml = '\
	<div id="appMode">\
		<input id="appModeToggle" class="toggle" type="checkbox" ' + isCyclic + '>\
		<label for="appModeToggle"></label>\
		<div id="appModeEnable">\
			<input id="appCyclic1" type="number" value="' + app.read('config_kcals_day_1') + '" />\
			<div id="appCyclic1Title">' + LANG.DAYS[lang] + ' A B C</div>\
			<input id="appCyclic2" type="number" value="' + app.read('config_kcals_day_2') + '" />\
			<div id="appCyclic2Title">' + LANG.DAY[lang] + ' D</div>\
			<div id="appModeEnableInfo"><p>' + LANG.CYCLIC_INFO[lang].split('. ').join('_').split('.').join('.</p><p>').split('_').join('. ') + '</p></div>\
		</div>\
	</div>';
	//////////////
	// HANDLERS //
	//////////////
	var appModeHandlers = function() {
		//getinfo
		$('#saveButton').html2('');
		$('#saveButton').addClass('getInfo');
		////////////////
		// VALIDATION //
		////////////////
		app.handlers.validate('#appCyclic1',{minValue: 100, defaultValue: 1600},'','','',function() {
			//BLUR HANDLER
			app.save('config_kcals_day_1',$('#appCyclic1').val());
			if(app.read('config_kcals_type') == 'cyclic' && app.read('config_kcals_day') != 'd') {
				$('#timerDailyInput').val(app.read('config_kcals_day_1'));
			}
			updateTodayOverview();
		});
		app.handlers.validate('#appCyclic2',{minValue: 100, defaultValue: 2000},'','','',function() {
			//BLUR HANDLER
			app.save('config_kcals_day_2',$('#appCyclic2').val());
			if(app.read('config_kcals_type') == 'cyclic' && app.read('config_kcals_day') == 'd') {
				$('#timerDailyInput').val(app.read('config_kcals_day_2'));
			}
			updateTodayOverview();
		});
		//////////////
		// TAP BLUR //
		//////////////
		$('#appMode').on(touchend,function(evt) {
			evt.stopPropagation();
			if($('#appCyclic1').is(':focus') || $('#appCyclic2').is(':focus')) {
				if(evt.target.id != 'appCyclic1' && evt.target.id != 'appCyclic2') {
					evt.preventDefault();
				}
			}
			if(evt.target.id != 'appCyclic1' && evt.target.id != 'appCyclic2') {
				$('#appCyclic1').blur();
				$('#appCyclic2').blur();
			}
		});
		/////////////////////
		// SWITCH LISTENER //
		/////////////////////
		//set default
		app.define('config_kcals_type','simple');
		//read stored
		if(app.read('config_kcals_type','cyclic')) {
			$('#appModeToggle').prop('checked',true);
		}
		//TAP
		/*
		app.handlers.activeRow('#appMode label','button',function(target) {
			if((/checkbox/).test($(target).html())) {
				if($('input[type=checkbox]', '#' + evt.target.id).prop('checked') == true) {
					$('input[type=checkbox]', '#' + evt.target.id).prop('checked',false);
				} else {
					$('input[type=checkbox]', '#' + evt.target.id).prop('checked',true);
				}
				$('input[type=checkbox]', '#' + evt.target.id).trigger('change');
			}
		});
		*/
		//ON CHANGE
		$('#appModeToggle').on('change',function(obj) {
			if($('#appModeToggle').prop('checked')) {
				app.save('config_kcals_type','cyclic');
				$('body').removeClass('simple');
				$('body').addClass('cyclic');
			} else {
				app.save('config_kcals_type','simple');
				$('body').removeClass('cyclic');
				$('body').addClass('simple');
			}
			//update underlying
			if(app.read('config_kcals_type','cyclic')) {
				if(app.read('config_kcals_day','d')) {
					$('#timerDailyInput').val(app.read('config_kcals_day_2'));
				} else {
					$('#timerDailyInput').val(app.read('config_kcals_day_1'));
				}
			} else {
				$('#timerDailyInput').val(app.read('config_kcals_day_0'));
			}
		});
	};
	///////////
	// CLOSE //
	///////////
	var appModeClose = function() {
		$('#appCyclic1').blur();
		$('#appCyclic2').blur();
		updateTodayOverview();
		intakeHistory();
	};
	/////////////
	// CONFIRM //
	/////////////
	var appModeConfirm = function() {
		//info content replace
		if(!$('#newWindow').hasClass('getInfo')) {
			$('#newWindow').addClass('getInfo');
			app.globals.newWindowTitle = $('#newWindowTitle').html();
			$('#newWindowTitle').html2('Help: Cyclical Mode');
			$('#cyclicHelp').remove();
			$('#appMode').after2('<div id="cyclicHelp">' + LANG.HELP_TOPICS_ARRAY['en']['Cyclical Mode'] + '</div>');
			$('#appMode').hide();
			app.handlers.fade(1,'#cyclicHelp');
		} else {
			$('#newWindow').removeClass('getInfo');
			$('#newWindowTitle').html2(app.globals.newWindowTitle);
			$('#cyclicHelp').hide();
			$('#appMode').show();
			app.handlers.fade(1,'#newWindow');
		}
		return 0;
	};
	/////////////////
	// CALL WINDOW //
	/////////////////
	getNewWindow(LANG.CYCLIC_TITLE[lang],appModeHtml,appModeHandlers,appModeConfirm,appModeClose);
}
//##///////////////##//
//## BALANCE METER ##//
//##///////////////##//
function balanceMeter(kcalsInput,update) {
	'use strict';
	if(!app.read('app_last_tab','tab1')) { return false; }
	if(isNaN(parseInt(kcalsInput)))		 { return false; }
	if(!kcalsInput)						 { return false; }
	//COUNTER MODE
	if(app.read('app_counter_mode','progressive')) {
		kcalsInput = kcalsInput;
	} else {
		kcalsInput = kcalsInput*-1;
	}
	var balancePos = 0;
	//GET DEFINED
	var llim = app.read('config_limit_1');
	var ulim = app.read('config_limit_2');
	var ml = (Math.abs(llim));
	var pl = (ml*2)/100;
	var pu = (ulim*2)/100;
	//LIMITS
	if(kcalsInput == 0) {
		balancePos = '50%';
	} else {
		////////////////////
		// SELF REFERENCE //
		////////////////////
		//balancePos = 100 - (((parseFloat(kcalsInput)+600)/12) ) + '%';
		if(parseInt(kcalsInput)*-1 > 0) {
			//positive
			balancePos = 100 - (((parseFloat(kcalsInput)+ulim)/pu) ) + '%';
		} else {
			//negative
			balancePos = 100 - (((parseFloat(kcalsInput)+ml)/pl) ) + '%';
		}
	}
	// LIMITS
	if(parseInt(balancePos) > 100) {
		balancePos = '100%';
	}
	if(parseInt(balancePos) < 0) {
		balancePos = '0';
	}
	//////////////////////
	// UPDATE NO-REPEAT //
	//////////////////////
	var roundedBar = (Math.round(parseFloat($('#balanceBar').css2('text-indent')) * 100) / 100);
	var roundedNum = (Math.round(parseFloat(balancePos) * 100) / 100);
	if(roundedBar != roundedNum || update == 'now') {
		$('#balanceBar').css2('text-indent',roundedNum + '%');
	}
}
//##/////////////##//
//## LIMIT MENU ##//
//##/////////////##//
function getLimitMenu() {
	'use strict';
	//CLEAR PREVIOUS
	$('.sp-container').remove();
	//////////
	// HTML //
	//////////
	var appLimitHtml = '\
	<div id="appLimit">\
		<div id="appLimitEnable">\
			<input id="appLimit1" type="number" value="' + Math.abs(app.read('config_limit_1')) + '" />\
			<div id="appLimit1Title">' + LANG.LIMIT_LOWER[lang] + ' <span>(' + LANG.DEFICIT[lang] + ')</span></div>\
			<input id="appLimit2" type="number" value="' + app.read('config_limit_2') + '" />\
			<div id="appLimit2Title">' + LANG.LIMIT_UPPER[lang] + ' <span>(' + LANG.SURPLUS[lang] + ')</span></div>\
			<div id="appLimitInfo"><p>*' + LANG.LIMIT_INFO[lang].split('. ').join('_').split('.').join('.</p><p>').split('_').join('. ') + '</p></div>\
		</div>\
		<div id="appColorPicker">\
			<div id="appColorPickerInputs">\
				<span><input id="colorDeficit"  /><div id="appColorPickerDeficit">'  + LANG.DEFICIT[lang]  + '</div></span>\
				<span><input id="colorBalanced" /><div id="appColorPickerBalanced">' + LANG.BALANCED[lang] + '</div></span>\
				<span><input id="colorSurplus"  /><div id="appColorPickerSurplus">'  + LANG.SURPLUS[lang]  + '</div></span>\
			</div>\
		</div>\
	</div>\
	';
	//////////////
	// HANDLERS //
	//////////////
	var appLimitHandlers = function() {
		$('#saveButton').hide();
		//prevent propagation focus
		$('#appLimit1').css2('pointer-events','none');
		$('#appLimit2').css2('pointer-events','none');
		setTimeout(function() {
			$('#appLimit1').css2('pointer-events','auto');
			$('#appLimit2').css2('pointer-events','auto');
		},500);
		///////////////////////
		// COLOR PICKER INIT //
		///////////////////////
		//DEFICIT
		$('#colorDeficit').spectrum({move: function(color) { app.save('colorDeficit',color); app.updateColorPicker(); }, color: app.read('colorDeficit'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerDeficit' });
		//BALANCED
		$('#colorBalanced').spectrum({ move: function(color) { app.save('colorBalanced',color); app.updateColorPicker(); }, color: app.read('colorBalanced'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerBalanced' });
		//SURPLUS
		$('#colorSurplus').spectrum({ move: function(color) { app.save('colorSurplus',color); app.updateColorPicker(); }, color: app.read('colorSurplus'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerSurplus' });
		//////////////
		// ONCHANGE //
		//////////////
		//DEFICIT
		$('#colorDeficit').on('change',function () {
			if(!this.value) {
				app.save('colorDeficit','#E54B1D');
				$('#colorDeficit').spectrum({ move: function(color) { app.save('colorDeficit',color); app.updateColorPicker(); }, color: app.read('colorDeficit'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerDeficit' });
			} else {
				app.save('colorDeficit',$('#colorDeficit').val());
			}
			app.updateColorPicker();
		});
		//BALANCED
		$('#colorBalanced').on('change',function () {
			if(!this.value) {
				app.save('colorBalanced','#007AFF');
				$('#colorBalanced').spectrum({ move: function(color) { app.save('colorBalanced',color); app.updateColorPicker(); }, color: app.read('colorBalanced'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerBalanced' });
			} else {
				app.save('colorBalanced',$('#colorBalanced').val());
			}
			app.updateColorPicker();
		});
		//SURPLUS
		$('#colorSurplus').on('change',function () {
			if(!this.value) {
				app.save('colorSurplus','#2DB454');
				$('#colorSurplus').spectrum({ move: function(color) { app.save('colorSurplus',color); app.updateColorPicker(); }, color: app.read('colorSurplus'), allowEmpty: true, preferredFormat: 'hex', chooseText: LANG.OK[lang], cancelText: LANG.CANCEL[lang], containerClassName: 'colorPickerInput pickerSurplus' });
			} else {
				app.save('colorSurplus',$('#colorSurplus').val());
			}
			app.updateColorPicker();
		});
		/////////////////////
		// CORE VALIDATION //
		/////////////////////
		app.handlers.validate('#appLimit1',{minValue: 100, defaultValue: 600},'','','',function() {
			app.save('config_limit_1',$('#appLimit1').val()*-1);
		});
		app.handlers.validate('#appLimit2',{minValue: 100, defaultValue: 600},'','','',function() {
			app.save('config_limit_2',$('#appLimit2').val());
		});
		//////////////
		// TAP BLUR //
		//////////////
		$('#appLimit').on(touchend,function(evt) {
			evt.stopPropagation();
			if($('#appLimit1').is(':focus') || $('#appLimit2').is(':focus')) {
				if(evt.target.id != 'appLimit1' && evt.target.id != 'appLimit2') {
					evt.preventDefault();
				}
			}
			if(evt.target.id != 'appLimit1' && evt.target.id != 'appLimit2' && evt.target.id != '') {
				$('#appLimit1').blur();
				$('#appLimit2').blur();
				$('.sp-choose').click();
			}
		});
	};
	/////////////
	// CONFIRM //
	/////////////
	var appLimitConfirm = function() {
		$('#appLimit1').blur();
		$('#appLimit2').blur();
		$('.sp-choose').click();
		return true;
	};
	/////////////////
	// CALL WINDOW //
	/////////////////
	getNewWindow(LANG.CALORIC_THRESHOLD[lang],appLimitHtml,appLimitHandlers,appLimitConfirm,appLimitConfirm);
}
//##/////////////##//
//## GET ELAPSED ##//
//##/////////////##//
function getElapsed(swap) {
	'use strict';
	if(!app.read('app_last_tab','tab1')) { return false; }
	if($('body').hasClass('newwindow'))  { return false; }
	////////////////
	// FIRST LOAD //
	////////////////
	app.define('config_swap',1);
	//////////////
	// HOT SWAP //
	//////////////
	if(swap == 'next') {
		     if(app.read('config_swap',1)) { app.save('config_swap',2); swap = 2; }
		else if(app.read('config_swap',2)) { app.save('config_swap',3); swap = 3; }
		else if(app.read('config_swap',3)) { app.save('config_swap',1); swap = 1; }
	}
	//////////
	// VARS //
	//////////
	swap = app.read('config_swap');
	var swapData;
	var swapSub;
	//////////////////
	// ELAPSED TIME //
	//////////////////
	if(swap == 1) {
		//IF RUNNING
		var swapStarted = app.read('appStatus','running') ? app.read('config_start_time') : app.now();
		swapData = dateDiff(swapStarted,app.now());
		swapSub  = LANG.ELAPSED_TIME[lang];
	///////////////////
	// RELATIVE TIME //
	///////////////////
	} else if(swap == 2) {
		var nowDate = app.now();
		var eqRatio = (60*60*24*1000) / app.get.kcals();
		var eqDiff  = nowDate - Math.floor(Math.abs(timerKcals*eqRatio));
		//DATA
		swapData = dateDiff(eqDiff,nowDate);
		swapSub  = LANG.RELATIVE_TIME[lang];
	/////////////////
	// WEIGHT LOSS //
	/////////////////
	} else if(swap == 3) {
		var weightLoss;
		var weightLossUnit = app.read('calcForm#pA6H','kilograms') ? LANG.KG[lang] : LANG.LB[lang];
		if(app.read('appStatus','running')) {
			weightLoss = ((((app.read('calcForm#pA6G')) * ((app.now() - (app.read('config_start_time'))) / (60*60*24*7))) / 1000)).toFixed(6);
			weightLoss = weightLoss.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		} else {
			weightLoss = '0.000,000';
		}
		//DATA
		swapData = weightLoss + ' ' + weightLossUnit;
		swapSub  = LANG.WEIGHT_LOSS[lang];
	}
	////////////////////
	// SHRINK ELIPSIS //
	////////////////////
	if(swap == 1 || swap == 2) {
		//selective shrink
		if(swapData) {
			swapData = swapData.split(LANG.AGO[lang]).join('').split(LANG.PREAGO[lang]).join('');
			if(swapData.length > 20 && $('body').width() <= 360) {
				swapData = swapData.replace(LANG.MINUTES[lang],LANG.MIN[lang]);
				swapData = swapData.replace(LANG.MINUTE[lang],LANG.MIN[lang]);
				swapData = trim(swapData.replace('.',''));
				if((/min/).test(swapData)) {
					swapData = swapData + '.';
				}
			}
		}
	}
	/////////////////////
 	// UPDATE CONTENTS //
	/////////////////////
	if($('#appStatusElapsed div p').html() != swapData) {
		$('#appStatusElapsed div p').html2(swapData);
	}
	if($('#appStatusElapsed div p').html() != swapSub) {
		$('#appStatusElapsed div span').html2(swapSub);
		$('#elapsedIndicators div').removeClass('activeSwap');
		$('#ind' + swap).addClass('activeSwap');
	}
}
//##////////////////##//
//## GET ENTRY EDIT ##//
//##////////////////##//
function getEntryEdit(eid) {
	'use strict';
	//swap food/exercise button
	getEntry(eid,function(data) {
		//////////////
		// HANDLERS //
		//////////////
		var getEntryHandler = function() {
			//food/exercise
			if($('#getEntryTitle').val() >= 0) {
				$('#divEntryTitle').addClass('food');
			} else {
				$('#getEntryTitle').val( Math.abs($('#getEntryTitle').val()) );
				$('#divEntryTitle').addClass('exercise');
			}
			//MOBISCROLL
			if($.mobiscroll) {
			$('#getEntryDate').mobiscroll().datetime({
				preset: 'datetime',
				minDate: new Date((new Date().getFullYear() - 1),1,1, 0, 0),
				maxDate: new Date(),
				theme: 'ios7',
				lang: 'en',
		       	dateFormat: 'yyyy/mm/dd',
        		dateOrder:  'dd MM yy',
		        timeWheels: 'HH:ii',
		        timeFormat: 'HH:ii',
				setText: LANG.OK[lang].capitalize(),
				closeText: LANG.CANCEL[lang].capitalize(),
				cancelText: LANG.CANCEL[lang].capitalize(),
				dayText: LANG.DAY[lang].capitalize(),
				monthText: LANG.MONTH[lang].capitalize(),
				yearText: LANG.YEAR[lang].capitalize(),
				hourText: LANG.HOURS[lang].capitalize(),
				minuteText: LANG.MINUTES[lang].capitalize(),
				display: 'modal',
				stepMinute: 1,
				animate: 'none',
				monthNames: LANG.MONTH_SHORT[lang].split(', '),
				monthNamesShort: LANG.MONTH_SHORT[lang].split(', '),
				mode: 'scroller',
				showLabel: true,
				useShortLabels: true
			});
			}
			//SET
			$('#getEntryDate').scroller('setDate',new Date(parseInt($('#getEntryDate').val())), true);
			//SAVE IF CHANGED
			$('#getEntryDate').on('change',function() {
				$('#getEntryDateHidden').val(Date.parse($(this).val()));
			});
			$('#getEntryDate').on(touchstart,function(evt) {
				evt.preventDefault();
				evt.stopPropagation();
				// HARD PROPAGATION FIX
				if($('#getEntryWrapper input').is(':focus')) {
					kickDown();
					$('#getEntryWrapper input').blur();
					$('#getEntryWrapper input').css2('pointer-events','none');
					setTimeout(function() {
						$('#getEntryDate').click();
						$('#getEntryWrapper input').css2('pointer-events','auto');
					},900);
				} else {
					$('#getEntryDate').click();
				}
			});
			$('#getEntryDate').on('focus',function() {
				$('#getEntryDate').blur();
			});
			/////////////////////////
			// backport validation //
			/////////////////////////
			app.handlers.validate('#getEntryTitle',{allowDots:false,maxValue:9999,maxLength:4});
			app.handlers.validate('#getEntryPro',{allowDots:true,maxValue:999,maxLength:7});
			app.handlers.validate('#getEntryCar',{allowDots:true,maxValue:999,maxLength:7});
			app.handlers.validate('#getEntryFat',{allowDots:true,maxValue:999,maxLength:7});
			app.handlers.validate('#getEntryFii',{allowDots:true,maxValue:999,maxLength:7});
			app.handlers.validate('#getEntrySug',{allowDots:true,maxValue:999,maxLength:7});
			app.handlers.validate('#getEntrySod',{allowDots:true,maxValue:9999,maxLength:8});
			//////////////////////
			// BASIC VALIDATION //
			//////////////////////
			$('#getEntryTitle,#getEntryPro,#getEntryCar,#getEntryFat,#getEntryFii,#getEntrySug,#getEntrySod').on('blur',function(evt) {
				if(evt.target.id == 'getEntryTitle') {
					$(this).val(parseInt($(this).val()));
				} else {
					$(this).val(parseFloat($(this).val()));
				}
				if($(this).val() == '')   { $(this).val(0); }
				if($(this).val() == 0)    { $(this).val(0); }
				if(isNaN($(this).val()))  { $(this).val(0); }
				if(evt.target.id != 'getEntryTitle') {
					if($(this).val() < 0) { $(this).val(0); }
				}
				if($(this).val() > 9999.99)  { $(this).val(9999); }
			});
			$('#getEntryTitle,#getEntryPro,#getEntryCar,#getEntryFat,#getEntryFii,#getEntrySug,#getEntrySod').on('focus', function(evt) {
				if($(this).val() == 0)    { $(this).val(''); }
			});
			//////////////
			// TAP BLUR //
			//////////////
			$('#newWindow').on(touchend,function(evt) {
				if(!app.device.desktop) {
					evt.stopPropagation();
				}
				if($('#getEntryWrapper input').is(':focus')) {
					if((evt.target.id).indexOf('getEntry') === -1) {
						evt.preventDefault();
					}
				}
				if((evt.target.id).indexOf('getEntry') === -1) {
					kickDown();
					//HARD PROPAGATION FIX
					$('#getEntryWrapper input').blur();
					$('#getEntryWrapper input').css2('pointer-events','none');
					setTimeout(function() {
						$('#getEntryWrapper input').css2('pointer-events','auto');
					},300);
				}
			});
			////////////////
			// ADD/REMOVE //
			////////////////
			app.handlers.addRemove('#getEntryTitle',0,9999,'int');
			app.handlers.addRemove('#getEntryPro',0,999,'dec');
			app.handlers.addRemove('#getEntryCar',0,999,'dec');
			app.handlers.addRemove('#getEntryFat',0,999,'dec');
			app.handlers.addRemove('#getEntryFii',0,999,'dec');
			app.handlers.addRemove('#getEntrySug',0,999,'dec');
			app.handlers.addRemove('#getEntrySod',0,9999,'dec');
		};
		/////////////
		// CONFIRM //
		/////////////
		var getEntrySave = function() {
			var FoE = $('#divEntryTitle').hasClass('exercise') ? -1 : 1;
			//WRITE
			updateEntry({
				id:parseInt($('#getEntryId').val()),
				title:($('#getEntryTitle').val() * FoE)            + '',
				body:$('#getEntryBody').val().split('  ').join(' ').split('  ').join(' ').split('  ').join(' ') + '',
				published:parseInt($('#getEntryDateHidden').val()) + '',
				pro:parseFloat($('#getEntryPro').val())            + '',
				car:parseFloat($('#getEntryCar').val())            + '',
				fat:parseFloat($('#getEntryFat').val())            + '',
				fii:parseFloat($('#getEntryFii').val())            + '',
				sug:parseFloat($('#getEntrySug').val())            + '',
				sod:parseFloat($('#getEntrySod').val())            + '',
				info: $('#t' + parseInt($('#getEntryDateHidden').val()) ).hasClass('planned') ? 'planned' : ''
			},function(removeId,insertDate) {
				//REFRESH DATA
				setTimeout(function() {
					//remove by id
					$('#' + removeId).remove();
					//reinsert by date
					app.exec.updateEntries(insertDate);
					updateEntriesSum();
				}, 25);
			});
			return true;
		};
		//////////
		// HTML //
		//////////
		var pro = data.pro;
		var car = data.car;
		var fat = data.fat;
		var fii = data.fii;
		var sug = data.sug;
		var sod = data.sod;
		if(!data.pro || isNaN(pro)) { pro = 0; }
		if(!data.car || isNaN(car)) { car = 0; }
		if(!data.fat || isNaN(fat)) { fat = 0; }
		if(!data.fii || isNaN(fii)) { fii = 0; }
		if(!data.sug || isNaN(sug)) { sug = 0; }
		if(!data.sod || isNaN(sod)) { sod = 0; }
		var getEntryHtml = '\
			<div id="getEntryWrapper">\
				<div id="divEntryBody"><span>'  + LANG.ADD_NAME[lang]                  + '</span><input type="text"   id="getEntryBody"  value="' + data.body      + '" /></div>\
				<div id="divEntryTitle"><span>' + LANG.KCAL[lang]                      + '</span><input type="number" id="getEntryTitle" value="' + data.title     + '" /></div>\
				<div id="divEntryPro"><span>'   + LANG.PRO[lang] + ' <strong>(' + LANG.G[lang].toUpperCase() + ')</strong></span><input type="number" id="getEntryPro"   value="' + pro            + '" /></div>\
				<div id="divEntryCar"><span>'   + LANG.CAR[lang]                       + '</span><input type="number" id="getEntryCar"   value="' + car            + '" /></div>\
				<div id="divEntryFat"><span>'   + LANG.FAT[lang]                       + '</span><input type="number" id="getEntryFat"   value="' + fat            + '" /></div>\
				<div id="divEntryFii"><span>'   + LANG.FIB[lang]                       + '</span><input type="number" id="getEntryFii"   value="' + fii            + '" /></div>\
				<div id="divEntrySug"><span>'   + LANG.SUG[lang]                       + '</span><input type="number" id="getEntrySug"   value="' + sug            + '" /></div>\
				<div id="divEntrySod"><span>'   + LANG.SOD[lang] + ' <strong>(' + LANG.MG[lang].toUpperCase() + ')</strong></span><input type="number" id="getEntrySod" value="' + sod            + '" /></div>\
				<div id="divEntryDate"><span>'  + LANG.DATE[lang]                      + '</span><input type="text"   id="getEntryDate"  value="' + data.published + '" /></div>\
				<input type="hidden" id="getEntryId"         value="'                  + data.id        + '" />\
				<input type="hidden" id="getEntryDateHidden" value="' + data.published + '" />\
			</div>';
		/////////////////
		// CALL WINDOW //
		/////////////////
		getNewWindow(LANG.EDIT[lang],getEntryHtml,getEntryHandler,getEntrySave);
	});
}
//##///////////////##//
//## ADVANCED MENU ##//
//##///////////////##//
function buildAdvancedMenu() {
	'use strict';
	$('#advancedMenuWrapper').remove();
	$('body').append2('\
	<div id="advancedMenuWrapper">\
		<div id="advancedMenuHeader">\
			<div id="advBackButton"></div>\
			<div id="advancedMenuTitle">' + LANG.SETTINGS_ADVANCED[lang] + '</div>\
		</div>\
		<div id="advancedMenu"></div>\
	</div>');
	$('#advancedMenuWrapper').hide();
	//WRAPPER HEIGHT
	$('#advancedMenuWrapper').css2('top',($('#appHeader').height()) + 'px');
	$('#advancedMenuWrapper').css2('bottom',($('#appFooter').height()) + 'px');
	$('#advancedMenuWrapper').height($('#appContent').height());
	///////////////
	// CORE HTML //
	///////////////
	$('#advancedMenu').html2('\
	<ul>\
		<li id="advancedAutoUpdate">' + LANG.AUTO_UPDATE[lang]     + '</li>\
		<li id="advancedCounterMode"><p class="contentTitle">'     + LANG.COUNTING_MODE[lang] + '<span><strong>' +
		((app.read('app_counter_mode','progressive') ? LANG.PROGRESSIVE[lang] : LANG.REGRESSIVE[lang])).capitalize() + '</strong> (' +
		((app.read('app_counter_mode','progressive') ? LANG.CALORIES_AVAILABLE[lang] : LANG.CALORIE_USAGE[lang])).toLowerCase() +
		')</span></p></li>\
		<li id="advancedZoom"><span id="zoomx1"></span><span id="zoomx2"></span><span id="zoomx3"></span>' + LANG.ZOOM[lang] + '</li>\
		<li id="advancedDatabase">\
			<div class="contentToggleTitle">\
				<p class="contentTitle" id="contentToggleTitle">' + LANG.DATABASE[lang] + '<span>' + LANG.APP_STORAGE[lang] + '</span></p>\
				<div id="tapSwitchDB">\
					<div id="optLocalStorage">' + 'localStorage' + ' </div>\
					<div id="optWebSQL">'       + 'webSQL'       + ' </div>\
					<div id="optIndexedDB">'    + 'indexedDB'    + ' </div>\
				</div>\
			</div>\
		</li>\
	</ul>\
	<ul>\
		<li id="advancedChangelog">'   + LANG.CHANGELOG[lang]      + '</li>\
		<li id="advancedReview">'      + LANG.REVIEW[lang]         + '</li>\
		<li id="advancedSuggestion">'  + LANG.SUGGESTION_BOX[lang] + '</li>\
		<li id="advancedAbout">'       + LANG.ABOUT[lang]          + '</li>\
	</ul>\
	<ul>\
		<li id="advancedReload">' + LANG.REBUILD_FOOD_DB[lang] + '</li>\
	</ul>\
	<ul>\
		<li id="advancedReset">' + LANG.SETTINGS_WIPE[lang] + '</li>\
	</ul>\
	');
	//PARSE DB CONFIG
	if(!app.db.webSQL)		{ $('#optWebSQL').hide();       }
	if(!app.db.indexedDB)	{ $('#optIndexedDB').hide();    }
	if(!app.db.localStorage){ $('#optLocalStorage').hide(); }
	//HIDE UNSTABLE
	if((app.device.ios && !app.device.ios10) || app.device.blackberry || app.incognito || app.device.safari) { 
		$('#optIndexedDB').hide();
	}
	//GET CURRENT ENGINE
	if (localforage._driver == 'asyncStorage')			{ app.save('app_database','asyncStorage'); $('#optIndexedDB').addClass('toggle');	} 
	if (localforage._driver == 'webSQLStorage')			{ app.save('app_database','webSQLStorage'); $('#optWebSQL').addClass('toggle');		} 
	if (localforage._driver == 'localStorageWrapper')	{ app.save('app_database','localStorageWrapper'); $('#optLocalStorage').addClass('toggle');	}
	//PARSE DB STYLE
	function styleResetDB() {
		$('#optIndexedDB').removeClass('toggle');
		$('#optWebSQL').removeClass('toggle');		
		$('#optLocalStorage').removeClass('toggle');
		if (app.read('app_database','asyncStorage'))		{ $('#optIndexedDB').addClass('toggle');	} 
		if (app.read('app_database','webSQLStorage'))		{ $('#optWebSQL').addClass('toggle');		} 
		if (app.read('app_database','localStorageWrapper')) { $('#optLocalStorage').addClass('toggle');	}
	}
	styleResetDB();
	//CONTENT HEIGHT
	$('#advancedMenu').css2('top',($('#advancedMenuHeader').height()+1) + 'px');
	$('#advancedMenuWrapper').height($('#appContent').height());
	//SHOW
	app.handlers.fade(1,'#advancedMenuWrapper',function() {
		getNiceScroll('#advancedMenu');
		//////////////////
		// LIST HANDLER //
		//////////////////
		//LIST CLOSER HANDLER
		app.handlers.activeRow('#advBackButton','button',function() {
			app.handlers.fade(0,'#advancedMenuWrapper');
		});
	//ADD ACTIVE
	//$('#advancedMenu li').on(touchstart,function(evt) {
	//	if(!(/checkbox/).test($(this).html())) {
	//		$(this).addClass('activeRow');
	//	}
	//});
	//REMOVE ACTIVE
	//$('#advancedMenu, #advancedMenu li').on(touchend + ' ' + touchmove + ' mouseout scroll',function(evt) {
	//	$('.activeRow').removeClass('activeRow');
	//});
	//#//////////////////////#//
	//#// DB ENGINE PICKER //#//
	//#//////////////////////#//
	// INDEXEDDB ~ asyncStorage //
	$('#optIndexedDB').on(tap,function(evt) {
		//STYLE
		$('#optIndexedDB, #optWebSQL, #optLocalStorage').removeClass('toggle');
		$('#optIndexedDB').addClass('toggle');
		//REBOOT CONFIRM
		app.timeout('rebootconfirm',1200,function() {
			//FILTER
			if(app.read('app_database','asyncStorage')) { app.timeout('rebootconfirm','clear'); return; }
			//SAVE
			app.save('app_database','asyncStorage');
			app.save('foodDbPending',true);
			styleResetDB();
			//DIALOG
			appConfirm(LANG.DATABASE_UPDATE[lang], LANG.RESTART_NOW[lang], function(button) { if(button === 2) { afterHide(); }}, LANG.OK[lang], LANG.CANCEL[lang]);
		});
	});
	// WEBSQL ~ webSQLStorage //
	$('#optWebSQL').on(tap,function(evt) {
		//STYLE
		$('#optIndexedDB, #optWebSQL, #optLocalStorage').removeClass('toggle');
		$('#optWebSQL').addClass('toggle');
		//REBOOT CONFIRM
		app.timeout('rebootconfirm',1200,function() {
			//FILTER
			if(app.read('app_database','webSQLStorage')) { app.timeout('rebootconfirm','clear'); return; }
			//SAVE
			app.save('app_database','webSQLStorage');
			app.save('foodDbPending',true);
			styleResetDB();
			//DIALOG
			appConfirm(LANG.DATABASE_UPDATE[lang], LANG.RESTART_NOW[lang], function(button) { if(button === 2) { afterHide(); }}, LANG.OK[lang], LANG.CANCEL[lang]);
		});
	});
	// LOCALSTORAGE ~ localStorageWrapper //
	$('#optLocalStorage').on(tap,function(evt) {
		//STYLE
		$('#optIndexedDB, #optWebSQL, #optLocalStorage').removeClass('toggle');
		$('#optLocalStorage').addClass('toggle');
		//REBOOT CONFIRM
		app.timeout('rebootconfirm',1200,function() {
			//FILTER
			if(app.read('app_database','localStorageWrapper')) { app.timeout('rebootconfirm','clear'); return; }
			//SAVE
			app.save('app_database','localStorageWrapper');
			app.save('foodDbPending',true);
			styleResetDB();
			//DIALOG
			appConfirm(LANG.DATABASE_UPDATE[lang], LANG.RESTART_NOW[lang], function(button) { if(button === 2) { afterHide(); }}, LANG.OK[lang], LANG.CANCEL[lang]);
		});
	});
	//#////////////#//
	//# CHANGE LOG #//
	//#////////////#//
	app.parseLogContent = function (logFile) {
		if (!logFile) {
			return;
		}
		var logContent = '';
		//////////
		// HTML //
		//////////
		$.each((logFile.split('\n')), function (l, logLine) {
			if (logLine.indexOf('##') !== -1 || logLine.length < 4) {
				//logContent.push('<p>' + logLine + '</p>');
			} else if (logLine.indexOf('#') !== -1) {
				//UPCOMING FEATURES
				logLine = (trim(logLine.replace('#', ''))).split(' ');
				var versionStr  = (/Upcoming/i.test(logLine)) ? '' : 'Version ';
				var releaseDate = (/Upcoming/i.test(logLine)) ? '' : logLine[1].replace('[', '').replace(']', '');
				logContent += '<p>' + versionStr + ' ' + logLine[0] + '<span>' + releaseDate + '</span></p>';
			} else {
				if (/--/i.test(logLine)) {
					if (app.dev) {
						logContent += logLine + '<br />';
					}
				} else {
					logContent += logLine + '<br />';
				}
			}
		});
		logContent = '<div id="logContent">' + logContent + '</div>';
		//////////////
		// HANDLERS //
		//////////////
		var logHandler = function () {
			setTimeout(function () {
				$('#newWindowWrapper').on(transitionend, function () {
					$('#advancedMenuWrapper').hide();
				});
				if(app.device.ios) {
					$('#logContent').on(touchstart, function (evt) {
						evt.stopPropagation();
					});
				}
			}, 1);
		};
		////////////
		// CLOSER //
		////////////
		var logCloser = function () {
			$('#advancedMenuWrapper').show();
		};
		/////////////////
		// CALL WINDOW //
		/////////////////
		getNewWindow(LANG.CHANGELOG[lang], logContent, logHandler, '', logCloser);
	};
	//GET VERSION.TXT WITH FALLBACK
	app.handlers.activeRow('#advancedChangelog','activeRow',function(evt) {
		$.ajax({type: 'GET', dataType: 'text', url: app.https + 'chronoburn.com/' + 'version.txt',
			error: function(xhr, statusText) {
				//RETRY LOCAL
				$.ajax({type: 'GET', dataType: 'text', url: 'version.txt',
					error: function(xhr, statusText) {
						alert('Error reading file','Please connect to the internet and try again.');
					},
					success: function(logFile) {
						app.parseLogContent(logFile);
					}
				});
			},
			success: function(logFile) {
				app.parseLogContent(logFile);
			}
		});
	});
	//#///////#//
	//# ABOUT #//
	//#///////#//
	app.handlers.activeRow('#advancedAbout','activeRow',function(evt) {
		app.about();
	});
	//#//////#//
	//# ZOOM #//
	//#//////#//
	$('#zoomx1').on(tap,function(evt) {
		app.zoom(1);
	});
	$('#zoomx2').on(tap,function(evt) {
		app.zoom(2);
	});
	$('#zoomx3').on(tap,function(evt) {
		app.zoom(3);
	});
	//#/////////#//
	//# CONTACT #//
	//#/////////#//
	app.handlers.activeRow('#advancedContact','activeRow',function(evt) {
		//app.url('mailto:cancian@chronoburn.com?Subject=ChronoBurn%20-%20Support%20(' + app.get.platform(1) + ')');
		window.location.href = 'mailto:cancian@chronoburn.com?Subject=ChronoBurn%20-%20Support%20(' + app.get.platform(1) + ')';
	});
	//#////////////////#//
	//# SUGGESTION BOX #//
	//#////////////////#//
	app.handlers.activeRow('#advancedSuggestion','activeRow',function(evt) {
		var suggestionBoxHtml     = '<div id="suggestionBox"><label for="usrMail" class="usrMail">E-mail:</label><input type="text" name="usrMail" id="usrMail"><label for="usrMsg" class="usrMsg">Message:</label><textarea name="usrMsg" id="usrMsg"></textarea></div>';
		var suggestionBoxHandlers = function() {
			$('#saveButton').html2('Send');
			$('#saveButton').css2('text-transform','capitalize');
			//
			$('#suggestionBox').on(touchstart,function(evt) {
				if(evt.target.id === 'suggestionBox') {
					$('#usrMail').trigger('blur');
					$('#usrMsg').trigger('blur');
				}
			});
			//prevent propagation focus
			$('#usrMail').css2('pointer-events','none');
			$('#usrMsg').css2('pointer-events','none');
			setTimeout(function() {
				$('#usrMail').css2('pointer-events','auto');
				$('#usrMsg').css2('pointer-events','auto');
			},400);
		};
		/////////////
		// CONFIRM //
		/////////////
		var suggestionBoxConfirm  = function() {
			var result = false;
			//MSG
			if((trim($('#usrMsg').val())).length > 1) {
				$('.usrMsg').css2('color','#000');
			} else {
				$('.usrMsg').css2('color','#c30');
			}
			//MAIL
			if(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test($('#usrMail').val())) {
				$('.usrMail').css2('color','#000');
			} else {
				$('.usrMail').css2('color','#c30');
			}
			//VALIDATE
			if(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test($('#usrMail').val()) && (trim($('#usrMsg').val())).length > 1) {
				//send mail
				$('#saveButton').css2('pointer-events','none');
				$('#saveButton').css2('color','#ccc');
				var usrMailStore = $('#usrMail').val();
				var usrMsgStore = $('#usrMsg').val();
				app.sendmail(usrMailStore,usrMsgStore,function(result) {
					if(result == true) {
						alert('Submitted Successfully', 'Thanks for the feedback.');
						$('#saveButton').css2('pointer-events','auto');
						$(document).trigger('backbutton');
						return true;
					} else {
						alert('Error submitting', 'Please check your internet connection and try again.');
						$('#saveButton').css2('pointer-events','auto');
						$('#saveButton').css2('color','#007aff');
						return false;
					}
				});
			} else {
				setTimeout(function() {
					alert(LANG.BLANK_FIELD_TITLE[lang], LANG.BLANK_FIELD_DIALOG[lang]);
				},50);
				return false;
			}
		};
		//
		var suggestionBoxClose = function() {};
		getNewWindow('Suggestion Box',suggestionBoxHtml,suggestionBoxHandlers,suggestionBoxConfirm,suggestionBoxClose);
	});
	//#///////////////////////////#//
	//# ALTERNATIVE DEBUG ENABLER #//
	//#///////////////////////////#//
	$('#advancedReload').on(hold, function (evt) {
		if(app.read('config_debug','active')) {
			app.remove('config_debug');
			afterHide();
		} else {
			app.save('config_debug','active');
			afterHide();
		}
	});
	//#////////////////#//
	//# RELOAD FOOD DB #//
	//#////////////////#//
	app.handlers.activeRow('#advancedReload','activeRow',function(evt) {
		//SHOW DIALOG
		appConfirm(LANG.REBUILD_FOOD_DB[lang], LANG.ARE_YOU_SURE[lang], function(button) {
			if(button === 2) {
				app.remove('foodDbLoaded');
				app.remove('startLock');
				updateFoodDb();
			}
		}, LANG.OK[lang], LANG.CANCEL[lang]);
	});
	//#////////////////#//
	//# RESET SETTINGS #//
	//#////////////////#//
	app.handlers.activeRow('#advancedReset','activeRow',function(evt) {
		//SHOW DIALOG
		appConfirm(LANG.SETTINGS_WIPE_TITLE[lang], LANG.ARE_YOU_SURE[lang], function(button) {
			if(button === 2) {
				deSetup();
			}
		}, LANG.OK[lang], LANG.CANCEL[lang]);
	});
	//#//////////////////////////#//
	//# GENERIC CHECKBOX HANDLER #//
	//#//////////////////////////#//
	$('#advancedMenu li').on(tap,function(evt) {
		if((/checkbox/).test($('#' + evt.target.id).html())) {
			if($('input[type=checkbox]', '#' + evt.target.id).prop('checked') == true) {
				$('input[type=checkbox]', '#' + evt.target.id).prop('checked',false);
			} else {
				$('input[type=checkbox]', '#' + evt.target.id).prop('checked',true);
			}
			$('input[type=checkbox]', '#' + evt.target.id).trigger('change');
		}
	});
	});
	//#////////#//
	//# REVIEW #//
	//#////////#//
	if(app.device.ios || app.device.android || app.device.wp8 || app.device.windows8 || app.device.msapp || app.device.firefoxos || app.device.osxapp || app.device.chromeos || app.device.blackberry || app.device.playbook || app.device.tizen) {
		app.handlers.activeRow('#advancedReview','activeRow',function(evt) {
			app.url();
		});
	} else {
		$('#advancedReview').remove();
	}
	//#/////////////////////#//
	//# TOGGLE: AUTO UPDATE #//
	//#/////////////////////#//
	//read stored
	var isAUChecked = app.read('config_autoupdate','on') ? 'checked' : '';
	//append
	$('#advancedAutoUpdate').append2('\
		<div>\
			<span id="appAutoUpdateButton"></span>\
			<input id="appAutoUpdateToggle" class="toggle" type="checkbox" ' + isAUChecked + '>\
			<label for="appAutoUpdateToggle"></label>\
		</div>\
	');
	/////////////////////////
	// MANUAL RESTART ICON //
	/////////////////////////
	app.handlers.activeRow('#appAutoUpdateButton','button',function(evt) {
		appConfirm(LANG.APP_UPDATED[lang], LANG.RESTART_NOW[lang], function(button) {
			if(button === 2) {
				afterHide();
			}
		}, LANG.OK[lang], LANG.CANCEL[lang]);
	});
	//////////////////
	// read changes //
	//////////////////
	$('#appAutoUpdateToggle').on('change',function(evt) {
		if($('#appAutoUpdateToggle').prop('checked') == true) {
			app.save('config_autoupdate','on');
			var checkTimeout = app.dev? 0 : 2000;
			app.timeout('AutoUpdateToggle',checkTimeout,function() {
				if(app.read('config_autoupdate','on')) {
					buildRemoteSuperBlock('cached');
				}
			});
		} else {
			$('body').removeClass('loading');
			$('body').removeClass('uptodate');
			$('body').removeClass('pending');
			$('body').removeClass('corrupted');
			app.save('config_autoupdate','off');
		}
	});
	//#//////////////////////#//
	//# TOGGLE: COUNTER MODE #//
	//#//////////////////////#//
	//read stored
	var storedCounterMode = app.read('app_counter_mode','progressive') ? 'checked' : '';
	//append
	$('#advancedCounterMode').append2('\
		<div>\
			<span id="appCounterModeButton"></span>\
			<input id="appCounterModeToggle" class="toggle" type="checkbox" ' + storedCounterMode + '>\
			<label for="appCounterModeToggle"></label>\
		</div>\
	');
	//////////////////
	// READ CHANGES //
	//////////////////
	$('#appCounterModeToggle').on('change',function(evt) {
		if($('#appCounterModeToggle').prop('checked') == true) {
			app.save('app_counter_mode','progressive');
			//DOM
			$('#advancedCounterMode .contentTitle span').html2('<strong>' + (LANG.PROGRESSIVE[lang]).capitalize() + ' </strong>(' + (LANG.CALORIES_AVAILABLE[lang]).toLowerCase() + ')');
		} else {
			app.save('app_counter_mode','regressive');
			//DOM
			$('#advancedCounterMode .contentTitle span').html2('<strong>' + (LANG.REGRESSIVE[lang]).capitalize()      + ' </strong>(' + (LANG.CALORIE_USAGE[lang]).toLowerCase()  + ')');
		}
		setPush();
	});
	/////////////////////
	// HIDE AUTOUPDATE //
	/////////////////////
	if(app.device.osxapp && reviewMode === true) {
		$('#advancedAutoUpdate').hide();	
	}

}
//##//////////////////##//
//## GET CATEGORY~IES ##//
//##//////////////////##//
function getCategory(catId, callback) {
	'use strict';
	//var startCat = app.now();
	var orType = '';
	if (catId == '9999') {
		orType = 'food';
	}
	if (catId == '0000') {
		orType = 'exercise';
	}
	var rowsArray = [];
	var i = appRows.food.length;
	////////////
	// RECENT //
	////////////
	if (catId == '0001') {
		var recentArray = app.read('app_recent_items', '', 'object');
		while (i--) {
			if (recentArray.length > 0 && appRows.food[i]) {
				if (recentArray.contains('#' + appRows.food[i].id + '#')) {
					var recentRow = appRows.food[i];
					for (var r = 0, len = recentArray.length; r < len; r++) {
						if ('#' + recentRow.id + '#' == recentArray[r].id) {
							recentRow.time = recentArray[r].time;
							rowsArray.push(recentRow);
							break;
						}
					}
				}
			}
		}
		callback(rowsArray.sortbyattr('time', 'asc'));
		//////////////////
		// REGULAR DUMP //
		//////////////////
	} else {
		while (i--) {
			if (appRows.food[i]) {
				if (appRows.food[i].type === catId || appRows.food[i].type === orType) {
					rowsArray.push(appRows.food[i]);
				}
			}
		}
		callback(rowsArray.sortbyattr('term', 'desc'));
	}
}
///////////////////
// CATLIST CACHE //
///////////////////
var catListCache;
function buildCatListMenu() {
	'use strict';
	//STARTLOCK
	var startLock = 1;
	//BUILD CONTENT ARRAY
	var helpTopics = sortObject(LANG.FOOD_CATEGORIES[lang]);
	var helpHtml = '';
	//CATLIST
	var h = helpTopics.length;
	while(h--) {
		helpHtml = helpHtml + '<li id="cat' + helpTopics[h][0] + '"><div>' + helpTopics[h][1] + '</div></li>';
	}
	//RECENT ROW
	helpHtml = '<li id="cat0001"><div>' + LANG.RECENT_ENTRIES[lang] + '</div></li>' + helpHtml;
	///////////////////////
	// INSERT TOPIC LIST //
	///////////////////////
	catListCache = helpHtml;
}
buildCatListMenu();
////////////////////
// CATLIST OPENER //
////////////////////
function getCatList(callback) {
	'use strict';
	//STARTLOCK
	var startLock = 1;
	///////////////////////
	// INSERT TOPIC LIST //
	///////////////////////
	$('#tabMyCatsBlock').html2('<ul>' + catListCache + '</ul>');
	/////////////
	// HANDLER //
	/////////////
	setTimeout(function() {
	niceResizer(300);
	app.handlers.activeRow('#foodList li','activeRow',function(targetId) {
		var catCode = targetId.replace('cat', '');
		//SQL QUERY
		getCategory(catCode, function(data) {
			///////////
			// TITLE //
			///////////
			var catListTitle = catCode == '0001' ? LANG.RECENT_ENTRIES[lang] : LANG.FOOD_CATEGORIES[lang][catCode];
			//add 'clear all'
			//////////
			// HTML //
			//////////
			var catListHtml = app.handlers.buildRows(data);
			/////////////
			// HANDLER //
			/////////////
			var catListHandler = function () {
				$('#tabMyCatsBlock').addClass('out');
				//$('#newWindow').addClass('firstLoad');
				//////////////////////
				// ENDSCROLL LOADER //
				//////////////////////
				if(catCode == '0001') {
					$('#newWindow').removeClass('firstLoad');
					$('#newWindow').addClass('recentLimit');
					$('#saveButton').html2('');
					$('#saveButton').addClass('removeAll');
				}
				var catLock = 0;
				var catTimer;
				setTimeout(function() {
				$('#newWindow').scroll(function() {
					clearTimeout(catTimer);
					catTimer = setTimeout(function() {
						if(catLock != 0)                           { return; }
						if(!$('#newWindow').hasClass('firstLoad')) { return; }
						if($('#newWindow').scrollTop() > 3000 || ($('#newWindow').scrollTop() > 300 && app.device.wp8)) {
							spinner('start','loadingMask');
							catLock = 1;
							setTimeout(function() {
								$('#newWindow').removeClass('firstLoad');
								spinner('stop','loadingMask');
								niceResizer();
								kickDown();
								return false;
							},300);
						}
					},300);
				});
				setTimeout(function () {
					$('#newWindowWrapper').on(transitionend, function() {
						setTimeout(function () {
							$('#pageSlideFood').hide();
						}, 100);
					});
				}, 0);
				//////////////////
				// MODAL CALLER //
				//////////////////
				setTimeout(function() {
					app.handlers.activeRow('#newWindow div.searcheable','activeOverflow',function(rowId) {
						getModalWindow(rowId);
					});
				}, 0);
				}, 0);
			};
			////////////
			// CLOSER //
			////////////
			var catListCloser = function () {
				//catMoveCount = 0;
				//catBlockTap = false;
				$('div.activeRow').removeClass('activeRow');
				if(app.device.wp8) {
					$('#tabMyCatsBlock').removeClass('out');
				}
				$('#pageSlideFood').show();
				setTimeout(function () {
					$('#tabMyCatsBlock').removeClass('out');
					niceResizer();
				}, 0);
			};
			/////////////
			// CONFIRM //
			/////////////
			var catListConfirm = (catCode == '0001') ? function() {
				app.timeout('catListConfirm',100,function() {
					appConfirm(LANG.CLEAR_ALL_TITLE[lang], LANG.ARE_YOU_SURE[lang],function(button) {
						if(button === 2) {
							$('#newWindow div.searcheable').remove();
							$('#newWindow').prepend2('<div class="searcheable noContent"><div><em>' + LANG.NO_ENTRIES[lang] + '</em></div></div>');
							app.remove('app_recent_items');
							setPush();
						}
					}, LANG.OK[lang], LANG.CANCEL[lang]);
				});
			} : '';
			/////////////////
			// CALL WINDOW //
			/////////////////
			getNewWindow(catListTitle, catListHtml, catListHandler, catListConfirm, catListCloser,'sideload','flush');
		});
	},function() {
		if(!$('#pageSlideFood').length || ($('#pageSlideFood').hasClass('busy') && !$('#pageSlideFood').hasClass('open'))) {
			return false;
		}
	});
	},0);
}
////////////////
// USERWINDOW //
////////////////
function getUserWindow() {
	'use strict';
	//////////
	// HTML //
	//////////
	var defaultUsrSet = (app.user[0] == 'mud_default') ? ' class="preset"' : '';
	var multiUserHtml = '<li id="mud_default" ' + defaultUsrSet + '>' + LANG.DEFAULT_USER[lang] + '</li>';
	//ADD
	if(app.read('app_userlist')) {
		//add new user line
		var userArray = app.read('app_userlist').split('\r\n');
		for (var i = 0; i < userArray.length; i++) {
			if(userArray[i]) {
				var usrId   = trim((userArray[i].split('###'))[0]);
				var usrName = trim((userArray[i].split('###'))[1]);
				var usrSet  = (app.user[0] === usrId) ? ' class="preset"' : '';
				multiUserHtml = multiUserHtml + '<li id="' + usrId + '" ' + usrSet + '>' + usrName + '</li>';
			}
		}
	}
	//WRAP
	multiUserHtml = '<div id="userWindow"><ul id="userList">' + multiUserHtml + '</ul></div>';
	//////////////
	// HANDLERS //
	//////////////
	var multiUserHandler = function() {
		$('#saveButton').html2('');
		$('#saveButton').addClass('addNewUser');

		var usrname = 'default user';

		app.handlers.activeRow('#userList li','set',function(objId) {
			if(objId == 'mud_default') {
				app.switchUser('mud_default');
			} else {
				app.switchUser(trim($('#' + objId).html()));
			}
		});
	};
	/////////////
	// CONFIRM //
	/////////////
	var multiUserConfirm = function() {
		app.prompt('Please enter your name', 'Harry Potter',function(input) {
			app.switchUser(input);
		});
	};
	////////////
	// CLOSER //
	////////////
	var multiUserCloser = function() {
		//
	};
	/////////////////
	// CALL WINDOW //
	/////////////////
	getNewWindow(app.user[1], multiUserHtml, multiUserHandler, multiUserConfirm, multiUserCloser,'','');
}

