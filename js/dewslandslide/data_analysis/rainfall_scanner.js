
let RESULT = [];
let SLIDER = null;
let DYNA_SITES = null;
let CHART = null;

$(document).ready(() => {
    $("#loading").modal("show");

    initializeInputOnChange();
    initializeChartViewSelectOnChange();
    initializeCriteriaSelectOnChange();
    initializeRainfallValueInputOnChange();
    adjustHeightOnResize();
    SLIDER = $("#percentage").bootstrapSlider();

    getRainfallPercentages()
    .then((return_val) => {
        RESULT = JSON.parse(return_val);
        console.log(RESULT);
        processRainfallData(RESULT);
        $(window).trigger("resize");
        $("#loading").modal("hide");
    });

    getSitesWithRegions()
    .done((result) => { DYNA_SITES = result; });
});

function adjustHeightOnResize () {
    $(window).resize(() => {
        const height = $(window).height();
        let final;
        if (height > 720) final = 550;
        else final = 400;
        CHART.setSize(null, final);
    });
}

function processRainfallData (result) {
    const filtered = {
        data_timestamp: result[0].ts,
        site_codes: [],
        cumulative_1d: [],
        cumulative_3d: []
    };

    const chart_view = $("#chart-view").val();
    const region = $("#regions").val();
    const province = $("#provinces").val();
    const percentage = SLIDER.bootstrapSlider("getValue");
    const rain_value = $("#rainfall-value").val();
    const operand = $("#operand").val();
    const criteria = $("#criteria").val();
    const criteria_quantifier = $(`#${criteria}`).val();

    result.forEach((record) => {
        const {
            site_code,
            "1D cml": cumulative_1d,
            "3D cml": cumulative_3d,
            "half of 2yr max": threshold_1d,
            "2yr max": threshold_3d
        } = record;
        let data = {};

        if (chart_view !== "sites") {
            const site_details = DYNA_SITES.find(x => x.site_code === site_code);
            const parameter = chart_view === "regions" ? region : province;
            const site_property = chart_view === "regions" ? site_details.region : site_details.province;

            const is_member = isMemberOfParameter(parameter, site_property);
            if (!is_member) {
                return;
            }
        }

        if (criteria_quantifier === "1") {
            data = {
                cummulative_data: cumulative_1d,
                threshold: threshold_1d
            };
        } else {
            data = {
                cummulative_data: cumulative_3d,
                threshold: threshold_3d
            };
        }

        let compare_var;
        const { cummulative_data } = data;
        if (criteria === "threshold") {
            const { threshold } = data;
            compare_var = threshold * (percentage / 100);
        } else {
            compare_var = rain_value;
        }

        const bool = evaluateSiteRainfall(operand, cummulative_data, compare_var);

        if (bool) {
            const site = `<a href="../../analysis/site_analysis/${site_code}" target="_blank"><b>${site_code.toUpperCase()}</b> <i class="fa fa-link"></i> </a>`;
            const cum_1d = {
                y: (cumulative_1d / threshold_1d) * 100,
                data_value: `- Cumulative Data: <b>${cumulative_1d} mm</b><br>- Threshold: <b>${threshold_1d} mm</b>`,
                site
            };
            const cum_3d = {
                y: (cumulative_3d / threshold_3d) * 100,
                data_value: `- Cumulative Data: <b>${cumulative_3d} mm</b><br>- Threshold: <b>${threshold_3d} mm</b>`,
                site
            };

            filtered.site_codes.push(site_code.toUpperCase());
            filtered.cumulative_1d.push(cum_1d);
            filtered.cumulative_3d.push(cum_3d);
        }
    });

    createRainfallPercentagesPlot(filtered);
}

function getRainfallPercentages () {
    return $.getJSON("../../rainfall_scanner/getRainfallPercentages")
    .catch(({ responseText, status, statusText }) => {
        console.log(`%c► Error Rainfall Scanner\n► Status ${status}: ${statusText}\n\n${responseText}`, "background: rgba(255,127,80,0.3); color: black");

        // Error Log for PMS
        const report = {
            type: "error_logs",
            metric_name: "rainfall_scanner_error_logs",
            module_name: "Rainfall Scanner",
            report_message: `error on getting Rainfall Percentages ${responseText}`
        };
        PMS.send(report);
    });
}

function getSitesWithRegions () {
    return $.getJSON("../../rainfall_scanner/getSitesWithRegions")
    .catch(({ responseText, status, statusText }) => {
        console.log(`%c► Error Rainfall Scanner\n► Status ${status}: ${statusText}\n\n${responseText}`, "background: rgba(255,127,80,0.3); color: black");
        // Error Log for PMS
        const report = {
            type: "error_logs",
            metric_name: "rainfall_scanner_error_logs",
            module_name: "Rainfall Scanner",
            report_message: `error on getting Sites with Region ${responseText}`
        };

        PMS.send(report);
    });
}

