$(document).ready(() => {
    initializeChartData();

    Highcharts.setOptions({
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                }
            }
        }
    });
});

function initializeChartData () {
    const values = window.location.href.split("/");
    const user_id = values[5];
    const category = values[6]; // if rain, suficial or subsurface
    const site_detail = values[7];
    const end_date = values[9].replace("%20", " ");
    const end = moment(end_date).subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss");
    const start = eosGetStartDate(category, end_date);

    let site_code = null;
    let column_name = null;
    if (category === "subsurface") column_name = site_detail;
    else site_code = site_detail;

    let title = site_detail.toUpperCase();
    if (category === "subsurface") {
        $("#column-name").text(column_name.toUpperCase());
        site_code = column_name; // for the sake of uniformity on obj plotting
        title = column_name.toUpperCase();
    } else {
        $("#site-name").text(site_code.toUpperCase());
        const addendum = category === "surficial" ? "Surficial" : "Rainfall";
        title += ` - ${addendum}`;
    }

    const tab_title = `EOS : ${title}`;
    $("head title", window.parent.document).text(tab_title);
    const obj = {
        site_code, start, end, user_id
    };
    console.log(obj);
    switch (category) {
        case "rain":
            plotEoSRainfall(obj);
            break;
        case "surficial":
            plotEoSSurficial(obj);
            break;
        case "subsurface":
            plotEoSSubsurface(obj);
            break;
        default: break;
    }
}

function eosGetStartDate (category, end_date) {
    let start_date = "";
    let value = "";
    let duration = "";

    switch (category) {
        case "rain":
            value = 10;
            duration = "days";
            break;
        case "surficial":
            value = 10;
            duration = "days";
            break;
        case "subsurface":
            value = 3;
            duration = "days";
            break;
        default: break;
    }

    start_date = moment(end_date).subtract(value, duration).subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss");
    return start_date;
}

function plotEoSRainfall (args) {
    const {
        site_code, start, end, user_id
    } = args;

    $("#site-plots-container, #rainfall-plots").show();
    $("#surficial-plots, #site-plots-container > div > .plot-title-hr").hide();

    const input = {
        site_code,
        start_date: start,
        end_date: end,
        source: "all" // table
    };

    const $loading_rain = $("#rainfall-plots .loading-bar");
    $loading_rain.show();

    getPlotDataForRainfall(input, true)
    .done((datalist) => {
        plotRainfall(datalist, input);
        $loading_rain.hide();

        createSVG("rain", site_code, user_id);
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        alert(responseText);
    });
}

function plotEoSSurficial (args) {
    const {
        site_code, end, user_id
    } = args;

    $("#site-plots-container, #surficial-plots").show();
    $("#rainfall-plots, #site-plots-container > div > .plot-title-hr").hide();

    const $loading_surficial = $("#surficial-plots .loading-bar");
    $loading_surficial.show();
    $("#surficial-plots").show();

    const input = {
        site_code,
        start_date: "eos",
        end_date: end
    };

    getPlotDataForSurficial(input, true)
    .done((series) => {
        $(`#${input.site_code}-surficial`).show();

        const [{ data: [{ x: last_point_ts }] }] = series;
        input.start_date = moment(last_point_ts).format("YYYY-MM-DDTHH:mm:ss");

        plotSurficial(series, input);
        $loading_surficial.hide();

        createSVG("surficial", site_code, user_id);
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        alert(responseText);
    });
}

function plotEoSSubsurface (args) {
    const {
        site_code, start, end, user_id
    } = args;

    $("#subsurface-column-plots-container, #subsurface-plots").show();
    $("#subsurface-column-summary-plots, #subsurface-column-plots-container > div > .plot-title-hr").hide();
    $("#subsurface-plots .loading-bar").show();

    const input = {
        subsurface_column: site_code,
        start_date: start,
        end_date: end
    };

    getPlotDataForSubsurface(input, true)
    .done((subsurface_data) => {
        delegateSubsurfaceDataForPlotting(subsurface_data, input);
        $("#subsurface-plots .loading-bar").hide();

        createSVG("subsurface", site_code, user_id);
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        alert(responseText);
    });
}

function createSVG (plot_type, site_detail, user_id) {
    let svg = null;
    $(".highcharts-root").removeAttr("xmlns").removeAttr("version");

    switch (plot_type) {
        case "rain":
            svg = createRainfallSVG();
            break;
        case "surficial":
            svg = createSurficialSVG();
            break;
        case "subsurface":
            svg = createSubsurfaceSVG();
            break;
        default: break;
    }

    $.post("/../chart_export/saveChartSVG", {
        svg, site: site_detail, type: plot_type, connection_id: user_id
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        alert(responseText);
    });
}

function createRainfallSVG () {
    for (let counter = 0; counter < 8; counter += 1) {
        const chart = Highcharts.charts[counter];
        const svg = chart.getSVG();
        $("#rainfall-svg").append(svg);
    }
    delegateChartSVGPosition("rainfall");

    const rain_chart = $("#rain_charts").html();
    return rain_chart;
}

function createSubsurfaceSVG () {
    for (let counter = 0; counter < 6; counter += 1) {
        const chart = Highcharts.charts[counter];
        const svg = chart.getSVG();
        $("#subsurface-svg").append(svg);
    }
    delegateChartSVGPosition("subsurface");

    const subsurface_charts = $("#subsurface_charts").html();
    return subsurface_charts;
}

function delegateChartSVGPosition (type) {
    let y_axis_even = 0;
    let y_axis_odd = 0;
    let chart_count = 0;

    if (type === "rainfall") chart_count = 8;
    else if (type === "subsurface") chart_count = 6;

    for (let counter = 1; counter <= chart_count; counter += 1) {
        const tag = `#${type}-svg svg:nth-child(${counter})`;
        if (counter % 2 === 0) {
            $(tag).attr({
                x: 600,
                y: y_axis_even
            });
            y_axis_even += returnYaxisValue(type);
        } else {
            $(tag).attr({
                x: 0,
                y: y_axis_odd
            });
            y_axis_odd += returnYaxisValue(type);
        }
    }
}

function createSurficialSVG () {
    const surficial_chart = Highcharts.charts[0];
    const svg = surficial_chart.getSVG();

    return surficial_chart.getSVG();
}

function returnYaxisValue (type) {
    if (type === "rainfall") return 400;
    return 800;
}
