let DATA_TAGGING_ENABLED = false;
let CHART_ENABLE = null;
let DATA_POINT_SELECTED = null;
let OLD_TAGS = null;
$(document).ready(() => {
	initializeDataTaggingButton();
	initalizeAllTags();
});

function initalizeAllTags(){
	OLD_TAGS = null;
	getAllDataTags()
    .done((tags) => {
        displayDataTags(tags);
        OLD_TAGS = tags;
    })
    .catch((x) => {
        showErrorModal(x, "data tag list");
    });
}

function initializeDataTaggingButton () {
	let timeOut;

	class Item {
	    constructor(icon, backgroundColor) {
	        this.$element = $(document.createElement("div"));
	        this.icon = icon;
	        this.$element.addClass("item");
	        this.$element.css("background-color", backgroundColor);
	        let i = document.createElement("i");
	        $(i).addClass("fa fa-" + icon);
	        this.$element.append(i);
	        this.prev = null;
	        this.next = null;
	        this.isMoving = false;
	        let element = this;
	        this.$element.on("mousemove", function() {
	            clearTimeout(timeOut);
	            timeOut = setTimeout(function() {
	                if (element.next && element.isMoving) {
	                    element.next.moveTo(element);
	                } 
	            }, 10);
	        });
	    }
	    
	    moveTo(item) {
	        anime({
	            targets: this.$element[0],
	            left: item.$element.css("left"),
	            top: item.$element.css("top"),
	            duration: 700,
	            elasticity: 500
	        });
	        if (this.next) {
	            this.next.moveTo(item);
	        }
	    }

	    updatePosition() {    
	        anime({
	            targets: this.$element[0],
	            left: this.prev.$element.css("left"),
	            top: this.prev.$element.css("top"),
	            duration: 200
	        });
	        
	        if (this.next) {
	            this.next.updatePosition();
	        }
	    }
	}

	class Menu {
	    constructor(menu) {
	        this.$element = $(menu);
	        this.size = 0;
	        this.first = null;
	        this.last = null;
	        this.timeOut = null;
	        this.hasMoved = false;
	        this.status = "closed";
	    }
	    
	    add(item) {
	        let menu = this;
	        if (this.first == null) {
	            this.first = item;
	            this.last = item;
	            this.first.$element.on("mouseup", function() {
	                if (menu.first.isMoving) {
	                    menu.first.isMoving = false;        
	                } else {
	                    menu.click();
	                }
	            }); 
	            item.$element.draggable(
	                {
	                    start: function() {
	                        menu.close();
	                        item.isMoving = true;
	                    }  
	                },
	                {
	                    drag: function() {
	                        if (item.next) {
	                            item.next.updatePosition();
	                        }
	                    }
	                },
	                {
	                    // stop: function() {
	                    //     item.isMoving = false;
	                    //     item.next.moveTo(item);
	                    // }
	                }
	            );
	        } else {
	            this.last.next = item;
	            item.prev = this.last;
	            this.last = item;
	        }
	        this.$element.after(item.$element);
	        
	        
	    }
	    
	    open() {
	        this.status = "open";
	        let current = this.first.next;
	        let iterator = 1;
	        let head = this.first;
	        let sens = head.$element.css("left") < head.$element.css("right") ? 1 : -1;
	        while (current != null) {
	            anime({
	                targets: current.$element[0],
	                left: parseInt(head.$element.css("left"), 10) + (sens * (iterator * 50)),
	                top: head.$element.css("top"),
	                duration: 500
	            });
	            iterator++;
	            current = current.next;
	        }    
	    }
	    
	    close() {
	        this.status = "closed";
	        let current = this.first.next;
	        let head = this.first;
	        let iterator = 1;
	        while (current != null) {
	            anime({
	                targets: current.$element[0],
	                left: head.$element.css("left"),
	                top: head.$element.css("top"),
	                duration: 500
	            });
	            iterator++;
	            current = current.next;
	        }
	    }
	    
	    click() {
	        if (this.status == "closed") {
	            this.open();
	        } else {
	            this.close();
	        }
	    }
	    
	}

	let menu = new Menu("#data-tagging");
	let item2 = new Item("tags", "#2e6da4");

	menu.add(item2);
	$(document).delay(50).queue(function(next) {
	    menu.open();
	    next();
	    $(document).delay(1000).queue(function(next) {
	        menu.close();
	        next();
	    });
	}); 

	$("#data-tagging-container").click(function(){
		$("#data-tagging-modal-size").addClass("modal-sm");
		$("#tag-details").hide();
		$("#data-tag-container").hide();
		$("#charts-tagging-option").hide();
		$("#btn-save-data-tag").hide();
		$("#data-tagging-modal").modal("show");
		$("#tag_selected").tagsinput('removeAll');
		if(DATA_TAGGING_ENABLED == true){
			$("#charts-tagging-option").hide();
			$("#btn-enable-data-tagging").show();
			$("#btn-enable-data-tagging").removeClass("btn-primary").addClass("btn-danger").text("Disable");
		}else {
			$("#charts-tagging-option").show();
			$("#btn-enable-data-tagging").show();
			$("#btn-enable-data-tagging").removeClass("btn-danger").addClass("btn-primary").text("Enable");
		}
		$("#btn-enable-data-tagging").unbind("click");
		enableDataTagging();
	}); 
}

