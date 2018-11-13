
$(document).ready(() => {
    initializeSurficialMarkersButton();
    initializeSurficialDurationDropDownOnClick();

    Highcharts.SVGRenderer.prototype.symbols.asterisk = (x, y, w, h) =>
        [
            "M", x - 3, y - 3,
            "L", x + w + 3, y + h + 3,
            "M", x + w + 3, y - 3,
            "L", x - 3, y + h + 3,
            "M", x - 4, y + h / 2,
            "L", x + w + 4, y + h / 2,
            "M", x + w / 2, y - 4,
            "L", x + w / 2, y + h + 4,
            "z"
        ];

    if (Highcharts.VMLRenderer) {
        Highcharts.VMLRenderer.prototype.symbols.asterisk =
            Highcharts.SVGRenderer.prototype.symbols.asterisk;
    }
});

function plotSurficialCharts () {
    destroyCharts("#surficial-plots .plot-container");
    $("#surficial-plots .plot-container").remove();
    $("#surficial-plot-options").show();
    $surficial_btn_group = $("#surficial-markers-btn-group");
    setTimeout(() => {
        $surficial_btn_group.find("button:first").data("loaded", false).trigger("click");
    }, 700);
}

function initializeSurficialMarkersButton () {
    $(document).on("click", "#surficial-markers-btn-group button", ({ target }) => {
        const isLoaded = $(target).data("loaded");
        const marker = $(target).val();
        const site_code = $("#site_code").val();

        const $active_btn = $("#surficial-markers-btn-group button.active");
        if ($active_btn.val() !== marker) {
            $active_btn.removeClass("active");
            $(".surficial-plot-container").not(":hidden").slideUp();
        }

        if (isLoaded) {
            let div = null;
            if (marker === "surficial") {
                div = `${site_code}-${marker}`;
            } else {
                div = `marker-${marker}`;
            }

            $(`#${div}`).slideToggle({
                complete () {
                    $(target).toggleClass("active");
                }
            });
        } else {
            $loading_surficial = $("#surficial-plots .loading-bar");
            $loading_surficial.show();
            $(target).addClass("active");

            const input = {
                site_code,
                end_date: moment($("#data_timestamp").val()).format("YYYY-MM-DDTHH:mm:ss"),
                start_date: getStartDate("surficial")
            };

            if (marker === "surficial") {
                $(`#${site_code}-surficial`).remove();
                getPlotDataForSurficial(input)
                .done((series) => {
                    console.log(series);
                    // createSurficialMarkersButton(series);

                    $(`#${input.site_code}-surficial`).show();
                    plotSurficial(series, input);
                    $(target).data("loaded", true);
                    $loading_surficial.hide();
                    createSVG("surficial", input.site_code);
                })
                .then(() => getSurficialMarkers(input.site_code))
                .then((series) => {
                    console.log(series);
                    createSurficialMarkersButton(series);
                })
                .catch((x) => {
                    showErrorModal(x, "surficial chart");
                });
            } else {
                input.marker_name = marker;
                delete input.start_date;

                $(`#marker-${marker}`).remove();
                getPlotDataForMarkerAcceleration(input)
                .done((trend_dataset) => {
                    console.log(trend_dataset);
                    plotMarkerTrendingAnalysis(trend_dataset, input);
                    $(target).data("loaded", true);
                    $loading_surficial.hide();
                })
                .catch((x) => {
                    showErrorModal(x, "marker acceleration chart");
                });
            }
        }
    });
}

function initializeSurficialDurationDropDownOnClick () {
    $("#surficial-duration li").click(({ target }) => {
        const { value, duration } = $(target).data();

        $("#surficial-duration li.active").removeClass("active");
        $(target).parent().addClass("active");

        $("#surficial-duration-btn").empty()
        .append(`${value} ${duration}&emsp;<span class="caret"></span>`);

        const loaded_plots = [];
        $btn_group = $("#surficial-markers-btn-group");
        $btn_group.find("button").each((i, elem) => {
            const table = elem.value;
            if ($(elem).data("loaded") === true && $(elem).hasClass("active")) {
                loaded_plots.push(table);
            }
            $(elem).data("loaded", false);
            $(elem).removeClass("active");
        });

        if (loaded_plots.length === 0) $btn_group.first().trigger("click");
        else {
            loaded_plots.forEach((table) => { $btn_group.find(`[value=${table}]`).trigger("click"); });
        }
    });
}

