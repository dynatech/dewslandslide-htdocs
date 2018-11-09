
let $MARKERS_NAV;
let $MARKERS_MODAL;
let $MARKERS_DATA_MODAL;
let $VERIFICATION_MODAL;
let CURRENT_MARKER;
let MODAL_FORM;
let MODAL_FORM_ID;

$(document).ready(() => {
    $("#loading").modal("show");
    $MARKERS_NAV = $("#markers-panel").find(".nav");

    reposition("#markers-modal");
    reposition("#markers-data-modal");
    reposition("#markers-verification-modal");
    $MARKERS_MODAL = $("#markers-modal");
    $MARKERS_DATA_MODAL = $("#markers-data-modal");
    $VERIFICATION_MODAL = $("#markers-verification-modal");

    MODAL_FORM_ID = "#markers-modal form";

    initializeSurficialDurationDropDownOnClick();
    initializeSiteCodeOnChange();
    initializeMarkerTabOnClick();
    initializeMarkerInfoEditOnClick();
    MODAL_FORM = initializeMarkerModalForm(MODAL_FORM_ID);
    validateMarkerModalForm(MODAL_FORM_ID);

    initializeMarkerDataSubmitBtnOnClick();
    initializeVerificationModalBtnOnClick();

    (() => {
        $("#site_code").val("agb").trigger("change");
    })();
});

function initializeSiteCodeOnChange (argument) {
    $("#site_code").change(({ target }) => {
        const site_code = $(target).val();

        getSurficialMarkers(site_code)
        .done((markers) => {
            console.log(markers);
            updateMarkerNavTab(markers);
            updateMarkerNameInputOnModal(markers);
        });
    });
}

function getSurficialMarkers (site_code) {
    return $.getJSON(`/surficial/getSurficialMarkers/${site_code}/false/true`)
    .catch((x) => {
        console.error("error", x);
    });
}

function updateMarkerNavTab (markers) {
    $MARKERS_NAV.find("li.marker-option").remove();

    markers.forEach((marker) => {
        const { marker_name } = marker;
        const $li = $("<li class='text-center marker-option'></li>").data({ ...marker });
        $li.append(`<a>Marker ${marker_name}</a>`);
        $MARKERS_NAV.prepend($li);
    });

    $MARKERS_NAV.find("li:first-child").addClass("active").trigger("click");
}

let MARKER_MODAL_SUBMIT;
function initializeMarkerModalForm (form_id) {
    const val = $(form_id).validate({
        debug: true,
        rules: {
            marker_name: "required",
            in_use: "required"
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
            $MARKERS_MODAL.modal("hide");

            const data = $(form_id).serializeArray();
            let input = {};
            data.forEach(({ name, value }) => { input[name] = value === "" ? null : value; });

            const {
                site_id, marker_id, marker_name
            } = CURRENT_MARKER;

            let event = "add";
            if (MARKER_MODAL_SUBMIT === "update-marker") {
                if (input.marker_name !== marker_name) event = "rename";
                else event = "update";
                input.marker_id = marker_id;
            }

            input = {
                ...input,
                site_id,
                event
            };

            const modal_details = { event, marker_object: `Marker ${marker_name}` };
            prepareVerificationModal(MARKER_MODAL_SUBMIT, input, modal_details);
        }
    });

    return val;
}

function validateMarkerModalForm (form_id) {
    $(form_id).find(".submit-btn").on("click", ({ currentTarget }) => {
        MARKER_MODAL_SUBMIT = $(currentTarget).prop("id");
        $(form_id).valid();
    });
}

function updateMarkerNameInputOnModal (markers) {
    const $options = $MARKERS_MODAL.find("#marker_name > .name-option");
    $options.prop("disabled", false);

    markers.forEach((marker) => {
        const { marker_name } = marker;
        $MARKERS_MODAL.find(`#marker_name > .name-option[value="${marker_name}"]`).prop("disabled", true);
    });
}