function enableDataTagging(){
	$("#btn-enable-data-tagging").click(function(){
		let selected = $("#charts-option").val().toLowerCase();
		let button_text = $("#btn-enable-data-tagging").text();
		console.log(selected);
		if(button_text == "Enable"){
			DATA_TAGGING_ENABLED = true;
			if(selected == "rainfall"){
				enableRainfallSelection();
			}else{
				enableSelectionOnSurficialChart();
			}
		}else {
			DATA_TAGGING_ENABLED = false;
			$("#plot-site-level").trigger("click");
		}
		$("#data-tagging-modal").modal("hide");
	}); 
}

function saveGeneralTagging (button_type, data) {
	console.log(data);
	let url = null;
	let success_message = null;
	data.data_tag = $("#tag_selected").tagsinput('items');
	data.user_id = $("#current_user_id").val();
	data.type = $("#charts-option").val().toLowerCase();
	if(button_type == "insert"){
		url = "../general_data_tagging/insert_tag_point";
		success_message = "Successfully added point(s).";
	}else if(button_type == "update"){
		url = "../general_data_tagging/modify_tag_point";
		success_message = "Successfully updated point(s).";
	}else {
		url = "../general_data_tagging/remove_tag_point";
		success_message = "Successfully deleted point(s).";
	}
	console.log(data);
	$.post(url, data)
    .done((result, textStatus, jqXHR) => {
        if(result == 1){
        	initalizeAllTags();
        	$.notify(success_message, "success");
        	$(".modal").modal("hide");
        }else {
        	$.notify("Something went wrong, Please try again.", "error");
        }
    })
    .catch((x) => {
    	// insert pms here
    })
    .always(() => {
    	//for closing loader modal
    });
}

function showSelectedData(){
	$("#btn-save-data-tag").unbind("click");
	$("#data-tagging-modal-size").removeClass("modal-sm");
	$("#tag-details").show();
	$("#charts-tagging-option").hide();
	$("#data-tagging-modal").modal("show");
	$("#btn-save-data-tag").show();
	$("#btn-enable-data-tagging").hide();
	$("#data_table").text(DATA_POINT_SELECTED.table);
	$("#data_start").text(DATA_POINT_SELECTED.data_start_id);
	$("#data_end").text(DATA_POINT_SELECTED.data_end_id);
	$("#data-tag-container").show();
	$("#btn-save-data-tag").click(function(){
		// console.log(DATA_POINT_SELECTED);
		saveGeneralTagging("insert", DATA_POINT_SELECTED);
	}); 
}

function selectPointsByDrag(e) {

    // Select points
    Highcharts.each(this.series, function (series) {
        Highcharts.each(series.points, function (point) {
            if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
                point.select(true, true);
            }
        });
    });

    // Fire a custom event
    Highcharts.fireEvent(this, 'selectedpoints', { points: this.getSelectedPoints() });

    return false; // Don't zoom
}

