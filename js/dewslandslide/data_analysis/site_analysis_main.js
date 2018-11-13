
let validator = null;
let CHART_PLOTS = new Set();

$(document).ready(() => {
    const paths = window.location.pathname.split("/");
    reposition("#error-modal");

    if (paths[2] === "site_analysis") {
        adjustOptionsBarOnWindowResize();
        createStickyOptionsBar();
        initializeTimestamps();

        validator = initializeForm();
        validateForm(validator);

        initializeSiteCodeDropdownOnChange();
        initializeSubsurfaceColumnDropdownOnChange();
        initializeOptionsBarToggleOnClick();

        loadDefaultSite(paths[3]);
    }
    formatHighchartsGlobalOptions();
});

function initializeTimestamps () {
    $(".datetime").datetimepicker({
        format: "YYYY-MM-DD HH:mm:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    })
    .on("dp.show", function (e) {
        $(this).data("DateTimePicker").maxDate(moment().second(0));
        setTimeout(() => {
            $(".bootstrap-datetimepicker-widget").css({ left: -17 });
        }, 50);
    });
}

function loadDefaultSite (site_code) {
    $("#data_timestamp").val(moment().format("YYYY-MM-DD HH:mm:ss"));
    // $("#data_timestamp").val("2017-11-11 00:00:00");
    const sc = typeof site_code === "undefined" || site_code === "" ? "agb" : site_code;
    $("#site_code").val(sc).trigger("change");
    $("#plot-site-level").trigger("click");
}

function createStickyOptionsBar () {
    $("#options-bar").stick_in_parent({
        offset_top: 80,
        bottoming: false
    });
}

let submit_btn_id = null;
function initializeForm () {
    const val = $("#site-analysis-form").validate({
        debug: true,
        rules: {
            data_timestamp: "required",
            site_code: "required"
        },
        messages: { comments: "" },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");
            if ($(element).hasClass("cbox_trigger_switch")) {
                $("#errorLabel").append(error).show();
            } else if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
            const data = $("#site-analysis-form").serializeArray();
            let input = {};
            data.forEach(({ name, value }) => { input[name] = value === "" ? null : value; });

            input = {
                ...input,
                end_date: moment(input.data_timestamp).format("YYYY-MM-DDTHH:mm")
            };

            const { site_code } = input;

            let $container;

            if (submit_btn_id === "plot-site-level") {
                let address = $("#site_code option:selected").text();
                address = address.match(/\(([^)]+)\)/, address);
                $("#site-name").text(address[1]);

                $container = $("#site-plots-container");

                plotRainfallCharts(site_code);
                plotSurficialCharts();
            } else if (submit_btn_id === "plot-column-level") {
                const column_name = $("#subsurface_column option:selected").text();
                $("#column-name").text(column_name.toUpperCase());

                $container = $("#subsurface-column-plots-container");

                input.start_date = getStartDate("column-summary");
                plotColumnSummaryCharts(input);

                input.start_date = getStartDate("subsurface");
                plotSubsurfaceAnalysisCharts(input);
            } else if (submit_btn_id === "plot-node-level") {
                let node_names = input.nodes;
                node_names = /,/.test(node_names) === true ? `Nodes ${node_names}` : `Node ${node_names}`;
                $("#node-name").text(node_names);

                $container = $("#subsurface-node-plots-container");

                input = {
                    ...input,
                    start_date: getStartDate("node-summary"),
                    node: input.subsurface_node
                };
                plotNodeLevelCharts(input);
            }

            $container.slideDown();
            $container.data("site-loaded", site_code);

            $("html, body").animate({
                scrollTop: $container.offset().top - 70
            });

            hideSections(site_code);
        }
    });

    return val;
}