function getPlotDataForSurficial (args, isEOS = false) {
    const {
        site_code, start_date, end_date
    } = args;
    let url = `/../site_analysis/getPlotDataForSurficial/${site_code}/${start_date}/${end_date}`;
    url = isEOS ? `/../../../../../..${url}` : url;

    return $.getJSON(url);
}

function getSurficialMarkers (site_code, isEOS = false) {
    let url = `/../surficial/getSurficialMarkers/${site_code}`;
    url = isEOS ? `/../../../../../..${url}` : url;

    return $.getJSON(url);
}

function createSurficialMarkersButton (series) {
    const markers = [];
    markers.push(["Markers", ""]);
    console.log(markers);
    series.forEach(({ crack_id, marker_id }) => {
        markers.push([crack_id, marker_id]);
    });
    console.log(markers);
    $(".surficial-markers").remove();
    $btn_group = $("#surficial-markers-btn-group");
    markers.forEach(([crack_id, marker_id]) => {
        let classes = "btn btn-primary btn-sm surficial-markers";
        if (crack_id === "Markers") {
            classes = "btn btn-sm no-click surficial-markers";
        }
        $btn_group.append($("<button>", {
            id: `marker_${crack_id.toLowerCase()}`,
            type: "button",
            class: classes,
            value: marker_id,
            text: crack_id,
            "data-loaded": false
        }));
    });
}

function plotSurficial (series, input) {
    const { site_code } = input;
    createPlotContainer("surficial", `${site_code}-surficial`);
    createSurficialChart(series, input);
}

/**
 * Creates a surficial chart.
 *
 * @param      {<type>}   data              The data
 * @param      {<type>}   input             The input
 * @param      {boolean}  is_single_marker  Indicates if single marker
 *                                          (used on surficial_markers_page)
 */
