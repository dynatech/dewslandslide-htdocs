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

function barChartPlotter(e) {
  var ctx = e.drawingContext;
  var points = e.points;
  var y_bottom = e.dygraph.toDomYCoord(0);  // see http://dygraphs.com/jsdoc/symbols/Dygraph.html#toDomYCoord
 
  // This should really be based on the minimum gap
  var bar_width = 2/3 * (points[1].canvasx - points[0].canvasx);
  ctx.fillStyle = e.color;
 
  // Do the actual plotting.
  for (var i = 0; i < points.length; i++) {
	var p = points[i];
	var center_x = p.canvasx;  // center of the bar
 
	ctx.fillRect(center_x - bar_width / 2, p.canvasy,
		bar_width, y_bottom - p.canvasy);
	ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
		bar_width, y_bottom - p.canvasy);
  }
}

var g = 0;
var isVisible = [true, true, true, true];
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

var colorSets = [
    ['#284785', '#8AE234'],
    ['#888888', '#DDDDDD'],
    null
];

var blah = 0;
function sentNodeGeneral(frm, e) {
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	  
	var target = document.getElementById(e);
	var spinner = new Spinner().spin();
	target.appendChild(spinner.el);
	  
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	        var siteData = JSON.parse(xmlhttp.responseText);
	        var data = JSON2CSV(siteData);	
			var isStacked = false;
			
			spinner.stop();
			
			g = new Dygraph(
				target, 
				data, 
				{
					//title: 'Site Health: ' + frm.sitegeneral.value,
					legend: 'always',
					stackedGraph: isStacked,
					labels: ['timestamp', 'data sent'],
					visibility: isVisible,
					rollPeriod: 1,
					showRoller: true,
					ylabel: 'No. of Node Data Sent',
					xlabel: 'Timestamp',
					colors: colorSets[0],
					//errorBars: true,
	
					highlightCircleSize: 2,
					strokeWidth: 1,
					strokeBorderWidth: isStacked ? null : 1,
					plotter: barChartPlotter,
				}
				);
			
			var onclick = function(ev) {
				if (g.isSeriesLocked()) {
					g.clearSelection();
				} else {
					g.setSelection(g.getSelection(), g.getHighlightSeries(), true);
				}
			};
			
			g.updateOptions({clickCallback: onclick}, true);
			g.setSelection(false, 'past 7 days');
		};
	};
	//var url ="temp/getSenslopeData.php?sitehealth&q=" + frm.dateinput.value + "&site=" + frm.sites.value + "&db=" + frm.dbase.value;
	//var url ="temp/getSenslopeData.php?sitehealth&q=" + blah + "&site=" + frm.sitegeneral.value + "&db=" + frm.dbase.value;
	//var url ="/ajax/getSenslopeData.php?sitehealth&q=" + blah + "&site=" + frm.sitegeneral.value + "&db=" + frm.dbase.value;
	var url ="/test/senttotal/" + frm.sitegeneral.value + "/" + blah;	
	
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

function showSentNodeTotalGeneral(frm) {
	//Generate Health Graph
	blah = document.getElementById("formDate").dateinput.value;
	
	setTimeout(function(){
		//Add 1 sec delay
		sentNodeGeneral(frm, "sent-node-canvas");
	}, 100); 
}

function change(el) {
	if(g != 0)
		g.setVisibility(parseInt(el.id), el.checked);
	
    isVisible[parseInt(el.id)] = el.checked;
}



