function validateForm (form) {
    $(".submit-btn").on("click", ({ currentTarget }) => {
        submit_btn_id = $(currentTarget).prop("id");

        $(".has-error").removeClass("has-error");
        $(".glyphicon-remove, .glyphicon-ok").remove();
        form.resetForm();

        $("#site_code").rules("remove");
        $("#subsurface_column").rules("remove");
        $("#subsurface_node").rules("remove");

        CHART_PLOTS = new Set();
        switch (submit_btn_id) {
            case "plot-node-level":
                ["node"].forEach((plotted) => {
                    CHART_PLOTS.add(plotted);
                });
                $("#subsurface_node").rules("add", { required: true });
                // fallthrough
            case "plot-column-level":
                ["node-health", "data-presence", "communication-health", "subsurface"].forEach((plotted) => {
                    CHART_PLOTS.add(plotted);
                });
                $("#subsurface_column").rules("add", { required: true });
                // fallthrough
            case "plot-site-level":
                ["rainfall", "surficial"].forEach((plotted) => {
                    CHART_PLOTS.add(plotted);
                });
                break;
            default:
                $("#site_code").rules("add", { required: true });
                break;
        }

        $("#site-analysis-form").valid();
    });
}

function hideSections (site_code) {
    $(".section").each((index, element) => {
        const site_loaded = $(element).data("site-loaded");
        if (site_loaded !== site_code) {
            $(element).slideUp();
        }
    });
}

function initializeSiteCodeDropdownOnChange () {
    $("#site_code").change(({ currentTarget: { value: site_code } }) => {
        const code = site_code === "" ? "x" : site_code;
        processSubsurfaceColumnDropDown(code);
        updateBreadcrumb("site");
    });
}

function initializeSubsurfaceColumnDropdownOnChange () {
    $("#subsurface_column").change(({ currentTarget: { value: subsurface_column } }) => {
        const column = subsurface_column === "" ? "x" : subsurface_column;
        processNodeDropDown(column);
        updateBreadcrumb("column");
    });
}

function updateBreadcrumb (section) {
    const $breadcrumb = $("#main-plots-container .breadcrumb");
    const $main = $breadcrumb.find(".main");
    $main.nextAll().remove();

    switch (section) {
        case "node":
            let node_names = $("#subsurface_node").val();
            node_names = /,/.test(node_names) === true ? `Nodes ${node_names}` : `Node ${node_names}`;
            $main.after($("<li>", {
                text: node_names
            }));
            // fall through
        case "column":
            $main.after($("<li>", {
                text: $("#subsurface_column").val().toUpperCase()
            }));
            // fall through
        case "site":
            $main.after($("<li>", {
                text: $("#site_code").val().toUpperCase()
            }));
            // fall through
        default:
            break;
    }
}

function initializeOptionsBarToggleOnClick () {
    $("#toggle-options-bar").click(() => {
        const $bar = $("#options-bar");
        const $plots = $("#main-plots-container");
        const is_collapsed = $bar.data("collapsed");

        if (is_collapsed === "false") {
            $(".hideable").css("visibility", "hidden");
            $(".hideable-hide").hide();
            $bar.find(".fa-angle-double-left")
            .switchClass("fa-angle-double-left", "fa-angle-double-right");
            $bar.switchClass("col-sm-3", "col-sm-1", {
                complete () {
                    $bar.data("collapsed", "true");
                    $(window).resize();
                }
            });
            $plots.switchClass("col-sm-9", "col-sm-11", {
                complete () {
                    resizeCharts();
                }
            });
        } else {
            $bar.find(".fa-angle-double-right")
            .switchClass("fa-angle-double-right", "fa-angle-double-left");
            $plots.switchClass("col-sm-11", "col-sm-9", {
                complete () {
                    resizeCharts();
                }
            });
            $bar.switchClass("col-sm-1", "col-sm-3", {
                complete () {
                    $bar.data("collapsed", "false");
                    $(".hideable").css("visibility", "visible");
                    $(".hideable-hide").show();
                    $(window).resize();
                }
            });
        }
    });
}

