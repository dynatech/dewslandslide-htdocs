
const rainfall_colors = {
    "24h": "#4969FCE6",
    "72h": "#EF4532E6",
    rain: "#000000E6"
};

$(document).ready(() => {
    initializeRainSourcesButton();
    initializeRainfallDurationDropdownOnClick();
});

function initializeRainSourcesButton () {
    $(document).on("click", "#rainfall-sources-btn-group button", ({ target }) => {
        const isLoaded = $(target).data("loaded");
        const table = $(target).val();
        if (isLoaded) {
            $(`#${table}`).slideToggle({
                complete () {
                    $(target).toggleClass("active");
                }
            });
        } else {
            const input = {
                site_code: $("#site_code").val(),
                end_date: $("#data_timestamp").val(),
                start_date: getStartDate("rainfall"),
                source: "all" // table
            };

            $loading_rain = $("#rainfall-plots .loading-bar");
            $loading_rain.show();
            getPlotDataForRainfall(input)
            .done((datalist) => {
                console.log(datalist);
                $(`#${table}`).show();
                plotRainfall(datalist, input);
                $(target).data("loaded", true);
                $(target).addClass("active");
                $loading_rain.hide();
            })
            .catch(({ responseText, status: conn_status, statusText }) => {
                alert(`Status ${conn_status}: ${statusText}`);
                alert(responseText);
            });
        }
    });
}

function initializeRainfallDurationDropdownOnClick () {
    $("#rainfall-duration li").click(({ target }) => {
        const { value, duration } = $(target).data();

        $("#rainfall-duration li.active").removeClass("active");
        $(target).parent().addClass("active");

        $("#rainfall-duration-btn").empty()
        .append(`${value} ${duration}&emsp;<span class="caret"></span>`);

        $btn_group = $("#rainfall-sources-btn-group");

        // All rainfall plots implementation
        $btn_group.find("button:first").data("loaded", false).trigger("click");
        $btn_group.find("button").each((index, button) => {
            const table = $(button).val();
            $(`#${table}`).show();
            $(button).removeClass("active").addClass("active");
            $(button).data("loaded", true);
        });

        /**
         * On-demand implementation for each rainfall graph
        **/
        // const loaded_plots = [];
        // $btn_group.find("button").each((i, elem) => {
        //     const table = elem.value;
        //     if ($(elem).data("loaded") === true && $(elem).hasClass("active")) {
        //         loaded_plots.push(table);
        //     }
        //     $(elem).data("loaded", false);
        //     $(elem).removeClass("active");
        // });

        // if (loaded_plots.length === 0) $btn_group.first().trigger("click");
        // else {
        //     loaded_plots.forEach((table) => {
        //          $btn_group.find(`[value=${table}]`).trigger("click");
        //     });
        // }
    });
}

function plotRainfallCharts (site_code) {
    $("#rainfall-plots .plot-container").remove();
    getRainDataSourcesPerSite(site_code)
    .done((sources) => {
        createRainSourcesButton(sources);
        $("#rainfall-plot-options").show();
        $rain_btn_group = $("#rainfall-sources-btn-group");

        // All rainfall plots implementation
        $rain_btn_group.find("button:first").trigger("click");
        $rain_btn_group.find("button").each((index, button) => {
            $(button).removeClass("active").addClass("active");
            $(button).data("loaded", true);
        });

        /**
         * On-demand implementation for each rainfall graph
        **/
        // $rain_btn_group.find("button:first").trigger("click");
        // $rain_btn_group.find("button").each((index, button) => {
        //     $(button).trigger("click");
        // });
    });
}

function getRainDataSourcesPerSite (site_code) {
    return $.getJSON(`../rainfall/getRainDataSourcesPerSite/${site_code}`)
    .catch(err => err);
}

function createRainSourcesButton (sources) {
    $btn_group = $("#rainfall-sources-btn-group");
    $btn_group.empty();
    sources.forEach(({ source_table }) => {
        const txt = source_table.toUpperCase();
        const table = isFinite(source_table) ? `NOAH ${txt}` : txt;

        $btn_group.append($("<button>", {
            type: "button",
            class: "btn btn-primary btn-sm",
            value: source_table,
            text: `${table}`,
            "data-loaded": false
        }));
    });
}

function getPlotDataForRainfall ({
    site_code, start_date, end_date, source
}) {
    const s = (typeof source === "undefined") ? "all" : source;
    return $.getJSON(`../site_analysis/getPlotDataForRainfall/${site_code}/${s}/${start_date}/${end_date}`)
    .catch(err => err);
}

function plotRainfall (datalist, temp) {
    datalist.forEach((source) => {
        const { null_ranges, source_table } = source;

        createPlotContainer("rainfall", source_table);

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

        const null_processed = null_ranges.map(({ from, to }) => ({ from, to, color: "#44AAD533" }));
        createInstantaneousRainfallChart(max_rval_data, temp, source, null_processed);
        createCumulativeRainfallChart(series_data, temp, source);
    });
}

function createRainPlotSubtitle (distance, source_table) {
    let source = source_table.toUpperCase();
    if (isFinite(source_table)) {
        source = `NOAH ${source_table}`;
    }
    const subtitle = distance === null ? source : `${source} (${distance} KM)`;
    return subtitle;
}

function createCumulativeRainfallChart (data, temp, source) {
    const { site_code, start_date, end_date } = temp;
    const {
        distance, max_72h, max_rain_2year, source_table
    } = source;

    Highcharts.setOptions({ global: { timezoneOffset: -8 * 60 } });
    $(`#${source_table}-cumulative`).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            height: 400
        },
        title: {
            text: `<b>Rainfall Data of ${site_code.toUpperCase()} (${moment(end_date).format("MM/DD/YYYY HH:mm")})</b>`,
            style: { fontSize: "12px" }
        },
        subtitle: {
            text: `Source : <b>${createRainPlotSubtitle(distance, source_table)}</b>`,
            style: { fontSize: "10px" }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e %b %Y",
                year: "%b"
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

function createInstantaneousRainfallChart (data, temp, source, null_processed) {
    const { site_code, start_date, end_date } = temp;
    const {
        distance, max_rval, source_table
    } = source;

    $(`#${source_table}-instantaneous`).highcharts({
        series: data,
        chart: {
            type: "column",
            zoomType: "x",
            panning: true,
            height: 400
        },
        title: {
            text: `<b>Rainfall Data of ${site_code.toUpperCase()} (${moment(end_date).format("MM/DD/YYYY HH:mm")})</b>`,
            style: { fontSize: "12px" }
        },
        subtitle: {
            text: `Source : <b>${createRainPlotSubtitle(distance, source_table)}</b>`,
            style: { fontSize: "10px" }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            plotBands: null_processed,
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e %b %Y",
                year: "%b"
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

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes (e) {
    const thisChart = this.chart;

    if (e.trigger !== "syncExtremes") { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, (chart) => {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: "syncExtremes" });
                }
            }
        });
    }
}
