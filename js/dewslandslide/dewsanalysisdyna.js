isStacked = false;
var site = window.location.search.substring(1).split('=')[1];
//var dir = "http://www.dewslandslide.com/ajax/csvmonitoring/";
//var dir = "../temp/csvmonitoring/";

var fullUrl = window.location.href;
var semiUrl = fullUrl.split("//")[1];
var domain = semiUrl.split("/")[0];

var dir = "";

if(domain == "localhost") {
	dir = "/temp/csvmonitoring/";
}
else {
	dir = "/ajax/csvmonitoring/";	
}

var div_array = [];

var makeGraph = function(type, title, chartYlabel){
    var div = document.createElement('div');
    
    document.body.appendChild(div);
    div.className = "myDygraph";
    div.style.display = 'inline-block';
    
    var g = new Dygraph(
        div,
        dir + site + "%20" + type + ".csv", // path to CSV file
        {
            title: site.toUpperCase() + " " + title,
            highlightCircleSize: 2,
            strokeWidth: 1,
            ylabel: chartYlabel,
            strokeBorderWidth: isStacked ? null : 1,
            
            labelsDivWidth: 600,
            labelsDivStyles: {
                'text-align': 'right',
                'font-family': 'Lato',
                'font-size': '12px',
                'background': 'none',
            },
            rightgap: 500,
            yRangePad: 100,
            //labelsSeparateLines: true,
            legend: "always",
            
            highlightSeriesOpts: {
              strokeWidth: 3,
              strokeBorderWidth: 1,
              highlightCircleSize: 5,
            },
            
            showRoller: true,
            
            width: 750,
            height: 400
        }
    );
    div_array.push(div);
};	

var makeAnaDynaGraph = function(e, type, title, chartYlabel){
    //var div = document.createElement('div');
    
    //document.body.appendChild(div);
    //div.className = "myDygraph";
    //div.style.display = 'inline-block';
    
    var g = new Dygraph(
	        document.getElementById(e), 
	        dir + site + "%20" + type + ".csv", // path to CSV file
	        {
	            //title: site.toUpperCase() + " " + title,
	            highlightCircleSize: 2,
	            strokeWidth: 1,
	            ylabel: chartYlabel,
	            strokeBorderWidth: isStacked ? null : 1,
	            
	            labelsDivWidth: 600,
	            labelsDivStyles: {
	                'text-align': 'right',
	                'font-family': 'Lato',
	                'font-size': '12px',
	                'background': 'none',
	            },
	            rightgap: 500,
	            yRangePad: 100,
	            //labelsSeparateLines: true,
	            legend: "always",
	            
	            highlightSeriesOpts: {
	              strokeWidth: 3,
	              strokeBorderWidth: 1,
	              highlightCircleSize: 5,
	            },
	            
	            showRoller: true
	        }
	    );
};	

var plotFromForm = 1;
function showAnalysisDyna(frm){
    
    // function activated by onchange on form
    if (plotFromForm == 1){
        site = frm.sites.value;
    }
    // no site name in address
    else if (site.length<4){
        plotFromForm = 1;
        return;
    }
    // site name in address is correct
    else if (site.length==4){
        plotFromForm = 1;
    }
    
    for (var i=0; i<div_array.length; i++){
        document.body.removeChild(div_array[i]);
    }
    div_array=[];
    
	makeAnaDynaGraph("xz-lin-zero-analysis-dyna-canvas", "xz_0off","XZ Linear Displacement (Zeroed and Offseted)", "Displacement (m)");
    makeAnaDynaGraph("xy-lin-zero-analysis-dyna-canvas", "xy_0off","XY Linear Displacement (Zeroed and Offseted)", "Displacement (m)");
    makeAnaDynaGraph("xz-lin-analysis-dyna-canvas", "xz","XZ Linear Displacement", "Displacement (m)");
    makeAnaDynaGraph("xy-lin-analysis-dyna-canvas", "xy","XY Linear Displacement", "Displacement (m)");
    makeAnaDynaGraph("xz-vel-analysis-dyna-canvas", "xz_vel","XZ Linear Velocity", "Velocity (m/day)");
    makeAnaDynaGraph("xy-vel-analysis-dyna-canvas", "xy_vel","XY Linear Velocity", "Velocity (m/day)");
}

function showAnalysisDynaGeneral(frm){
    
    // function activated by onchange on form
    site = frm.sitegeneral.value;
   
	makeAnaDynaGraph("xz-lin-zero-analysis-dyna-canvas", "xz_0off","XZ Linear Displacement (Zeroed and Offseted)", "Displacement (m)");
    makeAnaDynaGraph("xy-lin-zero-analysis-dyna-canvas", "xy_0off","XY Linear Displacement (Zeroed and Offseted)", "Displacement (m)");
    makeAnaDynaGraph("xz-lin-analysis-dyna-canvas", "xz","XZ Linear Displacement", "Displacement (m)");
    makeAnaDynaGraph("xy-lin-analysis-dyna-canvas", "xy","XY Linear Displacement", "Displacement (m)");
    makeAnaDynaGraph("xz-vel-analysis-dyna-canvas", "xz_vel","XZ Linear Velocity", "Velocity (m/day)");
    makeAnaDynaGraph("xy-vel-analysis-dyna-canvas", "xy_vel","XY Linear Velocity", "Velocity (m/day)");
}

//showAnalysisDyna(document.getElementById("siteForm"));

var options = ["blcb", "blct", "bolb", "gamb", "gamt",
				"humb", "humt", "labb", "labt", "lipb",
				"lipt", "mamb", "mamt", "oslb", "oslt",
				"plab", "plat", "pugb", "pugt", "sinb",
				"sinu"];

function popDropDownAnalDyna() {
	var select = document.getElementById('selectAnalysisDynaSite');
	var i;
	for (i = 0; i < options.length; i++) {
		var opt = options[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}
}

function initAnalysisDyna() {
	popDropDownAnalDyna();
}
























