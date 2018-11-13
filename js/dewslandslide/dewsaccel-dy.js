
function showAccel(frm) {
	var rsiteid = '';
	var dfrom = $('#reportrange span').html().slice(0,10);
	var dto = $('#reportrange span').html().slice(13,23);
	var selectedSite = frm.sitegeneral.value;
	var divContainer =["accel-1"];
	if(V2V == 3){
		$("#accelM").hide();
	}
	if(V2V == 1){
		$("#accelM").hide();
		var xDataSeries=[] , yDataSeries=[] , zDataSeries=[] , mDataSeries=[];
		for (i = 0; i < version1.length; i++) {
	        var xData=[] , yData=[] ,zData = [] ,mData = [];
	        var time =  Date.parse(version1[i].ts);
	        xData.push(time, parseFloat(version1[i].xvalue));
	        yData.push(time, parseFloat(version1[i].yvalue));
	        zData.push(time, parseFloat(version1[i].zvalue));
	        mData.push(time, parseFloat(version1[i].mvalue));
	        xDataSeries.push(xData);
	        yDataSeries.push(yData);
	        zDataSeries.push(zData);
	        mDataSeries.push(mData);
	    }
	    		 $("#accel-v").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },
							        },
							        title: {
							            text: ' Mvalue ',
									             style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	// console.log(this.series.tooltipOptions.pointFormat[point]);
							                        	// console.log(this.text);
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                             // console.log(this.series.name);
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }
							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'Mvalue',
							            data: 	mDataSeries,
							            color:  "#5ff101",
							            id: 'mvalue dataseries',
						           	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'mvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'mvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'mvalue dataseries',
					                     color: "#ffff00",
							        }]
				  			 	});
						 if(selectedSite != ""){
			                var chart = $('#accel-v').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
			           		}
	    	   $("#accel-1").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							          	panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },
							        },
							        title: {
							            text: ' X axis ',
									             style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	// console.log(this.series.tooltipOptions.pointFormat[point]);
							                        	// console.log(this.text);
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                             // console.log(this.series.name);
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    // fillColor: '#FFFFFF',
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'X value',
							            data: 	xDataSeries,
							            color:  "#5ff101",
							            id: 'xvalue dataseries',
						           	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'xvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'xvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'xvalue dataseries',
					                     color: "#ffff00",
							        }]
				  			 	});
						 if(selectedSite != ""){
			                var chart = $('#accel-1').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
			           		}
			    $("#accel-2").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },
							        },
							        title: {
							            text: ' Y axis ',
									             style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	// console.log(this.series.tooltipOptions.pointFormat[point]);
							                        	// console.log(this.text);
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                             // console.log(this.series.name);
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    // fillColor: '#FFFFFF',
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'Y value',
							            data: 	yDataSeries,
							            color:  "#3362ff",
							            id: 'yvalue dataseries',
						           	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'yvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'yvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'yvalue dataseries',
					                     color: "#ffff00",
							        }]
				  			 	});
						 if(selectedSite != ""){
			                var chart = $('#accel-2').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
			           		}
			    $("#accel-3").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },
							        },
							        title: {
							            text: ' Z axis ',
									             style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'Z value',
							            data: 	zDataSeries,
							            color:  "#ff4500",
							            id: 'zvalue dataseries',
						           	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'zvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'zvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'zvalue dataseries',
					                     color: "#ffff00",
							        }]
				  			 	});
						 if(selectedSite != ""){
			                var chart = $('#accel-3').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
			           		}


	}else{
		var d1_data = data1(dfrom,dto,selectedSite,frm);
		var d2_data = data2(dfrom,dto,selectedSite,frm);
		var d3_data = data3(dfrom,dto,selectedSite,frm);
		var d4_data = data4(dfrom,dto,selectedSite,frm);
		var datName = ["1","2","3","v"];
		$.when(d1_data , d2_data ,d3_data, d4_data ).done(function(data , data2 , data3 ,data4 ) {
			var jsonRespo = data[0];
			var jsonRespo2 = data2[0];
			var jsonRespo3 = data3[0];
			var jsonRespo4 = data4[0];
			var xDataSeries=[] , xDataSeries2=[] ,  xDataSeries3=[] , xDataSeries4=[]
			          for (i = 0; i < jsonRespo.length; i++) {
		                var xData=[];
		                var time =  Date.parse(jsonRespo[i].timestamp);
		                xData.push(time, parseFloat(jsonRespo[i].xvalue));
		                xDataSeries.push(xData);
		            	}
		            	for (i = 0; i < jsonRespo2.length; i++) {
		                var xData2=[];
		                var time2 =  Date.parse(jsonRespo2[i].timestamp);
		                xData2.push(time2, parseFloat(jsonRespo2[i].xvalue));
		                xDataSeries2.push(xData2);
		            	}

		            	for (i = 0; i < jsonRespo3.length; i++) {
		                var xData3=[];
		                var time3 =  Date.parse(jsonRespo3[i].ts);
		                xData3.push(time3, parseFloat(jsonRespo3[i].x));
		                xDataSeries3.push(xData3);
		            	}

		            	for (i = 0; i < jsonRespo4.length; i++) {
		                var xData4=[];
		                var time4 =  Date.parse(jsonRespo4[i].ts);
		                xData4.push(time4, parseFloat(jsonRespo4[i].x));
		                xDataSeries4.push(xData4);
		            	}
		             Highcharts.setOptions({
	                                global: {
	                                        timezoneOffset: -8 * 60
	                                    }
	                                });
		             $("#accel-1").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },
							        },
							        title: {
							            text: ' X axis ',
									             style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'X value',
							            data: 	xDataSeries,
							            color:  "#5ff101",
							            id: 'xvalue dataseries',
							           
							        },{
							        	 name:  'X value 2',
							            data: 	xDataSeries2,
							            color:  "#fff",
							        
							         },{
							        	 name:  'X filter',
							            data: 	xDataSeries3,
							            color:  "#9301f1",
							           
							        },{
							        	 name:  'X filter2',
							            data: 	xDataSeries4,
							            color: "#01f193",
						           	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'xvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'xvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'xvalue dataseries',
					                     color: "#ffff00",
							        }]
				  			 	});
						 if(selectedSite != ""){
			                var chart = $('#accel-1').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
				             chart.series[4].hide();
				             chart.series[5].hide();
				             chart.series[6].hide();
			           		}
		 });

		$.when(d1_data , d2_data ,d3_data, d4_data ).done(function(data , data2 , data3 ,data4 ) {
			var jsonRespo = data[0];
			var jsonRespo2 = data2[0];
			var jsonRespo3 = data3[0];
			var jsonRespo4 = data4[0];
			var yDataSeries=[] , yDataSeries2=[] ,  yDataSeries3=[] , yDataSeries4=[]
			 
			          for (i = 0; i < jsonRespo.length; i++) {
		                var yData=[];
		                var time =  Date.parse(jsonRespo[i].timestamp);
		                yData.push(time, parseFloat(jsonRespo[i].yvalue));
		                yDataSeries.push(yData);
		            	}
		            	for (i = 0; i < jsonRespo2.length; i++) {
		                var yData2=[];
		                var time2 =  Date.parse(jsonRespo2[i].timestamp);
		                yData2.push(time2, parseFloat(jsonRespo2[i].yvalue));
		                yDataSeries2.push(yData2);
		            	}

		            	for (i = 0; i < jsonRespo3.length; i++) {
		                var yData3=[];
		                var time3 =  Date.parse(jsonRespo3[i].ts);
		                yData3.push(time3, parseFloat(jsonRespo3[i].y));
		                yDataSeries3.push(yData3);
		            	}

		            	for (i = 0; i < jsonRespo4.length; i++) {
		                var yData4=[];
		                var time4 =  Date.parse(jsonRespo4[i].ts);
		                yData4.push(time4, parseFloat(jsonRespo4[i].y));
		                yDataSeries4.push(yData4);
		            	}
		             Highcharts.setOptions({
	                                global: {
	                                        timezoneOffset: -8 * 60
	                                    }
	                                });
		             $("#accel-2").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
						                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						                 stops: [
						                    [0, '#2a2a2b'],
						                    [1, '#3e3e40']
						                 ]
						              },
					     		   },
							        title: {
							            text: 'Y axis',
							                   style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							        tooltip: {
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 	
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
								                 color: '#E0E0E3'
								              },
								              itemHoverStyle: {
								                 color: '#FFF'
								              },
								              itemHiddenStyle: {
								                 color: '#606063'
								              }
							        },
							        series: [{
							            name:  'Y value',
							            data: 	yDataSeries,
							            color:  "#3362ff",
							            id: 'yvalue dataseries',
							           
							        },{
							        	 name:  'Y value 2',
							            data: 	yDataSeries2,
							            color:  "#fff",
							        
							         },{
							        	 name:  'Y filter',
							            data: 	yDataSeries3,
							            color:  "#9301f1",
							           
							        },{
							        	 name:  'Y filter2',
							            data: 	yDataSeries4,
							            color: "#01f193",
							        },{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'yvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'yvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'yvalue dataseries',
					                     color: "#ffff00",
							        }]

				  			 	});
					  if(selectedSite != ""){
			                var chart = $('#accel-2').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
				             chart.series[4].hide();
				             chart.series[5].hide();
				             chart.series[6].hide();
			           		}
		 });
		$.when(d1_data , d2_data ,d3_data, d4_data ).done(function(data , data2 , data3 ,data4 ) {
			var jsonRespo = data[0];
			var jsonRespo2 = data2[0];
			var jsonRespo3 = data3[0];
			var jsonRespo4 = data4[0];
			var zDataSeries=[] , zDataSeries2=[] ,  zDataSeries3=[] , zDataSeries4=[]
			 
			          for (i = 0; i < jsonRespo.length; i++) {
		                var zData=[];
		                var time =  Date.parse(jsonRespo[i].timestamp);
		                zData.push(time, parseFloat(jsonRespo[i].zvalue));
		                zDataSeries.push(zData);
		            	}
		            	for (i = 0; i < jsonRespo2.length; i++) {
		                var zData2=[];
		                var time2 =  Date.parse(jsonRespo2[i].timestamp);
		                zData2.push(time2, parseFloat(jsonRespo2[i].zvalue));
		                zDataSeries2.push(zData2);
		            	}

		            	for (i = 0; i < jsonRespo3.length; i++) {
		                var zData3=[];
		                var time3 =  Date.parse(jsonRespo3[i].ts);
		                zData3.push(time3, parseFloat(jsonRespo3[i].z));
		                zDataSeries3.push(zData3);
		            	}

		            	for (i = 0; i < jsonRespo4.length; i++) {
		                var zData4=[];
		                var time4 =  Date.parse(jsonRespo4[i].ts);
		                zData4.push(time4, parseFloat(jsonRespo4[i].z));
		                zDataSeries4.push(zData4);
		            	}

		            Highcharts.setOptions({
	                                global: {
	                                        timezoneOffset: -8 * 60
	                                    }
	                                });

		             $("#accel-3").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							            panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
						                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						                 stops: [
						                    [0, '#2a2a2b'],
						                    [1, '#3e3e40']
						                 ]
						              },
							        },
							        title: {
							            text: 'Z axis',
							                   style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	// console.log(this.series.tooltipOptions.pointFormat[point]);
							                        	// console.log(this.text);
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
							                 color: '#E0E0E3'
							              },
							              itemHoverStyle: {
							                 color: '#FFF'
							              },
							              itemHiddenStyle: {
							                 color: '#606063'
							              }
							        },
							        series: [{
							            name:  'Z value',
							            data: 	zDataSeries,
							            color:  "#ff4500",
							            id: 'zvalue dataseries',
							           
							        },{
							        	 name:  'Z value 2',
							            data: 	zDataSeries2,
							            color:  "#fff",
							        
							         },{
							        	 name:  'Z filter',
							            data: 	zDataSeries3,
							            color:  "#9301f1",
							           
							        },{
							        	 name:  'Z filter2',
							            data: 	zDataSeries4,
							            color: "#01f193",
							        },{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'zvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'zvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'zvalue dataseries',
					                     color: "#ffff00",
							        }]

				  			 	});
					  if(selectedSite != ""){
			                var chart = $('#accel-3').highcharts();
			                 chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
				             chart.series[4].hide();
				             chart.series[5].hide();
				             chart.series[6].hide();
			           		}
		 });

		$.when(d1_data , d2_data ).done(function(data , data2 ) {
			var jsonRespo = data[0];
			var jsonRespo2 = data2[0];
			var vDataSeries=[] , vDataSeries2=[];
			 
			          for (i = 0; i < jsonRespo.length; i++) {
		                var vData=[];
		                var time =  Date.parse(jsonRespo[i].timestamp);
		                vData.push(time, parseFloat(jsonRespo[i].batt));
		                vDataSeries.push(vData);
		            	}
		            	for (i = 0; i < jsonRespo2.length; i++) {
		                var vData2=[];
		                var time2 =  Date.parse(jsonRespo2[i].timestamp);
		                vData2.push(time2, parseFloat(jsonRespo2[i].batt));
		                vDataSeries2.push(vData2);
		            	}

		            	 Highcharts.setOptions({
	                                global: {
	                                        timezoneOffset: -8 * 60
	                                    }
	                                });
		           

		             $("#accel-v").highcharts({
							        chart: {
							           type: 'spline',
							            zoomType: 'x',
							        	panning: true,
            							panKey: 'shift',
							           height: 230,
							              backgroundColor: {
							                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
							                 stops: [
							                    [0, '#2a2a2b'],
							                    [1, '#3e3e40']
							                 ]
							              },

							        },
							        title: {
							            text: ' Battery',
							                   style: {
								         color: '#E0E0E3',
								         textTransform: 'uppercase',
								         fontSize: '20px'
								      }
							        },
							        
							        xAxis: {
							            type: 'datetime',
							            dateTimeLabelFormats: { // don't display the dummy year
							                month: '%e. %b',
							                year: '%b'
							            },
							            title: {
							                text: 'Date'
							            }
							        },
							   
							        tooltip: {
							            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
							           shared: true,
							           crosshairs: true
							        },

							        plotOptions: {
							        	turboThreshold: 0,
							             series: {
							                cursor: 'pointer',
							                point: {
							                    events: {
							                        click: function () {
							                        	if(this.series.name =="Comment"){
							                        		
							                        		 $("#anModal").modal("show");
							                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
							                        	}else if(this.series.name =="Alert" ){
							                        		
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}else if(this.series.name =="Maintenace"){
							                        	
							                        		 $("#anModal").modal("show");
							                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
							                        		
							                        	}
							                        	else {
							                            $("#annModal").modal("show");
							                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
							                         }
							                        }
							                    }
							                }
							            },
							            spline: {
							                marker: {
							                    // fillColor: '#FFFFFF',
							                    lineWidth: 0,
							                    lineColor: null // inherit from series
							                }
							            }

							        },
							        legend: {
							            layout: 'vertical',
							            align: 'right',
							            verticalAlign: 'middle',
							            borderWidth: 0,
							              itemStyle: {
						                 color: '#E0E0E3'
						              },
						              itemHoverStyle: {
						                 color: '#FFF'
						              },
						              itemHiddenStyle: {
						                 color: '#606063'
						              }
							        },
							        series: [{
							            name:  'V value',
							            data: 	vDataSeries,
							            color:  "#d48a3b",
							            id: 'vvalue dataseries',
							           
							        },{
							        	 name:  'V value 2',
							            data: vDataSeries2,
							            color:  "#fff",
							      
							        	},{
					                    type: 'flags',
					                    name:'Alert',
					                    data: alertReport,
					                    shape: 'circlepin',
					                    width: 35,
					                    onSeries: 'vvalue dataseries',
					                     color: '#ff8000',
					                },{
					                    type: 'flags',
					                    name:'Maintenace',
					                    data: maintenaceReport,
					                    shape: 'flag',
					                    width: 25,
					                    onSeries: 'vvalue dataseries',
					                     color: "#ffbf00",
					                },{
					                    type: 'flags',
					                    name:'Comment',
					                    data: extraReport,
					                    shape: 'circlepin',
					                    width: 25,
					                    onSeries: 'vvalue dataseries',
					                     color: "#ffff00",
							        }]

				  			 	});
					  if(selectedSite != ""){
			                var chart = $('#accel-v').highcharts();
			                chart.series[1].hide();
				             chart.series[2].hide();
				             chart.series[3].hide();
				             chart.series[4].hide();
			           		}
		 });
	}
}