function initializeMarkerTabOnClick () {
    $MARKERS_NAV.on("click", "li:not(.add-marker)", ({ currentTarget }) => {
        $("#loading").modal("show");

        const $cur = $(currentTarget);
        const { marker_id, marker_name, site_code } = $cur.data();
        const marker_data = $cur.data();
        CURRENT_MARKER = {
            site_code,
            ...marker_data
        };

        $MARKERS_NAV.find("li.active").removeClass("active");
        $cur.addClass("active");

        getSurficialMarkerHistory(marker_id)
        .done((history) => {
            updateHistoryList(history);
        });

        const arr = ["description", "latitude", "longitude", "in_use"];
        const $info = $("#marker-info-panel");

        arr.forEach((a) => {
            let temp = marker_data[a];
            if (temp === null || temp === "") temp = "<i>NULL</i>";
            $info.find(`.${a}`).html(temp);
        });

        const args = {
            site_code: marker_id,
            start_date: getStartDate("surficial"),
            end_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            marker_name,
            site_name: site_code
        };

        getPlotDataForSurficial(args)
        .done((data) => {
            const plot_id = `${marker_name}-surficial`;
            destroyCharts("#surficial-plots .plot-container");
            createPlotContainer("surficial", plot_id);
            createSurficialChart(data, args, true);

            $(`#${marker_name}-surficial`).highcharts().update({
                plotOptions: {
                    series: {
                        point: {
                            events: {
                                click ({ point }) {
                                    const { x, y, id } = point;
                                    $MARKERS_DATA_MODAL.find("#timestamp").text(moment(x).format("MMMM DD, YYYY HH:mm"));
                                    $MARKERS_DATA_MODAL.find("#measurement").val(y);
                                    $MARKERS_DATA_MODAL.find("#update-point").val(id);
                                    $MARKERS_DATA_MODAL.modal("show");
                                }
                            }
                        }
                    }
                }
            });

            adjustHeightOfOtherColumns();
            $("#loading").modal("hide");
        });
    });

    $MARKERS_NAV.find("li.add-marker").click(() => {
        resetMarkerModalForm();
        // Make sure current marker_name is disabled
        $MARKERS_MODAL.find(`#marker_name > .name-option[value="${CURRENT_MARKER.marker_name}"]`).prop("disabled", true);
        showMarkersModal("add-marker");
    });
}

function showMarkersModal (submit_id) {
    $MARKERS_MODAL.find(".submit-btn").each((i, elem) => {
        if (elem.id === submit_id) $(elem).show();
        else $(elem).hide();
    });
    $MARKERS_MODAL.modal("show");
}

function getSurficialMarkerHistory (marker_id) {
    return $.getJSON(`/surficial/getSurficialMarkerHistory/${marker_id}`)
    .catch((x) => {
        console.error("error", x);
    });
}

function updateHistoryList (history) {
    const $history_list = $("#history-panel").find(".list-group");
    $history_list.empty();

    history.forEach((entry) => {
        const { ts, event } = entry;

        const $ts_div = $("<div>", { class: "marker-event-ts small", text: moment(ts).format("MM/DD/YYYY HH:mm") });
        const $ev_div = $("<div>", { class: "marker-event", text: event.replace(/^\w/, c => c.toUpperCase()) });

        const $li = $("<li>", { class: "list-group-item text-center" })
        .append($ts_div).append($ev_div);

        $history_list.append($li);
    });
}

function initializeMarkerInfoEditOnClick () {
    $("#marker-edit").click((index, btn) => {
        resetMarkerModalForm();
        $MARKERS_MODAL.find(".form-control").each((i, elem) => {
            const { id } = elem;
            const val = CURRENT_MARKER[id];
            $MARKERS_MODAL.find(`#${id}`).val(val);

            if (id === "marker_name") { // enable marker_name option
                $MARKERS_MODAL.find(`option[value=${val}]`).prop("disabled", false);
            }
        });
        showMarkersModal("update-marker");
    });
}

function resetMarkerModalForm () {
    $(".has-error").removeClass("has-feedback has-error");
    $(".has-success").removeClass("has-feedback has-success");
    $(".glyphicon-remove, .glyphicon-ok").remove();
    $(MODAL_FORM_ID)[0].reset();
}