function toast(chart, text) {
    chart.toast = chart.renderer.label(text, 100, 120)
        .attr({
            fill: Highcharts.getOptions().colors[0],
            padding: 10,
            r: 5,
            zIndex: 8
        })
        .css({
            color: '#FFFFFF'
        })
        .add();

    setTimeout(function () {
        chart.toast.fadeOut();
    }, 2000);
    setTimeout(function () {
        chart.toast = chart.toast.destroy();
    }, 2500);
}

function displayDataTags (data) {
	$('#tag_selected').tagsinput({
		typeahead: {
			displayKey: 'text',
			afterSelect: function (val) { this.$element.val(""); },
			source: function (query) {
				return data;
			}
		}
	});
}

function getAllDataTags(){
	return $.getJSON("../general_data_tagging/tags");
}

function selectedPoints(e) {
    // Show a label
    // console.log(e.points);
    const datas = e.points;
    let tagged_data = [];
    let selected = $("#charts-option").val().toLowerCase();
    let table_name = null;
    datas.forEach((data) => {
    	if(selected == "rainfall"){
    		let rain_source = null;
    		try {
			    rain_source = data.graphic.renderer.cacheKeys[1].toString().split(" ");
			    console.log(data);
			} catch (e) {
			    if (e instanceof TypeError) {
			        // for catching TypeError
			    } else {
			        // for catching TypeError
			    }
			}

	    	if(table_name == null){
	    		try {
				    table_name = rain_source[2].toString().replace("<b>", "");
				    console.log(data);
				} catch (e) {
				    if (e instanceof TypeError) {
				        rain_source = data.series.graph.renderer.cacheKeys[1].toString().split(" ");
				        table_name = rain_source[1].toString().replace("<b>", "");
				    } else {
				        // console.log("catching type errror");
				    }
				}
	    	}
	    	
	    	let timestamp = new Date(data.x);
	    	timestamp = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
	    	if(tagged_data.includes(timestamp) !=  true){
	        	tagged_data.push(timestamp);
	        }
    	}else{
	        let id = data.id;
	        if(tagged_data.includes(id) !=  true){
	        	tagged_data.push(id);
	        }
    	}
    });
    console.log(tagged_data);
    if(selected == "surficial"){
    	table_name = "marker_observations";
    	DATA_POINT_SELECTED = {
	    	table: table_name,
	    	data_start_id: Math.min.apply(Math, tagged_data),
	    	data_end_id: Math.max.apply(Math, tagged_data)
	    };
    }else{
    	DATA_POINT_SELECTED = {
	    	table: table_name,
	    	data_start_id: tagged_data[0],
	    	data_end_id: tagged_data[tagged_data.length-1]
	    };
    }
    console.log(DATA_POINT_SELECTED);
    showSelectedData();

    toast(this, '<b>' + e.points.length + ' points selected.</b>' +
        '<br>Click on empty space to deselect.');
}

function unselectByClick() {
    var points = this.getSelectedPoints();
    if (points.length > 0) {
        Highcharts.each(points, function (point) {
            point.select(false);
        });
    }
}

function enableSelectionOnSurficialChart () {
    const { site_code, start_date, end_date } = SURFICIAL_INPUT;
    $(`#${site_code}-surficial`).highcharts({
        series: SURFICIAL_DATA,
        chart: {
            type: "line",
            zoomType: "x",
            events: {
                selection: selectPointsByDrag,
                selectedpoints: selectedPoints,
                click: unselectByClick
            },
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            }
        },
        title: {
            text: `<b>Surficial Data History Chart of ${site_code.toUpperCase()}</b>`,
            y: 22
        },
        subtitle: {
            text: `As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "13px" }
        },
        yAxis: {
            title: {
                text: "<b>Displacement (cm)</b>"
            }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e. %b %Y",
                year: "%b"
            },
            title: {
                text: "<b>Date</b>"
            }
        },
        tooltip: {
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: true
                },
                dashStyle: "ShortDash"
            },
            series: {
                marker: {
                    radius: 3
                },
                cursor: "pointer",
                point: {
                    events: {

                    }
                }
            }
        },
        credits: {
            enabled: false
        }
    });
}

function enableRainfallSelection(){
	// destroyCharts("#rainfall-plots .rainfall-chart");
 //    $("#rainfall-plots .plot-container").remove();
	RAINFALL_DATA.forEach((source) => {
        const { null_ranges, gauge_name } = source;

        const container_cumulative = $(`#${gauge_name}-cumulative`);
        const container_instantaneous = $(`#${gauge_name}-instantaneous`);
        container_cumulative.empty();
        container_instantaneous.empty();
        const series_data = [];
        const max_rval_data = [];
        Object.keys(rainfall_colors).forEach((name) => {
            const color = rainfall_colors[name];
            const entry = {
                name,
                step: true,
                data: source[name],
                color,
                id: name,
                fillOpacity: 1,
                lineWidth: 1
            };
            if (name !== "rain") series_data.push(entry);
            else max_rval_data.push(entry);
        });

        const null_processed = null_ranges.map(({ from, to }) => ({ from, to, color: "rgba(68, 170, 213, 0.3)" }));
        enableInstantaneousRainfallSelection(max_rval_data, RAINFALL_INPUT, source, null_processed);
        enableCumulativeRainfallSelection(series_data, RAINFALL_INPUT, source);
    });
}