function data1(dfrom,dto,selectedSite,frm){
			var start = new Date().getTime();
			return $.ajax({ 
			   dataType: "json",
			  url: "/ajax/getSenslopeData.php?accel3&from=" + dfrom + "&to=" + dto + "&nid=" + frm.node.value + "&site=" + selectedSite + "&db=senslopedb",  success: function(result) {
			  }
			});	
}


function data2(dfrom,dto,selectedSite,frm){
	var start = new Date().getTime();
		return	$.ajax({ 
			   dataType: "json",
			  url: "/ajax/getSenslopeData.php?accel3&from=" + dfrom + "&to=" + dto + "&nid=" + frm.node.value + "&site=" + selectedSite + "&db=senslopedb" + "&dataset=2" ,success: function(result) {
			  }
			});
		
}
function data3(dfrom,dto,selectedSite,frm){
	var version =document.getElementById("header-site").innerHTML;
	var newVersion = version.substr(8, version.length-25);
	var version ="";
	if(V2V == 2){
		var version = 32;
	}else if ( V2V == 3){
		var version = 11;
	}
	var start = new Date().getTime();
		return	$.ajax({ 
			   dataType: "json",
			  url: "/ajax/accelfilteredData.php?site="+selectedSite+"&fdate="+dfrom+"&tdate="+dto+"&mid="+version+"&nodeid="+ frm.node.value   ,success: function(result) {
			  	var end = new Date().getTime();
			  }
			});
		
}
function data4(dfrom,dto,selectedSite,frm){
var version =document.getElementById("header-site").innerHTML;
	var newVersion = version.substr(8, version.length-25);
	var version ="";
	if(V2V == 2){
		var version = 33;
	}else if ( V2V == 3){
		var version = 12;
	}
	var start = new Date().getTime();
		return	$.ajax({ 
			   dataType: "json",
			  url: "/ajax/accelfilteredData.php?site="+selectedSite+"&fdate="+dfrom+"&tdate="+dto+"&mid="+version+"&nodeid="+ frm.node.value   ,success: function(result) {
			  	var end = new Date().getTime();
			  }
			});
		
			
}
function showSoms(frm) {
		if(V2V == 3){
		$(".accelM").hide();
	}
	var rsiteid = '';
	var dfrom = $('#reportrange span').html().slice(0,10);
	var dto = $('#reportrange span').html().slice(13,23);
	var selectedSite = frm.sitegeneral.value;
	var domainName = window.location.hostname;
	var version =document.getElementById("header-site").innerHTML;
	var newVersion = version.substr(8, version.length-25);
	var m ="m";
	if (V2V == 2){
		if (selectedSite == "nagsa"){
			var msgid2 = "21";
		}else{
			var msgid1 = "111";
		}	
		var URL = "/ajax/somsV2.php?site="+selectedSite+"&fdate=" + dfrom  +"&tdate=" + dto  + "&nid=" + frm.node.value ;
		var URL2 ="/ajax/somsFilter.php?site="+ selectedSite + "&fdate=" + dfrom  +"&tdate=" + dto + "&nid=" + frm.node.value +"&mode=0" ;
	} else if( V2V == 3 )  {
		var msgid1 = "110";
		var m ="m";
		var URL = "/ajax/soms.php?site="+selectedSite+m+"&fdate=" + dfrom  +"&tdate=" + dto  + "&ms1=" +msgid1 + "&nid=" + frm.node.value;
		var URL2 ="/ajax/somsFilter.php?site="+ selectedSite + "&fdate=" + dfrom  +"&tdate=" + dto   + "&nid=" + frm.node.value +"&mode=0" ;
	}


	$.ajax({
	  	url: URL,
		  dataType: "text",
	   success: function(data)
	        {
	        	$.ajax({
				  	url: URL2,
					dataType: "text",
				   	success: function(data2)
				        {
		            var jsonRespo = JSON.parse(data);
		            var jsonRespo2 = JSON.parse(data2);
		            var rDataSeries=[] , rfDataSeries=[] ;
		           if (newVersion == 2){
			            for (i = 0; i < jsonRespo.length; i++) {
			                var rData=[];
			                var time =  Date.parse(jsonRespo[i].ts);
			                rData.push(time, parseFloat(jsonRespo[i].raw));
			                rDataSeries.push(rData);
			            }
			        }else if(newVersion == 3){
			        	for (i = 0; i < jsonRespo.length; i++) {
			                var rData=[];
			                var time =  Date.parse(jsonRespo[i].timestamp);
			                rData.push(time, parseFloat(jsonRespo[i].mval1));
			                rDataSeries.push(rData);
			            }
			        }
			            for (i = 0; i < jsonRespo2.length; i++) {
			                var rData=[];
			                var time =  Date.parse(jsonRespo2[i].ts);
			                rData.push(time, parseFloat(jsonRespo2[i].mval1));
			                rfDataSeries.push(rData);
			            }
				         var divContainer =["accel-r"];
			             var divname =["Soil Moisture: Raw"];
			             var namediv= ["Soms: Raw" , "Soms: Raw filter"];
			             var d1 =rDataSeries , d2 =rfDataSeries ;
			             var color =["#00a09e" ,"#fff"];
			              for (i = 0; i < divContainer.length; i++) {
				           	  Highcharts.setOptions({
			                                global: {
			                                        timezoneOffset: -8 * 60
			                                    }
			                                });
					            $("#"+divContainer[i]).highcharts({
									        chart: {
									           type: 'spline',
									            zoomType: 'x',
									            panning: true,
            									panKey: 'shift',
									           height: 230,
									           backgroundColor: {
									                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
									                 stops: [
									                    [0, '#2a2a2b'],
									                    [1, '#3e3e40']
									                 ]
									              },
									        },
									        title: {
									            text: divname[i],
									                   style: {
										         color: '#E0E0E3',
										         textTransform: 'uppercase',
										         fontSize: '20px'
										      }
									        },
									        
									        xAxis: {
									            type: 'datetime',
									            dateTimeLabelFormats: { // don't display the dummy year
									                month: '%e. %b',
									                year: '%b'
									            },
									            title: {
									                text: 'Date'
									            }
									        },
									   
									        tooltip: {
									           shared: true,
									           crosshairs: true
									        },

									        plotOptions: {
									        	turboThreshold: 0,
									             series: {
									                cursor: 'pointer',
									                point: {
									                    events: {
									                        click: function () {
									                        	if(this.series.name =="Comment"){
									                        		
									                        		 $("#anModal").modal("show");
									                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
									                        	}else if(this.series.name =="Alert" ){
									                        		
									                        		 $("#anModal").modal("show");
									                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
									                        		
									                        	}else if(this.series.name =="Maintenace"){
									                        	
									                        		 $("#anModal").modal("show");
									                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
									                        		
									                        	}
									                        	else {
									                            $("#annModal").modal("show");
									                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
									                             // console.log(this.series.name);
									                         }
									                        }
									                    }
									                }
									            },
									            spline: {
									                marker: {
									                    // fillColor: '#FFFFFF',
									                    lineWidth: 0,
									                    lineColor: null // inherit from series
									                }
									            }

									        },
									        legend: {
									            layout: 'vertical',
									            align: 'right',
									            verticalAlign: 'middle',
									            borderWidth: 0,
									             itemStyle: {
								                 color: '#E0E0E3'
								              },
								              itemHoverStyle: {
								                 color: '#FFF'
								              },
								              itemHiddenStyle: {
								                 color: '#606063'
								              }
									        },
									        series: [{
									            name:  namediv[i],
									            data: 	d1,
									            color:  color[i],
									            id: divname[i]+'dataseries',
									        },{
									        	name:  namediv[i+1],
									            data: 	d2,
									            color:  color[i+1],
									        },{
									        	type: 'flags',
									        	name:'Alert',
									        	data: alertReport,
								                shape: 'circlepin',
								                width: 35,
								               color: '#ff8000',
								                onSeries: divname[i]+'dataseries',
								             },{
									        	type: 'flags',
									        	name:'Maintenace',
									        	data: maintenaceReport,
								                shape: 'flag',
								                width: 25,
								                 color: "#ffbf00",
								                onSeries: divname[i]+'dataseries',
								                },{
									        	type: 'flags',
									        	name:'Comment',
									        	data: extraReport,
									        	shape: 'circlepin',
								                width: 25,
								                color: "#ffff00",
								                onSeries: divname[i]+'dataseries',
									        }]
						  			 	});
					             if(selectedSite != ""){
					                var chart = $('#'+divContainer[i]).highcharts();
						             chart.series[1].hide();
						             chart.series[2].hide();
						             chart.series[3].hide();
						             chart.series[4].hide();
					           		}
						    }  
		        	}
				})
	        }
		})
	if (newVersion == 2){
		if (selectedSite == "nagsa"){
			var msgid2 = "26";
		}else{
			var msgid2 = "112";
		}
		var URL21 = "/ajax/soms.php?site="+selectedSite+m+"&fdate=" + dfrom  +"&tdate=" + dto  + "&ms1=" +msgid2 + "&nid=" + frm.node.value;
		var URL22 ="/ajax/somsFilter.php?site="+ selectedSite + "&fdate=" + dfrom  +"&tdate=" + dto  + "&nid=" + frm.node.value +"&mode=1" ;
	} else if(newVersion == 3)  {
		var msgid2 = "113";
		var URL21 = "/ajax/soms.php?site="+selectedSite+m+"&fdate=" + dfrom  +"&tdate=" + dto  + "&ms1=" +msgid2 + "&nid=" + frm.node.value;
		var URL22 ="/ajax/somsFilter.php?site="+ selectedSite + "&fdate=" + dfrom  +"&tdate=" + dto  + "&nid=" + frm.node.value +"&mode=1" ;
	} 
	

 $.ajax({
	  	url: URL21,
		dataType: "text",
	   	success: function(data)
	        {
	        	$.ajax({
	  				url: URL22,
		 			dataType: "text",
	   				success: function(data2)
	        		{
			            var jsonRespo = JSON.parse(data);
			            var jsonRespo2 = JSON.parse(data2);
			            var cDataSeries=[] , cfDataSeries=[]  ;
			         	for (i = 0; i < jsonRespo.length; i++) {
			                var cData =[];
			                var time2 =  Date.parse(jsonRespo[i].timestamp);
			                cData.push(time2, parseFloat(jsonRespo[i].mval1));
			                cDataSeries.push(cData);
			            }
			            for (i = 0; i < jsonRespo2.length; i++) {
			                var cData2 =[];
			                var time2 =  Date.parse(jsonRespo2[i].ts);
			                cData2.push(time2, parseFloat(jsonRespo2[i].mval1));
			                cfDataSeries.push(cData2);
			            }
		                var divContainer =["accel-c"];
			             var divname =["Soil Moisture : Cal"];
			             var d1 =cDataSeries , d2 = cfDataSeries;
			             var color =["#00ff80" ,"#ffff00"];
			        	 // $("#accelM").hide();
	            		for (i = 0; i < divContainer.length; i++) {
	           				 Highcharts.setOptions({
                                global: {
                                        timezoneOffset: -8 * 60
                                    }
                                });
		          			  $("#"+divContainer[i]).highcharts({
						        chart: {
						           	type: 'spline',
						           	zoomType: 'x',
						            panning: true,
            						panKey: 'shift',
						           	height: 200,
						           	backgroundColor: {
						                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						                 stops: [
						                    [0, '#2a2a2b'],
						                    [1, '#3e3e40']
						                 ]
						              },

						        },
						        title: {
						            text: divname[i],
						                   style: {
							         color: '#E0E0E3',
							         textTransform: 'uppercase',
							         fontSize: '20px'
							      }
						        },
						        
						        xAxis: {
						            type: 'datetime',
						            dateTimeLabelFormats: { // don't display the dummy year
						                month: '%e. %b',
						                year: '%b'
						            },
						            title: {
						                text: 'Date'
						            }
						        },
						   
						        tooltip: {
						            // pointFormat: '<b>{series.name}</b>: {point.y:.2f}<br>',
						           shared: true,
						           crosshairs: true
						        },

						        plotOptions: {
						        	turboThreshold: 0,
						             series: {
						                cursor: 'pointer',
						                point: {
						                    events: {
						                        click: function () {
						                        	// console.log(this.series.tooltipOptions.pointFormat[point]);
						                        	// console.log(this.text);
						                        	if(this.series.name =="Comment"){
						                        		
						                        		 $("#anModal").modal("show");
						                        		  $("#link").append('<table class="table"><label>'+this.series.name+' Report no. '+ this.text+'</label><tbody><tr><td><label>Site Id</label><input type="text" class="form-control" id="site_id" name="site_id" value="'+selectedSite+'" disabled= "disabled" ></td></tr><tr><td><label>Timestamp</label><div class="input-group date datetime" id="entry"><input type="text" class="form-control col-xs-3" id="tsAnnotation" name="tsAnnotation" placeholder="Enter timestamp (YYYY-MM-DD hh:mm:ss)" disabled= "disabled" value="'+moment(this.x).format('YYYY-MM-DD HH:mm:ss')+'" style="width: 256px;"/><div> </td></tr><tr><td><label>Report</label><textarea class="form-control" rows="3" id="comment"disabled= "disabled">'+this.report+'</textarea></td></tr><tr><td><label>Flagger</label><input type="text" class="form-control" id="flaggerAnn" value="'+this.flagger+'"disabled= "disabled"></td></tr></tbody></table>');
						                        	}else if(this.series.name =="Alert" ){
						                        		
						                        		 $("#anModal").modal("show");
						                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/publicrelease/event/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
						                        		
						                        	}else if(this.series.name =="Maintenace"){
						                        	
						                        		 $("#anModal").modal("show");
						                        		 $("#link").append('For more info:<a href="http://www.dewslandslide.com/gold/sitemaintenancereport/individual/'+ this.text+'">'+this.series.name+' Report no. '+ this.text+'</a>'); 
						                        		
						                        	}
						                        	else {
						                            $("#annModal").modal("show");
						                             $("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss')); 
						                             // console.log(this.series.name);
						                         }
						                        }
						                    }
						                }
						            },
						            spline: {
						                marker: {
						                    // fillColor: '#FFFFFF',
						                    lineWidth: 0,
						                    lineColor: null // inherit from series
						                }
						            }

						        },
						        legend: {
						            layout: 'vertical',
						            align: 'right',
						            verticalAlign: 'middle',
						            borderWidth: 0,
						             itemStyle: {
					                 color: '#E0E0E3'
					              },
					              itemHoverStyle: {
					                 color: '#FFF'
					              },
					              itemHiddenStyle: {
					                 color: '#606063'
					              }
						        },
						        series: [{
						            name:  'Soms: Cal',
						            data: 	d1,
						            color:  color[i],
						            id: divname[i]+'dataseries',  
						        },{
						        	name:  'Soms: Cal filter',
						            data: 	d2,
						            color:  color[i+1],
						        },{
						        	type: 'flags',
						        	name:'Alert',
						        	data: alertReport,
					                shape: 'circlepin',
					                width: 35,
					               color: '#ff8000',
					                onSeries: divname[i]+'dataseries',
					             },{
						        	type: 'flags',
						        	name:'Maintenace',
						        	data: maintenaceReport,
					                shape: 'flag',
					                width: 25,
					                 color: "#ffbf00",
					                onSeries: divname[i]+'dataseries',
					                },{
						        	type: 'flags',
						        	name:'Comment',
						        	data: extraReport,
						        	shape: 'circlepin',
					                width: 25,
					                color: "#ffff00",
					                onSeries: divname[i]+'dataseries',
						        }]
			  			 	});
		             if(selectedSite != ""){
		                var chart = $('#'+divContainer[i]).highcharts();
			             chart.series[1].hide();
			             chart.series[2].hide();
			             chart.series[3].hide();
			             chart.series[4].hide();
		           		}
			       		}
			        }
				})
	   		 }
		})
}



function showAndClearField(frm){
  if (fromData == "")
	  alert("Hey! You didn't enter anything!");
  else
	  alert("The field contains the text: " + fromData);
  fromData = "";
}

