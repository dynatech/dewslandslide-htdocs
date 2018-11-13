var dateInput = 0;

/*
var end_date = new Date();
var start_date = new Date(end_date.getMonth() + '-' + end_date.getDate() + '-' + end_date.getFullYear());

$(function() {
	$( "#datepicker" ).datepicker({ dateFormat: "yy-mm-dd" });
	$( "#datepicker" ).datepicker("setDate", start_date); 
});
*/

// Create the XHR object.
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

// Helper method to parse the title tag from the response.
function getTitle(text) {
	return text.match('<title>(.*)?</title>')[1];
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
var target = document.getElementById('rainfall-canvas');

var xmlhttp;
if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
} else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

function showRainDataCors(frm) {

	if (frm.dateinput.value == "") {
		document.getElementById("txtHint").innerHTML="";
		return;
	} 

	var target = document.getElementById('rainfall-canvas');
	var spinner = new Spinner().spin();
	target.appendChild(spinner.el);

	// Response handlers.
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var rdatacsv = JSON2CSV(xmlhttp.responseText);	
            spinner.stop();
            
            var threshold = 0.0;
            switch(frm.sitegeneral.value){
                case "blcb": threshold = 130.00; break;
                case "blct": threshold = 130.00; break;
                case "bolb": threshold = 128.53; break;
                case "gamt": threshold = 183.85; break;
                case "gamb": threshold = 183.85; break;
                case "humb": threshold = 79.33; break;
                case "humt": threshold = 79.33; break;
                case "labb": threshold = 195.21; break;
                case "labt": threshold = 195.21; break;
                case "lipb": threshold = 129.65; break;
                case "lipt": threshold = 129.65; break;
                case "mamb": threshold = 208.54; break;
                case "mamt": threshold = 208.54; break;
                case "oslb": threshold = 179.41; break;
                case "oslt": threshold = 179.41; break;
                case "plat": threshold = 78.32; break;
                case "plab": threshold = 78.32; break;
                case "pugb": threshold = 191.95; break;
                case "pugt": threshold = 191.95; break;
                case "sinb": threshold = 235.03; break;
                case "sint": threshold = 235.03; break;
                case "sinu": threshold = 235.03; break;
            }
            
			g2 = new Dygraph(
				document.getElementById("rainfall-canvas"),
				rdatacsv,
				{
					ylabel: "Rain Intensity (mm)",
                    labels: ["Timestamp","24h Rain","15m Rain"],
                    ylabel: "Rain Intensity",
                    fillGraph: true,
                    
                    underlayCallback: function(canvas, area, g2) {
                        
                        var c1 = g2.toDomCoords(g2.getValue(0,0), threshold);
                        canvas.fillStyle = '#FF0000';
                        canvas.fillRect(area.x, c1[1], area.w, 1);
                                                    
                    },
				}// options
			);
		}
	};
    
    //var url = "ajax/getRainfall2.php?rsite=" + frm.sitegeneral.value + "&fdate=" + frm.datepicker.value + "&tdate=" + frm.datepicker2.value;
    var url = "/ajax/getSenslopeData.php?rainsenslope&start_date=" + frm.dateinput.value + "&end_date=" + frm.dateinput2.value  + "&site=" + frm.sites.value ,
    document.getElementById("txtHint").innerHTML = url;
	//xmlhttp.open("GET","http://weather.asti.dost.gov.ph/home/index.php/api/data/" + frm.sitegeneral.value + "/from/" + frm.dateinput.value + "/to/" + frm.dateinput2.value,true);
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