function enableCumulativeRainfallSelection(data, temp, source){
	const { site_code, start_date, end_date } = temp;
    const {
        distance, max_72h, threshold_value: max_rain_2year, gauge_name
    } = source;

    const container = `#${gauge_name}-cumulative`;
    console.log(container);
    // $(container).highcharts().destroy();
    Highcharts.setOptions({ global: { timezoneOffset: -8 * 60 } });
    $(container).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            height: 400,
            events: {
                selection: selectPointsByDrag,
                selectedpoints: selectedPoints,
                click: unselectByClick
            },
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            }
        },
        title: {
            text: `<b>Cumulative Rainfall Chart of ${site_code.toUpperCase()}</b>`,
            style: { fontSize: "13px" },
            margin: 20,
            y: 16
        },
        subtitle: {
            text: `Source: <b>${createRainPlotSubtitle(distance, gauge_name)}</b><br/>As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "11px" }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e %b %Y",
                year: "%Y"
            },
            title: {
                text: "<b>Date</b>"
            },
            events: {
                setExtremes: syncExtremes
            }
        },
        yAxis: {
            title: {
                text: "<b>Value (mm)</b>"
            },
            max: Math.max(0, (max_72h - parseFloat(max_rain_2year))) + parseFloat(max_rain_2year),
            min: 0,
            plotBands: [{
                value: Math.round(parseFloat(max_rain_2year / 2) * 10) / 10,
                color: rainfall_colors["24h"],
                dashStyle: "shortdash",
                width: 2,
                zIndex: 0,
                label: {
                    text: `24-hr threshold (${max_rain_2year / 2})`

                }
            }, {
                value: max_rain_2year,
                color: rainfall_colors["72h"],
                dashStyle: "shortdash",
                width: 2,
                zIndex: 0,
                label: {
                    text: `72-hr threshold (${max_rain_2year})`
                }
            }]
        },
        tooltip: {
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            series: {
                marker: {
                    radius: 3
                },
                cursor: "pointer"
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}

function enableInstantaneousRainfallSelection(data, temp, source, null_processed){
	const { site_code, start_date, end_date } = temp;
    const {
        distance, max_rval, gauge_name
    } = source;

    const container = `#${gauge_name}-instantaneous`;
    // $(container).highcharts().destroy();
    $(container).highcharts({
        series: data,
        chart: {
            type: "column",
            zoomType: "x",
            height: 400,
           	events: {
                selection: selectPointsByDrag,
                selectedpoints: selectedPoints,
                click: unselectByClick
            },
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            }
        },
        title: {
            text: `<b>Instantaneous Rainfall Chart of ${site_code.toUpperCase()}</b>`,
            style: { fontSize: "13px" },
            margin: 20,
            y: 16
        },
        subtitle: {
            text: `Source : <b>${createRainPlotSubtitle(distance, gauge_name)}</b><br/>As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "11px" }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            plotBands: null_processed,
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e %b %Y",
                year: "%Y"
            },
            title: {
                text: "<b>Date</b>"
            },
            events: {
                setExtremes: syncExtremes
            }
        },
        yAxis: {
            max: max_rval,
            min: 0,
            title: {
                text: "<b>Value (mm)</b>"
            }
        },
        tooltip: {
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            series: {
                marker: {
                    radius: 3
                },
                cursor: "pointer"
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}