function createSurficialChart (data, input, is_single_marker = false) {
    const { site_code, start_date, end_date } = input;

    let title_var = site_code.toUpperCase();
    let identifier = site_code;
    let subtext = "";
    if (is_single_marker === true) {
        const { marker_name, site_name } = input;
        identifier = marker_name;
        title_var = `Marker ${marker_name.toUpperCase()}`;
        subtext = `Site: <b>${site_name.toUpperCase()}<b><br/>`;
    }

    $(`#${identifier}-surficial`).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            height: 400,
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            }
        },
        title: {
            text: `<b>Surficial Data History Chart of ${title_var}</b>`,
            y: 22
        },
        subtitle: {
            text: `${subtext}As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
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

function getPlotDataForMarkerAcceleration ({ site_code, marker_name, end_date }) {
    return $.getJSON(`../site_analysis/getProcessedSurficialMarkerTrendingAnalysis/${site_code}/${marker_name}/${end_date}`);
}

function plotMarkerTrendingAnalysis (trend_dataset, input) {
    const { marker_name } = input;
    createPlotContainer("surficial", `marker-${marker_name}`, "marker");

    trend_dataset.forEach((chart_data) => {
        const { dataset_name } = chart_data;
        const series = processDatasetForPlotting(chart_data);

        if (dataset_name === "velocity_acceleration") {
            createMarkerAccelerationChart(series, input);
        } else if (dataset_name === "displacement_interpolation") {
            createMarkerInterpolationChart(series, input);
        } else if (dataset_name === "velocity_acceleration_time") {
            const index = series.findIndex(x => x.name === "Timestamps");
            const timestamps = series.splice(index, 1);
            createMarkerAccelerationVsTimeChart(series, timestamps[0].data, input);
        }
    });
}

function processDatasetForPlotting ({ dataset_name, dataset }) {
    if (dataset_name === "velocity_acceleration") {
        dataset.forEach(({ name }, index) => {
            if (name === "Trend Line") {
                dataset[index] = {
                    ...dataset[index],
                    type: "spline"
                };
            } else if (name === "Threshold Interval") {
                dataset[index] = {
                    ...dataset[index],
                    type: "arearange",
                    lineWidth: 0,
                    fillOpacity: 0.5,
                    zIndex: 0,
                    color: "#FFEB32"
                };
            } else if (name === "Last Data Point") {
                dataset[index] = {
                    ...dataset[index],
                    marker: {
                        symbol: "asterisk",
                        lineColor: "#FFEB32",
                        lineWidth: 4
                    }
                };
            }
        });
    } else if (dataset_name === "displacement_interpolation") {
        dataset.forEach(({ name }, index) => {
            if (name === "Surficial Data") {
                dataset[index].type = "scatter";
            } else if (name === "Interpolation") {
                dataset[index] = { ...dataset[index], marker: { enabled: true, radius: 0 } };
            }
        });
    } else if (dataset_name === "velocity_acceleration_time") {
        dataset.forEach(({ name }, index) => {
            if (name === "Velocity") {
                dataset[index].yAxis = 0;
            } else if (name === "Acceleration") {
                dataset[index].yAxis = 1;
            }
        });
    }
    return dataset;
}

function createMarkerAccelerationChart (data, input) {
    const { site_code, marker_name, end_date } = input;
    $(`#marker-${marker_name}-vel_v_accel`).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            },
            width: $(`#marker-${marker_name}-tab-content`).width()
        },
        title: {
            text: `<b>Velocity Acceleration Chart of ${(site_code).toUpperCase()}</b>`,
            y: 22
        },
        subtitle: {
            text: `Source: <b>Marker ${marker_name}</b><br/>As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "13px" }
        },
        xAxis: {
            title: {
                text: "<b>Velocity (cm/day)</b>"
            }
        },
        yAxis: {
            title: {
                text: "<b>Acceleration (cm/day^2)</b>"
            }
        },
        tooltip: {
            headerFormat: "",
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        }
    });
}

function createMarkerInterpolationChart (data, input) {
    const { site_code, marker_name, end_date } = input;
    $(`#marker-${marker_name}-interpolation`).highcharts({
        series: data,
        chart: {
            type: "spline",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            },
            width: $(`#marker-${marker_name}-tab-content`).width()
        },
        title: {
            text: `<b>Displacement Interpolation Chart of ${(site_code).toUpperCase()}</b>`,
            y: 22
        },
        subtitle: {
            text: `Source: <b>Marker ${marker_name}</b><br/>As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "13px" }
        },
        xAxis: {
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e. %b %Y",
                year: "%b"
            },
            title: {
                text: "<b>Date</b>"
            }
        },
        yAxis: {
            title: {
                text: "<b>Displacement (cm)</b>"
            }
        },
        tooltip: {
            crosshairs: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: true
                }
            },
            scatter: {
                tooltip: {
                    pointFormat: "Date/Time: <b>{point.x:%A, %e %b, %H:%M:%S}</b><br>Displacement: <b>{point.y:.2f}</b>"
                }
            }
        },
        credits: {
            enabled: false
        }
    });
}

function createMarkerAccelerationVsTimeChart (data, timestamps, input) {
    const { site_code, marker_name, end_date } = input;
    $(`#marker-${marker_name}-vel_v_accel_v_time`).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -30
                }
            },
            width: $(`#marker-${marker_name}-tab-content`).width()
        },
        title: {
            text: `<b>Velocity & Acceleration vs Time Chart of ${(site_code).toUpperCase()}</b>`,
            y: 22
        },
        subtitle: {
            text: `Source: <b>Marker ${marker_name}</b><br/>As of: <b>${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "13px" }
        },
        xAxis: {
            categories: timestamps,
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e. %b %Y",
                year: "%b"
            },
            labels: {
                formatter: function () {
                    return moment(this.value).format("D MMM");
                }
            },
            title: {
                text: "<b>Time (Days)</b>"
            }
        },
        yAxis: [{
            title: {
                text: "<b>Velocity (cm/day)</b>",
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, {
            title: {
                text: "<b>Acceleration (cm/days^2)</b>",
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false
                }
            }
        },
        credits: {
            enabled: false
        }
    });
}
