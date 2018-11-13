/**
 * @author PradoArturo
 */

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

function initialize_map() {
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} 
	else { // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
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

	var target = document.getElementById('map-canvas');
	var spinner = new Spinner(opts).spin();
	target.appendChild(spinner.el);
	
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var siteCoords = JSON.parse(xmlhttp.responseText);
			//var csv = JSON2CSV(siteData );
			spinner.stop();	

			marker = [];
			for (var i = 0 ; i < siteCoords.length; i++){
				marker[i] = new google.maps.Marker({
					position: new google.maps.LatLng(
						parseFloat(siteCoords[i]['lat']), 
						parseFloat(siteCoords[i]['long'])
					),
					map: map,
					title: siteCoords[i]['name'].toLowerCase() + '\n'
							+ siteCoords[i]['place_installed']
				});

				var siteName = siteCoords[i]['name'].toLowerCase();
				var mark = marker[i];
				google.maps.event.addListener(mark, 'click', (function(name) {
					//event.preventDefault();
                    return function(){
                        //alert(name);
						var urlExt = "gold/site/" + name;
						var urlBase = "http://www.dewslandslide.com/";
						
						window.location.href = urlBase + urlExt;                        
                    };
				})(siteName));
			}
		}
	};
	
	var url = "/temp/getSenslopeData.php?coord";
	xmlhttp.open("GET",url,true);	  
	xmlhttp.send();
	
	var mapOptions = {
		center: new google.maps.LatLng(14.5995, 120.9842),
		zoom: 5
	};

	var map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);
}

function initialize_map2() {
	//gmapJSON = <?php echo $sitesCoord; ?>;
	var siteCoords = gmapJSON;
	//var siteCoords = JSON.parse(gmapJSON);
	
	//var siteCoords = JSON.parse(xmlhttp.responseText);
	
	var mapOptions = {
		center: new google.maps.LatLng(14.5995, 120.9842),
		zoom: 5
	};

	var map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);

	marker = [];
	for (var i = 0 ; i < siteCoords.length; i++){
		marker[i] = new google.maps.Marker({
			position: new google.maps.LatLng(
				parseFloat(siteCoords[i]['lat']), 
				parseFloat(siteCoords[i]['long'])
			),
			map: map,
			title: siteCoords[i]['name'].toLowerCase() + '\n'
					+ siteCoords[i]['place_installed']
		});

		var siteName = siteCoords[i]['name'].toLowerCase();
		var mark = marker[i];
		google.maps.event.addListener(mark, 'click', (function(name) {
            return function(){
                //alert(name);
				var urlExt = "gold/site/" + name;
				var urlBase = "http://www.dewslandslide.com/";
				
				window.location.href = urlBase + urlExt;   
            };
		})(siteName));
	}
}