function adjustOptionsBarOnWindowResize () {
    $(window).on("resize", () => {
        const window_h = $(window).height();
        const page_header = $(".page-header").height();
        const nav_top = $(".navbar-fixed-top").height();
        const nav_bottom = $(".navbar-fixed-bottom").height();

        const final = window_h - page_header - nav_top - nav_bottom - 100;
        const is_collapsed = $("#options-bar").data("collapsed") || "false";

        let overflow = "hidden";
        if (is_collapsed === "false") {
            overflow = final > 785 ? "auto" : "auto";
        }

        $("#options-bar > .panel").css({
            "max-height": final,
            "overflow-y": overflow,
            "overflow-x": overflow
        });
    })
    .resize();
}

function resizeCharts () {
    window.dispatchEvent(new Event("resize"));
}

function destroyCharts (container) {
    $(container).each((index, elem) => {
        const chart = $(`#${elem.id}`).highcharts();
        if (typeof chart !== "undefined") {
            chart.destroy();
        }
    });
}

function getStartDate (plot_type) {
    let start_date = "";
    const end_date = moment($("#data_timestamp").val());
    const data = $(`#${plot_type}-duration li.active > a`).data();
    const { value, duration } = data;

    if (value !== "All") {
        start_date = moment(end_date).subtract(value, duration)
        .format("YYYY-MM-DDTHH:mm:ss");
    } else {
        start_date = "2010-01-01T00:00:00";
    }

    return start_date;
}

function createPlotContainer (data_type, source_table, sub_type = null) {
    $(`#${data_type}-plots`)
    .append($("<div>", {
        class: `${data_type}-plot-container plot-container row`,
        id: source_table
    }));

    if (data_type === "rainfall") {
        ["instantaneous", "cumulative"].forEach((x) => {
            $(`#${source_table}`)
            .append($("<div>", {
                class: "col-sm-6 rainfall-chart",
                id: `${source_table}-${x}`
            }));
        });
    } else if (data_type === "surficial") {
        if (sub_type === "marker") {
            createMarkerTabs(source_table);
        }
    } else { // data_type is under node plots
        $(`#${source_table}`)
        .append($("<div>", {
            class: `col-sm-12 node-chart ${data_type}-graph`,
            id: `${source_table}-graph`
        }));
    }
}

function createMarkerTabs (source_table) {
    $(`#${source_table}`)
    .append($(`<div id="${source_table}-tab-group" class="marker-chart-tab-group col-sm-12"><ul class="nav nav-tabs nav-justified"></ul></div>`))
    .append($("<div>", {
        id: `${source_table}-tab-content`,
        class: "tab-content col-sm-12"
    }));

    const marker_tables = [
        { id: "vel_v_accel", label: "Velocity Acceleration Chart" },
        { id: "interpolation", label: "Displacement interpolation Chart" },
        { id: "vel_v_accel_v_time", label: "Velocity/Acceleration vs Time Chart" }
    ];

    marker_tables.forEach(({ id, label }) => {
        $(`#${source_table}-tab-group > ul`)
        .append($(`<li><a data-toggle='tab' href='#${source_table}-${id}'><strong>${label}</strong></a></li>`));

        $(`#${source_table}-tab-content`)
        .append($("<div>", {
            id: `${source_table}-${id}`,
            class: "tab-pane fade"
        }));
    });

    $(`#${source_table}-tab-group li:first > a`).trigger("click");
}

function formatHighchartsGlobalOptions () {
    const options = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
    Highcharts.setOptions({
        global: { timezoneOffset: -8 * 60 },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: true,
                    menuItems: options.splice(2)
                }
            }
        },
        chart: { reflow: true }
    });
}

function showErrorModal (ajax, module) {
    const { responseText, status, statusText } = ajax;
    const $modal = $("#error-modal");
    const $body_ul = $modal.find(".modal-body ul");
    const text = `<li>Error loading ${module}</li>`;

    if (!$modal.is(":visible")) {
        $body_ul.empty()
        .html(text);
        $modal.modal("show");
    } else {
        $body_ul.append(text);
    }

    console.log(`%c► Error ${module}\n► Status ${status}: ${statusText}\n\n${responseText}`, "background: rgba(255,127,80,0.3); color: black");
}
