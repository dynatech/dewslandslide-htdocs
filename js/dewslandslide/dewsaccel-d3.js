var end_date = new Date();
//var start_date = new Date(end_date.getMonth() + '-' + end_date.getDate() + '-' + end_date.getFullYear());
var start_date = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate()-10);
var brush_from = "", brush_to = "";

$(function() {
	$( "#datepicker" ).datepicker({ dateFormat: "yy-mm-dd" });
	$( "#datepicker" ).datepicker("setDate", start_date); 
});

$(function() {
	$( "#datepicker2" ).datepicker({ dateFormat: "yy-mm-dd" });
    $( "#datepicker2" ).datepicker("setDate", end_date);
});

var accel_opts = {
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

function showAccel() {
	
	var accel_current;
		
		accel_current = document.getElementById("accel-1-timestamp");
		accel_current.innerHTML = "<b>Timestamp: </b>";
		accel_current = document.getElementById("accel-2-timestamp");
		accel_current.innerHTML = "<b>Timestamp: </b>";
		accel_current = document.getElementById("accel-3-timestamp");
		accel_current.innerHTML = "<b>Timestamp: </b>";
		accel_current = document.getElementById("accel-4-timestamp");
		accel_current.innerHTML = "<b>Timestamp: </b>";
		
		d3.selectAll("#svg-accel").remove();	

	var accel_target = document.getElementById('accel-1');
    var accel_spinner1 = new Spinner(accel_opts).spin(),
		accel_spinner2 = new Spinner(accel_opts).spin(),
		accel_spinner3 = new Spinner(accel_opts).spin(),
		accel_spinner4 = new Spinner(accel_opts).spin();
        accel_target.appendChild(accel_spinner1.el);
		accel_target = document.getElementById('accel-2');
		accel_target.appendChild(accel_spinner2.el);
		accel_target = document.getElementById('accel-3');
		accel_target.appendChild(accel_spinner3.el);
		accel_target = document.getElementById('accel-4');
		accel_target.appendChild(accel_spinner4.el);
			
	var accel_margin = {top: 20, right: 20, bottom: 30, left: 90},
		accel_margin2 = {top: 10, right: 10, bottom: 20, left: 40},
		accel_width = document.getElementById('accel-1').clientWidth - accel_margin.left - accel_margin.right,
		accel_width2 = document.getElementById('div_slider').clientWidth,
		accel_width2 = accel_width2 - accel_margin2.left - accel_margin2.right,
		accel_height = document.getElementById('accel-1').clientHeight - accel_margin.top - accel_margin.bottom,
		accel_height2 =document.getElementById('div_slider').clientHeight,
		accel_height2 = accel_height2 - accel_margin2.top - accel_margin2.bottom;

	var accel_parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
	var accel_formatDate = d3.time.format("%Y-%m-%d %H:%M:%S");
	var accel_bisectDate = d3.bisector(function(d) { return d.timestamp; }).left;
	
	//<!-- X-Value -->
	
	var accel_x1 = d3.time.scale()
		.range([0, accel_width]);

	var accel_y1 = d3.scale.linear()
		.range([accel_height, 0]);

	var accel_xAxis1 = d3.svg.axis()
		.scale(accel_x1)
		.orient("bottom").ticks(3);

	var accel_yAxis1 = d3.svg.axis()
		.scale(accel_y1)
		.orient("left").ticks(2);

	var accel_area1 = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return accel_x1(d.timestamp); })
		.y0(function (d) { return accel_y1(0); })
		.y1(function(d) { return accel_y1(d.xvalue); });
		
	var accel_svg1 = d3.select("#accel-1").append("svg")
		.attr("id", "svg-accel")
		.attr("class", "svg-accel2")
		.attr("width", accel_width + accel_margin.left + accel_margin.right)
		.attr("height", accel_height + accel_margin.top + accel_margin.bottom)
		.append("g")
		.attr("transform", "translate(" + accel_margin.left + "," + accel_margin.top + ")");
	
	accel_svg1.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", accel_width)
		.attr("height", accel_height);
		
	//<!-- Y-Value -->		
	
	var accel_x2 = d3.time.scale()
		.range([0, accel_width]);
		
	var accel_y2 = d3.scale.linear()
		.range([accel_height, 0]);
	
	var accel_xAxis2 = d3.svg.axis()
		.scale(accel_x2)
		.orient("bottom").ticks(3);

	var accel_yAxis2 = d3.svg.axis()
		.scale(accel_y2)
		.orient("left").ticks(2);

	var accel_area2 = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { 
				return accel_x2(d.timestamp); 
			})
		.y0(function (d) {
				return accel_y2(0); 
			})
		.y1(function(d) { 
				return accel_y2(d.yvalue); 
			});
		
	var accel_svg2 = d3.select("#accel-2").append("svg")
		.attr("id", "svg-accel")
		.attr("class", "svg-accel2")
		.attr("width", accel_width + accel_margin.left + accel_margin.right)
		.attr("height", accel_height + accel_margin.top + accel_margin.bottom)
		.append("g")
		.attr("transform", "translate(" + accel_margin.left + "," + accel_margin.top + ")");

	accel_svg2.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", accel_width)
		.attr("height", accel_height);
		
	//<!-- Z-Value -->	

	var accel_x3 = d3.time.scale()
		.range([0, accel_width]);

	var accel_y3 = d3.scale.linear()
		.range([accel_height, 0]);
	
	var accel_xAxis3 = d3.svg.axis()
		.scale(accel_x3)
		.orient("bottom").ticks(3);
		
	var accel_yAxis3 = d3.svg.axis()
		.scale(accel_y3)
		.orient("left").ticks(2);

	var accel_area3 = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return accel_x3(d.timestamp); })
		.y0(function (d) { return accel_y3(0); })
		.y1(function(d) { return accel_y3(d.zvalue); });

	var accel_svg3 = d3.select("#accel-3").append("svg")
		.attr("id", "svg-accel")
		.attr("class", "svg-accel2")
		.attr("width", accel_width + accel_margin.left + accel_margin.right)
		.attr("height", accel_height + accel_margin.top + accel_margin.bottom)
		.append("g")
		.attr("transform", "translate(" + accel_margin.left + "," + accel_margin.top + ")");
	
	accel_svg3.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", accel_width)
		.attr("height", accel_height);
		
	//<!-- Soil Moisture -->

	var accel_x4 = d3.time.scale()
		.range([0, accel_width]);
		
	var accel_y4 = d3.scale.linear()
		.range([accel_height, 0]);

	var accel_xAxis4 = d3.svg.axis()
		.scale(accel_x4)
		.orient("bottom").ticks(3);
		
	var accel_yAxis4 = d3.svg.axis()
		.scale(accel_y4)
		.orient("left").ticks(2);

	var accel_area4 = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return accel_x4(d.timestamp); })
		.y0(function (d) {return accel_y4(0);})
		.y1(function(d) { return accel_y4(d.mvalue); });

	var accel_svg4 = d3.select("#accel-4").append("svg")
		.attr("id", "svg-accel")
		.attr("class", "svg-accel2")
		.attr("width", accel_width + accel_margin.left + accel_margin.right)
		.attr("height", accel_height + accel_margin.top + accel_margin.bottom)
		.append("g")
		.attr("transform", "translate(" + accel_margin.left + "," + accel_margin.top + ")");

	accel_svg4.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", accel_width)
		.attr("height", accel_height);
		
	//<!-- Context Brush -->
	
	var accel_x5 = d3.time.scale().range([0, accel_width2 + 49]);
	
	var accel_xAxis5 = d3.svg.axis()
		.scale(accel_x5)
		.orient("bottom")
		.ticks(2);
		
	var accel_y5 = d3.scale.linear()
		.range([accel_height2, 0]);

	var accel_area5 = d3.svg.area()
		.interpolate("cardinal")
		.x(function(d) { return accel_x5(d.timestamp); })
		.y0(accel_height2)
		.y1(0);
		
	var brush = d3.svg.brush()
		.x(accel_x5)
		.on("brush", onBrush);
		
	var accel_slider = d3.select("#div_slider").append("svg")
		.attr("id", "svg-accel")
		.attr("width", accel_width + accel_margin.left + accel_margin.right)
		.attr("height", accel_height2 + accel_margin.top + accel_margin.bottom)
		.append("g")
		.attr("transform", "translate(0,0)");
	
	var accel_url = "/test/accel/" + curSite + "/" + curNode + "/" + fromDate + "/" + toDate;
	
	var accel_tool1 = accel_svg1.append("g")                                
		.style("display", null);   
		
	var accel_tool2 = accel_svg2.append("g")                                
		.style("display", null);   
		
	var accel_tool3 = accel_svg3.append("g")                                
		.style("display", null);   
		
	var accel_tool4 = accel_svg4.append("g")                                
		.style("display", null);   

	//<!-- JSON -->
			
	d3.json(accel_url, function(error, data){
		
		if (data == null){
                    accel_spinner1.stop();
					accel_spinner2.stop();
					accel_spinner3.stop();
					accel_spinner4.stop();
                    //alert("No data retrieved. Please check input values.");
                    return;
        } 
				
		data.forEach(function(d){
			d.timestamp = accel_parseDate(d.timestamp);
			d.xvalue = +d.xvalue;
			d.yvalue = +d.yvalue;
			d.zvalue = +d.zvalue;
			d.mvalue = +d.mvalue;
		});
		
		//<!-- X-Value -->
		
		accel_x1.domain(d3.extent(data, function(d) { return d.timestamp; }));
		accel_y1.domain([d3.min(data, function(d) {return d.xvalue;}), d3.max(data, function(d) { return d.xvalue; })]);

		accel_svg1.append("path")
			.datum(data)
			.attr("d", accel_area1)
			.attr("class", "area");
			
		accel_svg1.append("rect")
			.attr("width", accel_width)
			.attr("height", accel_height)
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function() { accel_tool1.style("display", null); })
			.on("mouseout", function() { accel_tool1.style("display", "none"); 
										 accel_current = document.getElementById("accel-1-timestamp");
										 accel_current.innerHTML = "<b>Timestamp: </b>";})
			.on("mousemove", accel_mousemove1);
			
		accel_svg1.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + accel_height + ")")
			  .style("font-size", "11px")
			  .call(accel_xAxis1);

		accel_svg1.append("g")
			  .attr("class", "y axis")
			  .style("font-size", "13px")
			  .call(accel_yAxis1)
			  .append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", -75)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("X(LSB)");
	
		//<!-- Y-Value -->
		
		accel_x2.domain(d3.extent(data, function(d) { return d.timestamp; }));
		accel_y2.domain([d3.min(data, function(d) {return d.yvalue;}), d3.max(data, function(d) { return d.yvalue; })]);

		accel_svg2.append("path")
			.datum(data)
			.attr("d", accel_area2)
			.attr("class", "area2");
			
		accel_svg2.append("rect")
			.attr("width", accel_width)
			.attr("height", accel_height)
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function() { accel_tool2.style("display", null); })
			.on("mouseout", function() { accel_tool2.style("display", "none"); 
										 accel_current = document.getElementById("accel-2-timestamp");
										 accel_current.innerHTML = "<b>Timestamp: </b>";})
			.on("mousemove", accel_mousemove2);

		accel_svg2.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + accel_height + ")")
			.style("font-size", "11px")
			.call(accel_xAxis2);

		accel_svg2.append("g")
			.attr("class", "y axis")
			.style("font-size", "13px")
			.call(accel_yAxis2)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -75)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Y(LSB)");  

		//<!-- Z-Value -->
		
		accel_x3.domain(d3.extent(data, function(d) { return d.timestamp; }));
		accel_y3.domain([d3.min(data, function(d) {return d.zvalue;}), d3.max(data, function(d) { return d.zvalue; })]);

		accel_svg3.append("path")
			.datum(data)
			.attr("d", accel_area3)
			.attr("class", "area3");
			
		accel_svg3.append("rect")
			.attr("width", accel_width)
			.attr("height", accel_height)
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function() { accel_tool3.style("display", null); })
			.on("mouseout", function() { accel_tool3.style("display", "none"); 
										 accel_current = document.getElementById("accel-3-timestamp");
										 accel_current.innerHTML = "<b>Timestamp: </b>";})
			.on("mousemove", accel_mousemove3);	

		accel_svg3.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + accel_height + ")")
			  .style("font-size", "11px")
			  .call(accel_xAxis3);

		accel_svg3.append("g")
			  .attr("class", "y axis")
			  .style("font-size", "13px")
			  .call(accel_yAxis3)
			  .append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", -75)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("Z(LSB)");
			  
		//<!-- Soil Moisture -->
		
		accel_x4.domain(d3.extent(data, function(d) { return d.timestamp; }));
		accel_y4.domain([d3.min(data, function(d) {return d.mvalue;}), d3.max(data, function(d) { return d.mvalue; })]);

		accel_svg4.append("path")
			.datum(data)
			.attr("d", accel_area4)
			.attr("class", "area4");
			
		accel_svg4.append("rect")
			.attr("width", accel_width)
			.attr("height", accel_height)
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function() { accel_tool4.style("display", null); })
			.on("mouseout", function() { accel_tool4.style("display", "none"); 
										 accel_current = document.getElementById("accel-4-timestamp");
										 accel_current.innerHTML = "<b>Timestamp: </b>";})
			.on("mousemove", accel_mousemove4);
			
		accel_svg4.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + accel_height + ")")
			  .style("font-size", "11px")
			  .call(accel_xAxis4);

		accel_svg4.append("g")
			  .attr("class", "y axis")
			  .style("font-size", "13px")
			  .call(accel_yAxis4)
			  .append("text")
			  .attr("transform", "rotate(-90)")
			  .attr("y", -75)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text("M(HZ)");
	 
		//<!-- Slider -->
		
		accel_x5.domain(accel_x1.domain());
		accel_y5.domain(accel_y1.domain());
		
		accel_slider.append("path")
			.datum(data)
			.style("fill", "steelblue")
			.attr("d", accel_area5);
			
		accel_slider.append("g")
			.attr("class", "x axis top")
			.attr("transform", "translate(0," + accel_height2 + ")")
			.style("font-size", "11px")
			.call(accel_xAxis5);
			
		accel_slider.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", 0)
			.attr("height", accel_height2);
		
		accel_tool1.append("circle")                                 
			.attr("class", "y")                              
			.style("fill", "FCFF33")                          
			.style("stroke", "FCFF33")                         
			.attr("r", 2);  
			
		accel_tool2.append("circle")                                 
			.attr("class", "y")                              
			.style("fill", "FCFF33")                          
			.style("stroke", "FCFF33")                         
			.attr("r", 2);  
		
		accel_tool3.append("circle")                                 
			.attr("class", "y")                              
			.style("fill", "FCFF33")                          
			.style("stroke", "FCFF33")                         
			.attr("r", 2);  
			
		accel_tool4.append("circle")                                 
			.attr("class", "y")                              
			.style("fill", "FCFF33")                          
			.style("stroke", "FCFF33")                         
			.attr("r", 2);  
		
		//<!-- Tooltips Function -->
		
		function accel_mousemove1() {                                 
			var x0 = accel_x1.invert(d3.mouse(this)[0]);              
            i = accel_bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;     

			accel_tool1.select("circle.y")  
				.style("fill", "#4E0012")
				.style("stroke", "#4E0012")
				.attr("transform",                           
					  "translate(" + (accel_x1(d.timestamp))  + "," +         
									 accel_y1((d.xvalue)) + ")");      
									 
			accel_current = document.getElementById("accel-1-timestamp");
			accel_current.innerHTML = "<b>Timestamp: </b>" + accel_formatDate(d.timestamp) + "<b>X-Value: </b>" + d.xvalue;
		}
	
		function accel_mousemove2() {                                 
			var x0 = accel_x2.invert(d3.mouse(this)[0]);              
            i = accel_bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;     

			accel_tool2.select("circle.y")           
				.style("fill", "#4E0012")
				.style("stroke", "#4E0012")		
				.attr("transform",                           
					  "translate(" + (accel_x2(d.timestamp))  + "," +         
									 accel_y2((d.yvalue)) + ")");      
								 
			accel_current = document.getElementById("accel-2-timestamp");
			accel_current.innerHTML = "<b>Timestamp: </b>" + accel_formatDate(d.timestamp) + "<b>Y-Value: </b>" + d.yvalue;
		}
	
		function accel_mousemove3() {                                 
			var x0 = accel_x3.invert(d3.mouse(this)[0]);              
            i = accel_bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;     

			accel_tool3.select("circle.y")     
				.style("fill", "#4E0012")
				.style("stroke", "#4E0012")	
				.attr("transform",                           
					  "translate(" + (accel_x3(d.timestamp))  + "," +         
									 accel_y3((d.zvalue)) + ")");      
								 
			accel_current = document.getElementById("accel-3-timestamp");
			accel_current.innerHTML = "<b>Timestamp: </b>" + accel_formatDate(d.timestamp) + "<b>Z-Value: </b>" + d.zvalue;
		}

		function accel_mousemove4() {                                 
			var x0 = accel_x4.invert(d3.mouse(this)[0]);              
            i = accel_bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;     

			accel_tool4.select("circle.y")    
				.style("fill", "#4E0012")
				.style("stroke", "#4E0012")	
				.attr("transform",                           
					  "translate(" + (accel_x4(d.timestamp))  + "," +         
									 accel_y4((d.mvalue)) + ")");      
								 
			accel_current = document.getElementById("accel-4-timestamp");
			accel_current.innerHTML = "<b>Timestamp: </b>" + accel_formatDate(d.timestamp) + "<b>X-Value: </b>" + d.mvalue;
		}
		
		brush_from = d3.min(accel_x5.domain()).toLocaleDateString() + " " + d3.min(accel_x5.domain()).toLocaleTimeString();
		brush_to = d3.max(accel_x5.domain()).toLocaleDateString() + " " + d3.max(accel_x5.domain()).toLocaleTimeString();
		brush_target = document.getElementById("div_slider_timestamp");
		brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
		
		accel_spinner1.stop();
		accel_spinner2.stop();
		accel_spinner3.stop();
		accel_spinner4.stop();		
	});
	
	function onBrush(){
 
		accel_x1.domain(brush.empty() ? accel_x5.domain() : brush.extent());
		accel_x2.domain(brush.empty() ? accel_x5.domain() : brush.extent());
		accel_x3.domain(brush.empty() ? accel_x5.domain() : brush.extent());
		accel_x4.domain(brush.empty() ? accel_x5.domain() : brush.extent());
		accel_svg1.select(".area").attr("d", accel_area1);
		accel_svg1.select(".x.axis").call(accel_xAxis1);
		accel_svg2.select(".area2").attr("d", accel_area2);
		accel_svg2.select(".x.axis").call(accel_xAxis2);
		accel_svg3.select(".area3").attr("d", accel_area3);
		accel_svg3.select(".x.axis").call(accel_xAxis3);
		accel_svg4.select(".area4").attr("d", accel_area4);
		accel_svg4.select(".x.axis").call(accel_xAxis4);
		
		if(brush.empty())
		{
			brush_from = d3.min(accel_x5.domain()).toLocaleDateString() + " " + d3.min(accel_x5.domain()).toLocaleTimeString();
			brush_to = d3.max(accel_x5.domain()).toLocaleDateString() + " " + d3.max(accel_x5.domain()).toLocaleTimeString();
			brush_target = document.getElementById("div_slider_timestamp");
			brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
		}
		else
		{
			brush_from = d3.min(brush.extent()).toLocaleDateString() + " " + d3.min(brush.extent()).toLocaleTimeString();
			brush_to = d3.max(brush.extent()).toLocaleDateString() + " " + d3.max(brush.extent()).toLocaleTimeString();
			brush_target = document.getElementById("div_slider_timestamp");
			brush_target.innerHTML = "<b>From: " + brush_from + "</b><br/><b>To: " + brush_to + "</b>";
		}
	}

}	