function showRainDataCorsGeneral(frm, e) {

	/*
	if (frm.dateinput.value == "") {
		document.getElementById("txtHint").innerHTML="";
		return;
	} 
	*/

	var target = document.getElementById(e);
	var spinner = new Spinner().spin();
	target.appendChild(spinner.el);

	// Response handlers.
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var rdatacsv = JSON2CSV(xmlhttp.responseText);	
            spinner.stop();
            
            var threshold = 0.0;
            switch(frm.sitegeneral.value){
                case "blcb": threshold = 130.00; break;
                case "blct": threshold = 130.00; break;
                case "bolb": threshold = 128.53; break;
                case "gamt": threshold = 183.85; break;
                case "gamb": threshold = 183.85; break;
                case "humb": threshold = 79.33; break;
                case "humt": threshold = 79.33; break;
                case "labb": threshold = 195.21; break;
                case "labt": threshold = 195.21; break;
                case "lipb": threshold = 129.65; break;
                case "lipt": threshold = 129.65; break;
                case "mamb": threshold = 208.54; break;
                case "mamt": threshold = 208.54; break;
                case "oslb": threshold = 179.41; break;
                case "oslt": threshold = 179.41; break;
                case "plat": threshold = 78.32; break;
                case "plab": threshold = 78.32; break;
                case "pugb": threshold = 191.95; break;
                case "pugt": threshold = 191.95; break;
                case "sinb": threshold = 235.03; break;
                case "sint": threshold = 235.03; break;
                case "sinu": threshold = 235.03; break;
            }
            
			g2 = new Dygraph(
				document.getElementById(e),
				rdatacsv,
				{
					ylabel: "Rain Intensity (mm)",
                    labels: ["Timestamp","24h Rain","15m Rain"],
                    ylabel: "Rain Intensity",
                    fillGraph: true,
                    
                    underlayCallback: function(canvas, area, g2) {
                        
                        var c1 = g2.toDomCoords(g2.getValue(0,0), threshold);
                        canvas.fillStyle = '#FF0000';
                        canvas.fillRect(area.x, c1[1], area.w, 1);
                                                    
                    },
				}// options
			);
		}
	};
    
    //var url = "ajax/getRainfall2.php?rsite=" + frm.sitegeneral.value + "&fdate=" + frm.datepicker.value + "&tdate=" + frm.datepicker2.value;
    var url = "ajax/getRainfall2.php?rsite=" + frm.sitegeneral.value + "&fdate=" + dateInput;
    document.getElementById("txtHint").innerHTML = url;
	//xmlhttp.open("GET","http://weather.asti.dost.gov.ph/home/index.php/api/data/" + frm.sitegeneral.value + "/from/" + frm.dateinput.value + "/to/" + frm.dateinput2.value,true);
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

function downloadRainfallDataCors(frm) {

	if (frm.dateinput.value == "") {
		document.getElementById("txtHint").innerHTML="";
		return;
	} 
	else
		alert("The field contains the date from: " + frm.dateinput.value + ", date to: " + frm.dateinput2.value + " and site: " + frm.sitegeneral.value);

	// var url = "http://www.dewslandslide.com/ajax/getSenslopeData.php/?rainsenslope&site=" + frm.sitegeneral.value + "&start_date=" + frm.dateinput.value + "&end_date=" + frm.dateinput2.value;
	var xmlhttp = createCORSRequest('GET', url);
	if (!xmlhttp) {
		alert('CORS not supported');
		return;
	}
  
	// Response handlers
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var siteData = JSON.parse(xmlhttp.responseText);
			//var csv = JSON2CSV(siteData);
			var csv = JSON2CSV(siteData.data);
			var uri = 'data:text/csv;charset=utf-8,' + escape(csv);

			var link = document.createElement("a");    
			link.href = uri;

			link.style = "visibility:hidden";
			link.download = frm.sitegeneral.value + ".csv";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	xmlhttp.send();
}	

function showAndClearField(frm){
	if (frm.dateinput.value == "")
		alert("Hey! You didn't enter anything!");
	else
		alert("The field contains the text: " + frm.dateinput.value);
	frm.dateinput.value = "";
}

function showRainGeneral(frm) {
	//Generate Health Graph
	dateInput = document.getElementById("formDate").dateinput.value;
	
	setTimeout(function(){
		//Add 1 sec delay
		showRainDataCorsGeneral(frm, "rainfall-canvas");
	}, 100); 
}


























