function showLSBChange(frm) {
	showLSBChangeGeneral(frm, 'lsb-change-canvas');
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function showLSBChangeGeneral(frm, e) {

    var dfrom = window.location.href.slice(35,45);
    var dto = window.location.href.slice(46,56);
    // console.log("http://localhost/ajax/getLsbChangeFromPurged.php?site="+frm.sitegeneral.value+"&node=1&start="+dfrom+"&end="+dto);
    
$.ajax({
    url: "http://www.dewslandslide.com/ajax/getLsbChangeFromPurged.php?site="+frm.sitegeneral.value+"&node=1&start="+dfrom+"&end="+dto,
     
  dataType: "text",
   success: function(data)
        { 
    
          if(data.slice(0,2) != "No" ){
            var jsonRespo = JSON.parse(data);
                    var xDataSeries=[];
                    var yDataSeries=[];
                    var zDataSeries=[];
                    for (i = 0; i < jsonRespo.length; i++) {
                        var xData=[];
                        var yData=[];
                        var zData=[];
                        var time =  Date.parse(jsonRespo[i].ts);
                        xData.push(time, jsonRespo[i].x);
                        yData.push(time, jsonRespo[i].y);
                        zData.push(time, jsonRespo[i].z);
                        xDataSeries.push(xData);
                        yDataSeries.push(yData);
                        zDataSeries.push(zData);
                    }
                 
          // initHighcharts: function() {
                    $('#container').highcharts({
                chart: {
                     type: 'area',
                    zoomType: 'x',
                    
                      backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                 stops: [
                    [0, '#2a2a2b'],
                    [1, '#3e3e40']
                 ]
              },
                },
                title: {
                    text: 'LSB Change',
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
                yAxis: {
                    title: {
                        text: 'Accel Change'
                    },
                },
                tooltip: {
                   shared: true,
                   crosshairs: true
                },


                plotOptions: {
                     series: {

                        cursor: 'pointer',
                         point: {
                          events: {
                              click: function () {
                                // console.log(this.series.tooltipOptions.pointFormat[point]);
                                console.log(this.text);
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
                                   console.log(this.series.name);
                               }
                              }
                          }
                      }
                    },
                    spline: {
                        marker: {
                            fillColor: '#FFFFFF',
                            lineWidth: 2,
                            lineColor: null // inherit from series
                        }
                    },
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
                    name: 'X Value',
                    data:  xDataSeries,
                    fillOpacity: 0.1,
                    zIndex: 0,
                    lineWidth: 1,
                    color:  "#00e673",
                       
                }, {
                    name: 'Y Value',
                    data:  yDataSeries,
                     id: 'dataseries',
                     fillOpacity: 0.1,
                    zIndex: 0,
                    lineWidth: 1,
                     color: "#33cccc",
                }, {
                    name: 'Z value',
                    data:  zDataSeries,
                    fillOpacity: 0.1,
                    zIndex: 0,
                    lineWidth: 1,
                     color: "#ff6600",
                  },{
                    type: 'flags',
                    name:'Alert',
                    data: alertReport,
                    shape: 'circlepin',
                    width: 35,
                    onSeries: 'dataseries',
                     color: '#ff8000',
                  },{
                    type: 'flags',
                    name:'Maintenace',
                    data: maintenaceReport,
                    shape: 'flag',
                    width: 25,
                    onSeries: 'dataseries',
                     color: "#ffbf00",
                   },{
                    type: 'flags',
                    name:'Comment',
                    data: extraReport,
                    shape: 'circlepin',
                    width: 25,
                    onSeries: 'dataseries',
                     color: "#ffff00",
                }]

              });
        
           
             if(frm.sitegeneral.value != ""){
                    var chart = $('#container').highcharts();
                   chart.series[3].hide();
                   chart.series[4].hide();
                   chart.series[5].hide();
             }
          }else{
            $('#loading').modal("hide");
            $("#container").append('<br><p align="center"><b>'+data+'</b></p>');
          }
    }
  })
}
