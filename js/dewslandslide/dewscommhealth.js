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
    ['#EE1111', '#284785', '#8AE234'],
    ['#444444', '#888888', '#DDDDDD'],
    null
];

function healthNode(frm, e) {
  if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  //var target = document.getElementById('div_health');
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
			//document.getElementById("div_health"), 
			document.getElementById(e), 
			data, 
			{
				title: 'Node Health: ' + frm.sites.value,
				legend: 'always',
				stackedGraph: isStacked,
				labels: ['node', 'past 7 days', 'past 30 days', 'overall'],
				visibility: isVisible,
				rollPeriod: 1,
				showRoller: true,
				ylabel: 'Communication Health Ratio',
				xlabel: 'Node Number',
				colors: colorSets[0],
				//errorBars: true,

				highlightCircleSize: 2,
				strokeWidth: 1,
				strokeBorderWidth: isStacked ? null : 1,
				plotter: barChartPlotter,

				highlightSeriesOpts: {
				  strokeWidth: 3,
				  strokeBorderWidth: 1,
				  highlightCircleSize: 5,
				}
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
	}
 };
  //var url = "temp/getSenslopeData.php?health&site=" + frm.sites.value + "&db=" + frm.dbase.value;
  //var url = "temp/getSenslopeData.php?health&site=" + frm.sites.value + "&db=" + frm.dbase.value;
  var url = "/test/commhealth/" + frm.sites.value + "/" + frm.dbase.value;
  xmlhttp.open("GET",url,true);
  xmlhttp.send();	
}

function healthNodeGeneral(frm, e) {
  if (window.XMLHttpRequest) {
	// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  //var target = document.getElementById('div_health');
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
			//document.getElementById("div_health"), 
			document.getElementById(e), 
			data, 
			{
				//title: 'Node Health: ' + frm.sitegeneral.value,
				legend: 'always',
				stackedGraph: isStacked,
				labels: ['node', 'past 7 days', 'past 30 days', 'overall'],
				visibility: isVisible,
				rollPeriod: 1,
				showRoller: true,
				ylabel: 'Communication Health Ratio',
				xlabel: 'Node Number',
				colors: colorSets[0],
				//errorBars: true,

				highlightCircleSize: 2,
				strokeWidth: 1,
				strokeBorderWidth: isStacked ? null : 1,
				plotter: barChartPlotter,

				highlightSeriesOpts: {
				  strokeWidth: 3,
				  strokeBorderWidth: 1,
				  highlightCircleSize: 5,
				}
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
	}
 };
  //var url = "/temp/getSenslopeData.php?health&site=" + frm.sitegeneral.value + "&db=" + frm.dbase.value;
  var url = "/test/commhealth/" + frm.sitegeneral.value + "/" + frm.dbase.value;
  xmlhttp.open("GET",url,true);
  xmlhttp.send();	
}

function showCommHealthPlot(frm) {
	//Generate Health Graph
	healthNode(frm, "div_health");
}

function showCommHealthPlotGeneral(frm) {
	//Generate Health Graph
	healthNodeGeneral(frm, "div_health");
}

function change(el) {
	if(g != 0)
		g.setVisibility(parseInt(el.id), el.checked);
	
    isVisible[parseInt(el.id)] = el.checked;
}

var options = ["blcb", "blct", "bolb", "gamb", "gamt",
				"humb", "humt", "labb", "labt", "lipb",
				"lipt", "mamb", "mamt", "oslb", "oslt",
				"plab", "plat", "pugb", "pugt", "sinb",
				"sinu"];

function popDropDown() {
	var select = document.getElementById('selectCommHealthSite');
	var i;
	for (i = 0; i < options.length; i++) {
		var opt = options[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}
}

function initCommHealth() {
	popDropDown();
}



