function isMemberOfParameter (parameter, site_property) {
    return parameter === site_property;
}

function evaluateSiteRainfall (operand, cummulative_data, compare_var) {
    let bool;
    switch (operand) {
        case "greater-than-equal":
            bool = (cummulative_data >= compare_var);
            break;
        case "greater-than":
            bool = (cummulative_data > compare_var);
            break;
        case "equal":
            bool = (cummulative_data === compare_var);
            break;
        case "less-than":
            bool = (cummulative_data < compare_var);
            break;
        case "less-than-equal":
            bool = (cummulative_data <= compare_var);
            break;
        default:
            bool = false;
            break;
    }
    return bool;
}

function createRainfallPercentagesPlot (data) {
    const {
        cumulative_1d, cumulative_3d,
        site_codes, data_timestamp
    } = data;

    if (CHART !== null) {
        CHART.xAxis[0].setCategories(site_codes);
        [cumulative_1d, cumulative_3d].forEach((arr, i) => {
            CHART.series[i].update({ data: arr });
        });
        CHART.redraw();
        return;
    }

    CHART = Highcharts.chart("rainfall-percentages-plot", {
        chart: {
            type: "column",
            height: 400,
            animation: { duration: 1000 }
        },
        title: {
            text: "<b>Cumulative Rainfall Data vs Threshold Plot of Dynaslope Sites</b>",
            y: 22
        },
        subtitle: {
            text: `As of: <b>${moment(data_timestamp).format("D MMM YYYY, HH:mm")}</b>`,
            style: { fontSize: "13px" }
        },
        xAxis: {
            categories: site_codes,
            title: {
                text: "<b>Sites</b>"
            }
        },
        yAxis: [{
            min: 0,
            title: {
                text: "<b>Threshold Ratio</b>"
            }
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            hideDelay: 3000,
            useHTML: true,
            style: {
                pointerEvents: "auto"
            },
            formatter () {
                const num = this.series.name.charAt(0);
                const percentage = this.point.y;
                const site_link = this.point.site;
                let str = `${site_link} (<b>${num}-Day)</b><br/>- Percentage: <b>${percentage.toFixed(2)}%</b><br/>`;
                str += this.point.data_value;
                return str;
            }
        },
        plotOptions: {
            column: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [{
            name: "1-Day Cumulative Data Ratio",
            color: "rgba(73, 105, 252, 0.9)",
            data: cumulative_1d,
            pointPadding: 0.17,
            pointPlacement: -0.2
        }, {
            name: "3-Day Cumulative Data Ratio",
            color: "rgba(239, 69, 50, 0.9)",
            data: cumulative_3d,
            pointPadding: 0.17,
            pointPlacement: 0.2
        }]
    });
}

function initializeInputOnChange () {
    $("#threshold, #operand, #percentage, #regions, #provinces").change(() => {
        processRainfallData(RESULT);
    });
}

function initializeRainfallValueInputOnChange () {
    $("#rainfall-value").bind("keyup mouseup", () => {
        processRainfallData(RESULT);
    });
}

function initializeChartViewSelectOnChange () {
    $("#chart-view").change(({ currentTarget }) => {
        const { value } = currentTarget;
        const $region = $("#regions-div");
        const $province = $("#provinces-div");
        const $parent = $(currentTarget).parent();

        $region.prop("hidden", true);
        $province.prop("hidden", true);

        if (value === "sites") {
            $parent.addClass("col-sm-offset-1");
        } else {
            $parent.removeClass("col-sm-offset-1");
            SLIDER.bootstrapSlider("setValue", 0);
            $("#criteria").val("threshold").trigger("change");

            if (value === "regions") $region.prop("hidden", false);
            else $province.prop("hidden", false);
        }

        processRainfallData(RESULT);
    });
}

function initializeCriteriaSelectOnChange () {
    $("#criteria").change(({ currentTarget }) => {
        const { value } = currentTarget;
        $(".value-input-div").prop("hidden", true);
        if (value === "threshold") $("#percentage-div").prop("hidden", false);
        else $("#rainfall-value-div").prop("hidden", false);

        $(".criteria-detail").each((i, elem) => {
            const temp_id = `${value}-div`;
            if (temp_id === elem.id) $(elem).show();
            else $(elem).hide();
        });

        processRainfallData(RESULT);
    });
}
