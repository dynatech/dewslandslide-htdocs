
$(document).ready(() => {
    const input = {
        subsurface_column: "agbta",
        start_date: "2016-01-15",
        end_date: "2016-01-21",
        node: 1
    };

    // plotNodeLevelCharts(input);

    initializeNodeSummaryDurationDropdownOnClick();
});

function processNodeDropDown (subsurface_column) {
    $("#subsurface_node").val("")
    .find("option.appended-option").remove();

    getSiteColumnNodeCount(subsurface_column)
    .done(delegateNodeNumbersOnDropdown)
    .catch((x) => {
        showErrorModal(x, "node count dropdown");
    });
}

function getSiteColumnNodeCount (subsurface_column) {
    return $.getJSON(`../../site_analysis/getSiteColumnNodeCount/${subsurface_column}`);
}

function delegateNodeNumbersOnDropdown (node_count) {
    for (let counter = 1; counter <= node_count; counter += 1) {
        $("#subsurface_node").append($("<option>", {
            value: counter,
            text: `Node ${counter}`,
            class: "appended-option"
        }));
    }
}

function initializeNodeSummaryDurationDropdownOnClick () {
    $("#node-summary-duration li").click(({ target }) => {
        const { value, duration } = $(target).data();
        const parent_id = $(target).parents(".btn-group").prop("id");
        $(`#${parent_id} li.active`).removeClass("active");
        $(target).parent().addClass("active");

        $(`#${parent_id}-btn`).empty()
        .append(`${value} ${duration}&emsp;<span class="caret"></span>`);

        const form = {
            subsurface_column: $("#subsurface_column").val(),
            start_date: getStartDate(parent_id.replace("-duration", "")),
            end_date: moment($("#data_timestamp").val()).format("YYYY-MM-DDTHH:mm"),
            node: $("#subsurface_node").val()
        };

        plotNodeLevelCharts(form);
    });
}

function plotNodeLevelCharts (input) {
    destroyCharts("#subsurface-node-plots .node-chart");
    $("#subsurface-node-plots .loading-bar").show();
    getPlotDataForNode(input)
    .done((subsurface_node_data) => {
        console.log(subsurface_node_data);
        subsurface_node_data.forEach((series) => {
            console.log(series);
            const { series_name, data: nodes } = series;
            nodes.forEach((node_arr) => {
                const { node_name, series: node_series } = node_arr;
                const source_name = node_name.replace("node_", "");
                const container_id = `${series_name}-${node_name}`;
                const final_series = hideByDefaultRawSeries(node_series);
                createPlotContainer(series_name, container_id);
                createGeneralNodeChart(container_id, final_series, input, source_name);
            });
            synchronizeNodeChartsPerPlotType(series_name);
            createSVG("node");
        });
        $("#subsurface-node-plots .loading-bar").hide();
    })
    .catch((x) => {
        showErrorModal(x, "node charts");
    });
}

function hideByDefaultRawSeries (series) {
    series.forEach((node_arr) => {
        if (node_arr.name.includes("Raw")) node_arr.visible = false;
    });
    return series;
}

function getPlotDataForNode ({
    subsurface_column, start_date, end_date, node
}) {
    return $.getJSON(`../../site_analysis/getPlotDataForNode/${subsurface_column}/${start_date}/${end_date}/${node}`);
}

function createGeneralNodeChart (series_name, data, input, source_name) {
    const { subsurface_column, start_date, end_date } = input;
    const cap = series_name === "battery" ? 1 : 3;
    const title = series_name.slice(0, cap).toUpperCase() + series_name.slice(cap);

    $(`#${series_name}-graph`).highcharts({
        series: data,
        chart: {
            type: "line",
            zoomType: "x",
            panning: true,
            panKey: "shift",
            height: 150
        },
        title: {
            text: "",
            style: { fontSize: "0" }
            // text: `<b>${title} Plot of ${subsurface_column.toUpperCase()}</b>`,
            // style: { fontSize: "10px" },
            // margin: 20,
            // y: 16
        },
        subtitle: {
            text: `Source: <b>Node ${source_name}</b><br/>Range: <b>${moment(start_date).format("D MMM YYYY, HH:mm")} - ${moment(end_date).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "9px" }
        },
        xAxis: {
            min: Date.parse(start_date),
            max: Date.parse(end_date),
            type: "datetime",
            dateTimeLabelFormats: {
                month: "%e. %b %Y",
                year: "%Y"
            },
            title: {
                text: "<b>Date</b>"
            }
        },
        yAxis: {
            title: {
                text: "<b>Value</b>"
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true
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
            itemStyle: {
                fontSize: "10px"
            },
            layout: "vertical",
            align: "right",
            verticalAlign: "middle",
            borderWidth: 0
        },
        credits: {
            enabled: false
        }
    });
}

function synchronizeNodeChartsPerPlotType (series_name) {
    $(`#${series_name}-plots`).bind("mousemove touchmove touchstart", (e) => {
        let points;
        let secSeriesIndex = 1;

        $(`.node-chart.${series_name}-graph`).each((i, elem) => {
            const chart = $(`#${elem.id}`).highcharts();
            e = chart.pointer.normalize(e); // Find coordinates within the chart
            points = [
                chart.series[0].searchPoint(e, true),
                chart.series[1].searchPoint(e, true)
            ]; // Get the hovered point

            if (points[0] && points[1]) {
                if (!points[0].series.visible) {
                    points.shift();
                    secSeriesIndex = 0;
                }
                if (!points[secSeriesIndex].series.visible) {
                    points.splice(secSeriesIndex, 1);
                }
                if (points.length) {
                    chart.tooltip.refresh(points); // Show the tooltip
                    chart.xAxis[0].drawCrosshair(e, points[0]); // Show the crosshair
                }
            }
        });

        // for (let i = 0; i < Highcharts.charts.length; i += 1) {
        //     chart = Highcharts.charts[i];
        //     e = chart.pointer.normalize(e); // Find coordinates within the chart
        //     points = [chart.series[0].searchPoint(e, true), chart.series[1].searchPoint(e, true)]; // Get the hovered point

        //     if (points[0] && points[1]) {
        //         if (!points[0].series.visible) {
        //             points.shift();
        //             secSeriesIndex = 0;
        //         }
        //         if (!points[secSeriesIndex].series.visible) {
        //             points.splice(secSeriesIndex,1);
        //         }
        //         if (points.length) {
        //             chart.tooltip.refresh(points); // Show the tooltip
        //             chart.xAxis[0].drawCrosshair(e, points[0]); // Show the crosshair
        //         }
        //     }
        // }
    });
}
