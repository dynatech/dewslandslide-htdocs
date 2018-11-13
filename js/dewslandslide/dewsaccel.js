var end_date = new Date();
//var start_date = new Date(end_date.getMonth() + '-' + end_date.getDate() + '-' + end_date.getFullYear());
var start_date = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate()-10);

$(function() {
	$( "#datepicker" ).datepicker({ dateFormat: "yy-mm-dd" });
	$( "#datepicker" ).datepicker("setDate", start_date); 
});

$(function() {
	$( "#datepicker2" ).datepicker({ dateFormat: "yy-mm-dd" });
    $( "#datepicker2" ).datepicker("setDate", end_date);
});

function JSON2CSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

	var str = '';
	var line = '';

	if ($("#labels").is(':checked')) {
		var head = array[0];
		if ($("#quote").is(':checked')) {
			for (var index in array[0]) {
				var value = index + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
		} else {
			for (var index in array[0]) {
				line += index + ',';
			}
		}

		line = line.slice(0, -1);
		str += line + '\r\n';
	}

	for (var i = 0; i < array.length; i++) {
		var line = '';

		if ($("#quote").is(':checked')) {
			for (var index in array[i]) {
				var value = array[i][index] + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
		} else {
			for (var index in array[i]) {
				line += array[i][index] + ',';
			}
		}

		line = line.slice(0, -1);
		str += line + '\r\n';
	}
	return str;
	
}

function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}
	
function JSON2CSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

	var str = '';
	var line = '';
    var index_count = 0;

	if ($("#labels").is(':checked')) {
		var head = array[0];
		if ($("#quote").is(':checked')) {
			for (var index in array[0]) {
				var value = index + "";
				line += '"' + value.replace(/"/g, '""') + '",';
             
			}
		} else {
			for (var index in array[0]) {
                line += index + ',';
             
			}
		}

		line = line.slice(0, -1);
		str += line + '\n';
	}

	for (var i = 0; i < array.length; i++) {
		var line = '';
        var index_count = 0;
		if ($("#quote").is(':checked')) {
			for (var index in array[i]) {
				var value = array[i][index] + "";
				line += '"' + value.replace(/"/g, '""') + '",';
                index_count += 1;
                
             
			}
		} else {
			for (var index in array[i]) {
				line += array[i][index] + ',';
                index_count += 1;
			}
		}

		line = line.slice(0, -1);
		str += line + '\n';
	}
    return str;
	
}

var opts = {
	lines: 11, // The number of lines to draw
	length: 6, // The length of each line
	width: 3, // The line thickness
	radius: 8, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#000', // #rgb or #rrggbb or array of colors
	speed: 1.1, // Rounds per second
	trail: 58, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '50%', // Top position relative to parent
	left: '50%' // Left position relative to parent
};
//var target = document.getElementById('demodiv');

var rsiteid_prev = "";    
var g2 = 0;    
var gs = [];
var roll_period = 1;

function getXHR() {
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        return new XMLHttpRequest();
    }
    else { // code for IE6, IE5
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

function showAccel(frm) {	
	var rsiteid = '';

	var dfrom = document.getElementById("formDate").dateinput.value;
	var dto = document.getElementById("formDate").dateinput2.value;

	var urls = [
		"/temp/getSenslopeData.php?accel2&from=" + dfrom + "&to=" + dto + "&nid=" + frm.node.value + "&site=" + frm.sitegeneral.value + "&db=" + frm.dbase.value,
		"/ajax/generateFilteredData.php&start=" + dfrom + "&end=" + dto + "&node=" + frm.node.value + "&site=" + frm.sitegeneral.value + "&db=" + frm.dbase.value,
		"http://weather.asti.dost.gov.ph/home/index.php/api/data/" + rsiteid + "/from/" + dfrom + "/to/" + dto
	];
	
	var target = document.getElementById('accel-1-canvas');
    //var spinner = new Spinner(opts).spin();
    var spinner = new Spinner(opts).spin();
    target.appendChild(spinner.el);
	
	var vis = [
				[true, false, false, false],
				[false, true, false, false],
				[false, false, true, false],
				[false, false, false, true],
			];
					
	var xmlhttp_column = getXHR();
	var column_plot_range;
    xmlhttp_column.onreadystatechange = function () {
		if (xmlhttp_column.readyState == 4 && xmlhttp_column.status == 200) {
            
            var resp = xmlhttp_column.responseText;
            var siteData = JSON.parse(resp);
            if (siteData == null){
                spinner.stop();
                alert("No data retrieved. Please check input values.");
                return;
            } 
            
			var columndata = JSON2CSV(siteData);
           
			spinner.stop();
			
			var blockRedraw = false;
			
			var labels = [
				'X (LSB)',
				'Y (LSB)',
				'Z (LSB)',
				'M (Hz)',
			];
            gs = [];
			for (var i = 1; i <= 4; i++) {
				gs.push(
					new Dygraph(
					document.getElementById("accel-" + i + "-canvas"),
					columndata,
					{
						drawCallback: function(me, initial) {
							if (blockRedraw || initial) return;
							blockRedraw = true;
							column_plot_range = me.xAxisRange();
                            roll_period = me.rollPeriod();
							for (var j = 0; j < 4; j++) {
								if (gs[j] == me) continue;
								gs[j].updateOptions( {
									dateWindow: column_plot_range,
                                    rollPeriod: roll_period,
									visibility: vis[j],
								} 
								);
							}
							
							if (g2!=0){
								g2.updateOptions({
									dateWindow: column_plot_range,
								});
							}
							blockRedraw = false;
						},
						visibility: vis[i-1],
						ylabel: labels[i-1],							
						labelsDiv: '',
						drawXAxis: false,
						labels: ['timestamp','X','Y','Z','M'],
						strokeWidth: 1.5,
						fillGraph: true,
						showRoller: true,
                        rollPeriod: roll_period,
					}
					)
				);
			}	
		}
	};
	xmlhttp_column.open("GET",urls[0],true);
	xmlhttp_column.send();
}	

function showAndClearField(frm){
  if (frm.dateinput.value == "")
	  alert("Hey! You didn't enter anything!");
  else
	  alert("The field contains the text: " + frm.dateinput.value);
  frm.dateinput.value = "";
};



	
	
	
	
	
	
	
	
	
	
	


