function adjustHeightOfOtherColumns () {
    const $divs = $("#column-2 > div");

    let height = 0;
    $divs.each((index, elem) => {
        if (index === 0) {
            height += $(elem).outerHeight(true) - $(elem).find(".panel-heading").outerHeight();
        } else {
            height += $(elem).height();
        }
    });

    height -= 30; // remove from final padding top and bottom from two columns
    $("#column-1, #column-3").each((i, elem) => {
        $(elem).find(".panel-body").height(height);
    });
}

function insertNewMarker (input) {
    return $.post("/surficial/insertNewMarker", input)
    .catch((x) => {
        console.error("error", x);
    });
}

function updateSurficialMarker (input) {
    return $.post("/surficial/updateSurficialMarker", input)
    .catch((x) => {
        console.error("error", x);
    });
}

function initializeMarkerDataSubmitBtnOnClick () {
    $MARKERS_DATA_MODAL.find(".submit-btn").click(({ target }) => {
        const { value: data_id, id: btn_id } = target;
        $MARKERS_DATA_MODAL.modal("hide");
        const measurement = $MARKERS_DATA_MODAL.find("#measurement").val();
        const input = {
            data_id,
            measurement
        };

        let event = "update";
        if (btn_id === "delete-point") event = "delete";

        const modal_details = { event, marker_object: "specific data point" };
        prepareVerificationModal(btn_id, input, modal_details);
    });
}

function updateMarkerDataPointMeasurement (input) {
    return $.post("/surficial/updateMarkerDataPointMeasurement", input)
    .catch((x) => {
        console.error("error", x);
    });
}

function deleteMarkerDataPointMeasurement (input) {
    return $.post("/surficial/deleteMarkerDataPointMeasurement", input)
    .catch((x) => {
        console.error("error", x);
    });
}

function initializeSurficialDurationDropDownOnClick () {
    $("#surficial-duration li").click(({ target }) => {
        const { value, duration } = $(target).data();

        $("#surficial-duration li.active").removeClass("active");
        $(target).parent().addClass("active");

        $("#surficial-duration-btn").empty()
        .append(`${value} ${duration}&emsp;<span class="caret"></span>`);

        $MARKERS_NAV.find("li.active").trigger("click");
    });
}

function prepareVerificationModal (btn_id, input, modal_details) {
    $VERIFICATION_MODAL.removeData("input");
    $VERIFICATION_MODAL.data("input", input);

    $VERIFICATION_MODAL.find(".submit-btn").hide();
    $VERIFICATION_MODAL.find(`#${btn_id}`).show();

    const { event, marker_object } = modal_details;

    $VERIFICATION_MODAL.find(".event").text(event.toUpperCase());
    $VERIFICATION_MODAL.find(".marker-object").text(marker_object);

    $VERIFICATION_MODAL.modal("show");
}

function initializeVerificationModalBtnOnClick () {
    $VERIFICATION_MODAL.find(".submit-btn").click(({ target }) => {
        $VERIFICATION_MODAL.modal("hide");

        const { id: btn_id } = target;
        const input = $VERIFICATION_MODAL.data("input");
        console.log(btn_id, input);

        if (btn_id === "update-marker") {
            updateSurficialMarker(input)
            .done((ret) => {
                $("#site_code").trigger("change");
            });
        } else if (btn_id === "add-marker") {
            insertNewMarker(input)
            .done(() => {
                $("#site_code").trigger("change");
            });
        } else if (btn_id === "delete-point") {
            deleteMarkerDataPointMeasurement(input)
            .done((ret) => {
                $MARKERS_NAV.find("li.active").trigger("click");
            });
        } else if (btn_id === "update-point") {
            updateMarkerDataPointMeasurement(input)
            .done((ret) => {
                $MARKERS_NAV.find("li.active").trigger("click");
            });
        }
    });

    $VERIFICATION_MODAL.find(".cancel-btn").click(() => {
        $VERIFICATION_MODAL.modal("hide");

        const $visible = $VERIFICATION_MODAL.find(".submit-btn:visible");
        const btn_id = $visible.prop("id");

        let $modal;
        if (btn_id === "update-point" || btn_id === "delete-point") $modal = $MARKERS_DATA_MODAL;
        else if (btn_id === "update-marker" || btn_id === "add-marker") $modal = $MARKERS_MODAL;

        $modal.modal("show");
    });
}
