
$(document).ready(() => {
    initializeDownloadChartsButton();
    initializeFinalDownloadButton();
});

function initializeDownloadChartsButton () {
    $("body").on("click", "#download-charts", ({ currentTarget }) => {
        $("#chart-options").modal({ backdrop: "static", keyboard: false });
        $(".download-chart-checkbox").prop("checked", false);
        $("#select-chart-message").hide();
        toggleChartDownloadCheckboxes();
    });
}

function toggleChartDownloadCheckboxes () {
    const $cbox_group = $(".download-chart-checkbox");
    $cbox_group.prop("disabled", true);
    CHART_PLOTS.forEach((plotted) => {
        $cbox_group.filter(`[value=${plotted}]`).prop("disabled", false);
    });
}

function createSVG (plot_type) {
    switch (plot_type) {
        case "rainfall":
            createRainfallSVG();
            break;
        case "surficial":
            createSurficialSVG();
            break;
        case "node-health": // fall through
        case "data-presence":
        case "communication-health":
            createColumnSummaryAndNodeSVG(plot_type);
            break;
        case "node":
            createNodeSVG();
            break;
        case "subsurface-column":
            createSubsurfaceSVG();
            break;
        default: break;
    }
}

function createRainfallSVG () {
    const $container = $("#rainfall-svg");
    $container.empty();
    const tag = "rainfall-chart";
    const charts = Highcharts.charts.filter((x) => {
        if (typeof x !== "undefined") return $(x.renderTo).hasClass(tag);
        return false;
    });
    charts.forEach((chart) => {
        const rain_svg = chart.getSVG();
        $container.append(rain_svg);
    });
    delegateChartSVGPosition("rainfall");
}

function createSurficialSVG () {
    const $container = $("#surficial-chart");
    $container.empty();
    const tag = "surficial-plot-container";
    const [chart] = Highcharts.charts.filter((x) => {
        if (typeof x !== "undefined") return $(x.renderTo).hasClass(tag);
        return false;
    });
    const get_svg = chart.getSVG();
    $container.append(get_svg);
}

function createColumnSummaryAndNodeSVG (type) {
    let chart_id = type;
    const $container = $(`#${type}-chart`);
    $container.empty();

    switch (type) {
        case "node-health":
            chart_id = `${chart_id}-summary`;
            break;
        case "x-accelerometer":
        case "y-accelerometer":
        case "z-accelerometer":
        case "battery":
            chart_id = `${chart_id}-graph`;
            // fall through
        default: break;
    }

    const [chart] = Highcharts.charts.filter((x) => {
        if (typeof x !== "undefined") return $(x.renderTo).prop("id") === chart_id;
        return false;
    });

    const chart_svg = chart.getSVG();
    $container.append(chart_svg);
}

function createNodeSVG () {
    const $container = $("#node-svg");
    $container.empty();
    const tag = "node-chart";
    const charts = Highcharts.charts.filter((x) => {
        if (typeof x !== "undefined") return $(x.renderTo).hasClass(tag);
        return false;
    });
    charts.forEach((chart) => {
        const node_svg = chart.getSVG();
        $container.append(node_svg);
    });
    delegateChartSVGPosition("node");
}

function createSubsurfaceSVG () {
    const $container = $("#subsurface-svg");
    $container.empty();
    const subsurface_charts = [
        "column-position-downslope",
        "column-position-across_slope",
        "subsurface-displacement-downslope",
        "subsurface-displacement-across_slope",
        "velocity-alerts-downslope",
        "velocity-alerts-across_slope"
    ];

    subsurface_charts.forEach((subsurface_chart) => {
        const [chart] = Highcharts.charts.filter((x) => {
            if (typeof x !== "undefined") return $(x.renderTo).prop("id") === subsurface_chart;
            return false;
        });
        const subsurface_svg = chart.getSVG();
        $container.append(subsurface_svg);
    });
    delegateChartSVGPosition("subsurface");
}

function delegateChartSVGPosition (type) {
    let y_axis_even = 0;
    let y_axis_odd = 0;
    let chart_count = 0;

    if (type === "rainfall") chart_count = 8;
    else if (type === "subsurface") chart_count = 6;
    else if (type === "node") delegateNodeChartSVGPosition();

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

function delegateNodeChartSVGPosition () {
    let y_value = 0;
    for (let counter = 1; counter <= 12; counter += 1) {
        const tag = `#node-svg svg:nth-child(${counter})`;
        $(tag).attr({
            x: 0,
            y: y_value
        });
        y_value += 160;
    }
}

function returnYaxisValue (type) {
    if (type === "rainfall") return 400;
    return 800;
}

function initializeFinalDownloadButton () {
    $("body").on("click", "#download-charts-selected", ({ currentTarget }) => {
        const charts_svg = [];
        $(".download-chart-checkbox:checked").each((i, cbox) => {
            const chart_name = $(cbox).attr("value");
            charts_svg.push($(`#${chart_name}-chart`).html());
        });

        if (charts_svg.length < 1 || charts_svg === undefined) {
            $("#select-chart-message").show(300);
        } else {
            $("#chart-options").modal("hide");
            $("#loading .progress-bar").text("Rendering and downloading charts...");
            $("#loading").modal("show");

            renderSelectedChartsOnSiteAnalysis(charts_svg)
            .done((data) => {
                if (data === "Finished") {
                    const data_ts = $("#data_timestamp").val();
                    const site_code = $("#site_code").val();
                    const filename = `${site_code.toUpperCase()}_${moment(data_ts).format("DDMMMYYYY_HH_mm")}`;

                    $("#loading").modal("hide");
                    $(".download-chart-checkbox").prop("checked", false);
                    window.location.href = `/../../chart_export/viewPDF/${filename}.pdf`;
                } else {
                    showErrorModal(x, "rendering and downloading charts");
                }
            })
            .catch((x) => {
                showErrorModal(x, "rendering and downloading charts");
            });
        }
    });
}

function renderSelectedChartsOnSiteAnalysis (charts_svg) {
    return $.post("/../chart_export/renderSelectedChartsOnSiteAnalysis", { charts: charts_svg });
}
