
/****
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Accomplishment Report Filing Form -
 *  End-of-Shift Report Tab [reports/accomplishment_report.php]
 *  [host]/reports/accomplishment/form
****/

const HOSTNAME = window.location.hostname;
const current_user_id = $("#current_user_id").attr("value");
let releases_per_event,
    shift_timestamps,
    validation_message,
    auto_save_interval;
let all_release_and_event_ids = {};
let sites_to_do = []; // Sites to be done with EOS
const upload_files = [];
const basis_to_raise = {
    D: ["a monitoring request of the LGU/LEWC", "On-Demand"],
    R: ["accumulated rainfall value exceeding threshold level", "Rainfall"],
    E: ["a detection of landslide-triggering earthquake", "Earthquake"],
    g: ["significant surficial movement", "LEWC Ground Measurement"],
    s: ["significant underground movement", "Subsurface Data"],
    G: ["critical surficial movement", "LEWC Ground Measurement"],
    S: ["critical underground movement", "Subsurface Data"],
    m: ["significant movement observed as manifestation", "Manifestation"],
    M: ["critical movement observed as manifestation", "Manifestation"]
};
let $site_modal,
    $okay;

$(document).ready(() => {
    reposition("#site-selection-modal");
    $site_modal = $("#site-selection-modal");
    $okay = $site_modal.find("#okay");

    initializeTimestamps();
    initializeFormValidator();
    initializeGraphCheckboxesOnClick();
    initializeFileUploading();
    intializeSubmitButtons();
    initializeSiteSelectionModalAndCheckboxes();
    initializeSiteSelectionModalOkayButton();
});

function initializeTimestamps () {
    $(() => {
        $(".timestamp").datetimepicker({
            format: "YYYY-MM-DD HH:mm:00",
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            }
        });

        $(".shift_start").datetimepicker({
            format: "YYYY-MM-DD HH:30:00",
            enabledHours: [7, 19],
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            }
        });

        $(".shift_end").datetimepicker({
            format: "YYYY-MM-DD HH:30:00",
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            },
            useCurrent: false // Important! See issue #1075
        });

        $(".shift_start").on("dp.change", (e) => {
            $(".shift_end").data("DateTimePicker").minDate(e.date);
        });

        $(".shift_end").on("dp.change", (e) => {
            $(".shift_start").data("DateTimePicker").maxDate(e.date);
        });
    });

    $("#shift_start").focusout(({ currentTarget }) => {
        if (currentTarget.value === "") $("#generate").prop("disabled", true).removeClass("btn-info").addClass("btn-danger");
        else $("#generate").prop("disabled", false).removeClass("btn-danger").addClass("btn-info");
    });
}

function initializeFormValidator () {
    jQuery.validator.addMethod("TimestampTest", (value, element) => checkTimestamp(value, element), () => validation_message);

    $("#accomplishmentForm").validate({
        debug: true,
        rules: {
            shift_start: {
                required: true,
                TimestampTest: true
            },
            shift_end: {
                required: true,
                TimestampTest: true
            }
        },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");

            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            // Add `has-feedback` class to the parent div.form-group
            // in order to add icons to inputs
            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>").insertAfter(element);
                if (element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
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
            shift_timestamps = { start: $("#shift_start").val(), end: $("#shift_end").val() };

            $("#loading .progress-bar").text("Generating end-of-shift report...");
            $("#loading").modal("show");

            getShiftReleases(shift_timestamps)
            .then(processShiftReleases)
            .then(processSiteSelectionModal);
        }
    });
}

function checkTimestamp (value, { id }) {
    const hour = moment(value).hour();
    const minute = moment(value).minute();
    let message,
        bool;

    if (id === "shift_start") {
        const $shift_end = $("#shift_end");
        message = "Acceptable times of shift start are 07:30 and 19:30 only.";
        const temp = moment(value).add(13, "hours");
        $shift_end.val(moment(temp).format("YYYY-MM-DD HH:mm:ss"));
        $("#shift_end").prop("readonly", true).trigger("focus");
        setTimeout(() => {
            $("#shift_end").trigger("focusout");
        }, 500);
        bool = (hour === 7 || hour === 19) && minute === 30;
    } else {
        message = "Acceptable times of shift end are 08:30 and 20:30 only.";
        bool = ((hour === 8 || hour === 20) && minute === 30);
    }

    return bool;
}

function intializeSubmitButtons () {
    $(document).on("click", ".submit_buttons", ({ currentTarget }) => {
        const site_code = $(currentTarget).attr("data-site");
        const event_id = $(currentTarget).attr("data-event");
        const internal_alert = $(currentTarget).attr("data-alert");
        const btn_id = $(currentTarget).attr("id");

        switch (btn_id) {
            case "send": sendReport(site_code, event_id); break;
            case "refresh-narratives": refreshNarrativesTextArea(event_id, internal_alert, site_code); break;
            case "download-charts": downloadCharts(site_code); break;
            default: break;
        }
    });
}

function initializeSiteSelectionModalAndCheckboxes () {
    $site_modal.find(".modal-checker").click(({ currentTarget }) => {
        const { id } = currentTarget;
        const $checkboxes = $site_modal.find("input");
        if (id === "modal-check-all") {
            $checkboxes.prop("checked", true);
        } else {
            $checkboxes.prop("checked", false);
        }
        $checkboxes.trigger("change");
    });

    $(document).on("change", "#site-selection-modal input", () => {
        const $checkboxes = $site_modal.find("input:checked");
        if ($checkboxes.length === 0) $okay.prop("disabled", true);
        else $okay.prop("disabled", false);
    });
}

function initializeSiteSelectionModalOkayButton () {
    $okay.click(() => {
        sites_to_do = [];
        const $checkboxes = $site_modal.find("input:checked");
        $checkboxes.each((index, elem) => {
            const { value, site: site_code, event: event_id } = $(elem).data();
            const site_id = value.toString(10);
            sites_to_do.push({ site_id, site_code, event_id });
        });

        getShiftTriggers(all_release_and_event_ids)
        .then(processShiftTriggers)
        .then(prepareReportDataAndHTML)
        .then(delegateReportsToTextAreas)
        .then((x) => {
            auto_save_interval = createAutoSaveDataAnalysisInterval();
            $("#loading").modal("hide");
        })
        .catch(({ responseText, status: conn_status, statusText }) => {
            console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
        });
    });
}

function getShiftReleases (shift_ts) {
    return $.getJSON("/../../accomplishment/getShiftReleases", shift_ts)
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    });
}

/*************************************************
 * Take note that the parameter releases
 * contains all EWI releases for the specific
 * time period INCLUDING extended releases
 ************************************************/
function processShiftReleases (releases) {
    const $recipients_row = $("#mail_recipients_row");

    // Clear all generated reports if there's any
    // before loading another set of reports
    $(".reports_nav_list, .reports_field_list").each((index, obj) => {
        const { id } = obj;
        if (!id.includes("sample")) $(obj).remove();
    });

    if (releases.length !== 0) {
        $recipients_row.show();
        initializeMailRecipients();

        // Group releases per event_id and filter out sites under
        // 3-day extended monitoring
        releases_per_event = groupBy(releases, "event_id", "releases");

        const all_qualified_sites = releases_per_event.map(x => x[0].event_id);

        const obj = {
            release_ids: [], event_ids: [], sites: []
        };

        releases.forEach((release) => {
            const {
                release_id, event_id, site_code, site_id
            } = release;

            console.log(all_qualified_sites, release);
            if (all_qualified_sites.includes(event_id)) {
                obj.release_ids.push(release_id);

                // Check if not duplicate
                if (!obj.event_ids.includes(event_id)) {
                    obj.event_ids.push(event_id);
                    obj.sites.push({ site_id, site_code, event_id });
                }
            }
        });

        all_release_and_event_ids = { ...obj };
        return obj;
    }

    sites_to_do = [];
    clearInterval(auto_save_interval);
    $("#reports_nav_sample").attr("style", "").addClass("active");
    $("#reports_field_sample").attr("hidden", false).addClass("in active");
    $recipients_row.hide();
    $("#loading").modal("hide");
    return null;
}

function processSiteSelectionModal (obj) {
    $("#loading").modal("hide");
    const $modal_cbox = $("#modal-site-checkbox");
    $modal_cbox.empty();
    console.log(obj);

    if (obj !== null) {
        const { sites: { length: len } } = obj;
        let html = "";
        for (let i = 0; i < len; i += 1) {
            const { site_id, site_code, event_id } = obj.sites[i];
            if (i % 9 === 0) html += "<div class=\"row\"><div class=\"col-sm-12\">";
            html += `<label class="checkbox-inline"><input type="checkbox" data-value="${site_id}"` +
                `data-site="${site_code}" data-event="${event_id}">` +
                `${site_code.toUpperCase()}</label>`;
            if (i % 9 === 8 || i === len - 1) html += "</div></div>";
        }

        $modal_cbox.append(html);
        $("#site-selection-modal").modal({
            show: true,
            keyboard: false,
            backdrop: "static"
        });
    }
}

function initializeMailRecipients () {
    $("#mail_recipients_row .bootstrap-tagsinput").css("width", "100%");
    const $recipients = $("#recipients_span");
    const emails = [];
    if (HOSTNAME.includes("dynaslope.phivolcs.dost.gov.ph")) {
        emails.push("rusolidum@phivolcs.dost.gov.ph", "asdaag48@gmail.com", "phivolcs-senslope@googlegroups.com", "phivolcs-dynaslope@googlegroups.com");
    } else if ($recipients.html().length === 0) {
        emails.push("dynaslope.mail@gmail.com");
        $recipients.append("<b style='background-color:yellow;'>TEST SERVER ONLY -- RUS & ASD NOT AUTOMATICALLY TAGGED AS RECIPIENTS FOR SAFEGUARD</b><br/>");
    }
    emails.forEach((x) => { $("#recipients").tagsinput("add", x); });
}

/*************************************************
 * A function that group by elements of an
 * assorted array into array of arrays with
 * additional parameter for filtering extended
 * releases
*************************************************/
function groupBy (collection, property, type) {
    const values = [];
    let result = [];
    let val,
        index;

    for (let i = 0; i < collection.length; i += 1) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1) {
            result[index].push(collection[i]);
        } else {
            values.push(val);
            result.push([collection[i]]);
        }
    }

    // Remove extended monitoring releases
    if (type === "releases") {
        const start = $("#shift_start").val();
        const end = $("#shift_end").val();
        result = result.filter(([x]) => {
            const { status, validity } = x;
            return (status === "extended" && moment(validity).isAfter(moment(start).add(30, "minutes")) &&
            moment(validity).isSameOrBefore(moment(end).subtract(30, "minutes"))) ||
            status === "on-going";
        });
    }

    return result;
}

function getShiftTriggers ({ release_ids, event_ids }) {
    return $.getJSON("/../../accomplishment/getShiftTriggers", { releases: release_ids, events: event_ids })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    });
}

function processShiftTriggers (triggers) {
    // Shift triggers and All triggers contain
    // all of the triggers REGARDLESS of event
    const {
        shiftTriggers: shift_triggers,
        allTriggers: all_triggers
    } = triggers;

    // Grouped_triggers(_x) contains all triggers
    // grouped by event id per array
    const grouped_triggers = groupBy(shift_triggers, "event_id", "triggers");
    const grouped_triggers_x = groupBy(all_triggers, "event_id", "triggers");

    return [grouped_triggers, grouped_triggers_x];
}

/*************************************************
 * Function that iterates array containing
 * array of releases grouped by event id
*************************************************/
function prepareReportDataAndHTML ([shift_triggers, all_triggers]) {
    const backbone_data_per_report = [];
    let hasActiveTabAlready = false;
    releases_per_event.forEach((event_releases, index) => {
        // Check if site_id is NOT included on the sites_to_do array
        // return quickly if true
        const [{ site_id: s_id, event_id, site_code }] = event_releases;
        const is_present = sites_to_do.some(({ site_id }) => site_id === s_id);
        if (!is_present) return;

        const report_data = getReportBackboneData(event_releases, shift_triggers, all_triggers);
        buildEndOfShiftReportSiteTabs(report_data, hasActiveTabAlready);
        hasActiveTabAlready = true;

        const summary_promises = makeShiftSummaryReport(report_data);
        const narrative_promises = makeNarrativeReport(report_data);

        const subsurface_promise = getSubsurfaceColumns(site_code);
        const surficial_promise = getSurficialData(site_code);
        const analysis_promises = $.when(subsurface_promise, surficial_promise)
        .then(([columns], [surficial]) => {
            if (!surficial.hasSentSurficialData) {
                $(`#graph_checkbox_${site_code} .surficial_checkbox`).parent("label")
                .html(`<input class="surficial_checkbox" type="checkbox" value="surficial_${site_code}">Surficial (No Data)`);
            }
            const obj = {
                event_id, columns, surficial, report_data
            };
            processSubsurfaceColumnDropdown(columns, site_code);
            return getDataAnalysisReport(obj);
        });

        const report = $.when(summary_promises, narrative_promises, analysis_promises)
        .then((summary, narratives, analysis) => ({
            summary, narratives, analysis, data: report_data
        }));

        backbone_data_per_report.push(report);
    });

    return $.when(...backbone_data_per_report).then((...args) => {
        const reports = [];
        args.forEach((report) => { reports.push(report); });
        return $.Deferred().resolve(reports);
    });
}

/*************************************************
 * Function for getting the data needed for
 * report creation
*************************************************/
function getReportBackboneData ([event_release], shift_triggers, all_triggers) {
    const {
        site_code, event_id,
        mt_first, mt_last, ct_first, ct_last
    } = event_release;

    const data = {
        ...event_release,
        site: site_code,
        mt: `${mt_first} ${mt_last}`,
        ct: `${ct_first} ${ct_last}`
    };

    // Get an array group on shift triggers corresponding the event
    // and put it in triggers_in_shift
    // triggers_in_shift contains all triggers for an event REGARDLESS of type
    // arranged in DESCENDING TIMESTAMP
    let index = shift_triggers.map(([{ event_id: id }]) => id).indexOf(event_id);
    const triggers_in_shift = index > -1 ? shift_triggers[index] : null;

    let alert_triggers = null;
    if (data.internal_alert_level !== "A0") {
        alert_triggers = data.internal_alert_level.slice(3);
        alert_triggers.replace(/0/g, "");
    }

    // Get in-shift triggers
    data.inshift_triggers = getInshiftTriggers(triggers_in_shift, alert_triggers);

    // Get first trigger
    const first_trigger = all_triggers.map(([{ event_id: id }]) => id).lastIndexOf(event_id);
    const { length } = all_triggers[first_trigger];
    data.first_trigger = all_triggers[first_trigger][length - 1];

    data.event_id = data.first_trigger.event_id;

    // Get last trigger/s from previous shifts
    index = all_triggers.map(([{ event_id: id }]) => id).indexOf(event_id);
    const all_event_triggers = all_triggers[index];
    const obj = { all_event_triggers, triggers_in_shift, alert_triggers };
    data.most_recent = getMostRecentTriggersBeforeShift(obj);

    return data;
}

/*************************************************
 *  Returns most recent triggers alerted on the
 *  shift (one entry per trigger type only)
*************************************************/
function getInshiftTriggers (triggers_in_shift, alert_triggers) {
    if (triggers_in_shift != null) {
        const temp = [];
        if (alert_triggers != null) {
            for (let z = alert_triggers.length; z >= 0; z -= 1) {
                const trigger = alert_triggers[z];
                const triggers_array = triggers_in_shift.map(({ trigger_type }) => trigger_type);

                let y = triggers_array.indexOf(trigger);
                if (y !== -1) {
                    temp.push(triggers_in_shift[y]);
                }

                if (trigger === "G" || trigger === "S" || trigger === "M") {
                    y = triggers_array.indexOf(trigger.toLowerCase());
                    if (y !== -1) {
                        temp.push(triggers_in_shift[y]);
                    }
                }
            }
            return temp;
        } return null;
    } return null;
}

/*************************************************
 * Returns most recent triggers that occurred
 * before shift
*************************************************/
function getMostRecentTriggersBeforeShift ({
    all_event_triggers, triggers_in_shift, alert_triggers
}) {
    const most_recent_before = [];
    if (alert_triggers != null) {
        for (let z = alert_triggers.length; z >= 0; z -= 1) {
            let m = null;
            let triggers_array = null;
            if (triggers_in_shift !== null) {
                triggers_array = triggers_in_shift.map(({ trigger_type }) => trigger_type);
                m = triggers_array.lastIndexOf(alert_triggers[z]);
            }

            let y = null;
            const all_type_array = all_event_triggers.map(({ trigger_type }) => trigger_type);
            const all_triggers_id_array = all_event_triggers.map(({ trigger_id }) => trigger_id);
            // If there's a recent trigger on shift, get the second most recent
            if (m > -1 && m != null) {
                const { trigger_id } = triggers_in_shift[m];
                const index = all_triggers_id_array.indexOf(trigger_id);
                y = all_type_array.indexOf(alert_triggers[z], index + 1);
            } else { // else just get the most recent
                y = all_type_array.indexOf(alert_triggers[z]);
            }

            if (y !== -1) most_recent_before.push(all_event_triggers[y]);

            if (alert_triggers[z] === "G" || alert_triggers[z] === "S" || alert_triggers[z] === "M") {
                m = null;
                if (triggers_in_shift != null) {
                    triggers_array = triggers_in_shift.map(({ trigger_type }) => trigger_type);
                    m = triggers_array.lastIndexOf(alert_triggers[z].toLowerCase());
                }

                y = null;
                // If there's a recent trigger on shift, get the second most recent
                if (m > -1 && m != null) {
                    const { trigger_id } = triggers_in_shift[m];
                    const index = all_triggers_id_array.indexOf(trigger_id);
                    y = all_type_array.indexOf(alert_triggers[z].toLowerCase(), index + 1);
                } else { // else just get the most recent
                    y = all_type_array.indexOf(alert_triggers[z].toLowerCase());
                }

                if (y !== -1) most_recent_before.push(all_event_triggers[y]);
            }
        }
    }

    return most_recent_before;
}

function buildEndOfShiftReportSiteTabs (data, hasActiveTabAlready) {
    const site_code = data.site;
    const { event_id, internal_alert_level: alert, validity } = data;
    const nav_id = `report_nav_${site_code}`;
    const field_id = `report_field_${site_code}`;

    const $nav_sample = $("#reports_nav_sample");
    $nav_sample.clone().attr({
        id: `${nav_id}`, style: ""
    })
    .appendTo("#reports_nav");
    $nav_sample.attr("style", "display:none;").removeClass("active");

    $(`#${nav_id} a`).attr("href", `#${field_id}`)
    .html(`<strong>${site_code.toUpperCase()}</strong>`).removeClass("active");

    const $field_sample = $("#reports_field_sample");
    $field_sample.clone().attr({
        id: `${field_id}`, hidden: false
    })
    .removeClass("in active").appendTo("#reports_field");
    $field_sample.attr("hidden", true).removeClass("in active");

    $(`#${field_id} .submit_area button`)
    .attr({
        disabled: false, "data-site": site_code, "data-event": event_id, "data-alert": alert
    })
    .addClass("submit_buttons");

    $(`#${field_id} textarea`).each((x, y) => {
        const id = $(y).attr("id");
        $(y).attr("id", `${id}_${site_code}`);
    });

    const checkbox_id = `graph_checkbox_${site_code}`;
    $("#graph_checkbox_sample").clone().attr({
        id: `${checkbox_id}`,
        hidden: false,
        "data-validity": validity
    })
    .addClass("graph_checkbox_panel")
    .appendTo(`#${field_id} .graphs-div`);

    const div = `#${checkbox_id}`;
    $(`${div} .rainfall_checkbox`).attr("value", `rain_${site_code}`);
    $(`${div} .surficial_checkbox`).attr("value", `surficial_${site_code}`);
    $(`${div} .file`).attr("value", site_code);
    $(`${div} .files-selected`).attr({
        id: `files-selected-${site_code}`,
        "data-site": site_code
    });
    $(`${div} .files-selected`).tagsinput();
    $(`${div} .bootstrap-tagsinput`).css({ "min-height": "34px", width: "100%" });
    $(`${div} .bootstrap-tagsinput > input`).prop("readonly", true);

    if (hasActiveTabAlready === false) {
        $(`#${nav_id}`).addClass("active");
        $(`#${field_id}`).addClass("in active");
    }
}

function getSubsurfaceColumns (site_code) {
    return $.getJSON(`/../../accomplishment/getSubsurfaceColumns/${site_code}/${shift_timestamps.end}`)
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    });
}

function processSubsurfaceColumnDropdown (columns, site_code) {
    columns.forEach(({ tsm_name, status }) => {
        $("#subsurface_option_sample").clone().attr({ id: `subsurface_option_${tsm_name}`, style: "" })
        .appendTo(`#graph_checkbox_${site_code} .subsurface_options`);

        let attr = "";
        let label = "";
        if (status === "deactivated") {
            attr = "disabled=\"disabled\"";
            label = " (Deactivated)";
        } else if (status === "no_data") label = " (No Data)";

        const html_string = "<input type='checkbox' class='subsurface_checkbox' " +
        `value='subsurface_${tsm_name}' ${attr}>&emsp;${tsm_name.toUpperCase() + label}`;

        $(`#subsurface_option_${tsm_name} a`).html(html_string);
        $(".dropdown-toggle").dropdown();
    });
}

function getSurficialData (site_code) {
    return $.getJSON(`/../../accomplishment/getSurficialData/${site_code}/${shift_timestamps.end}`)
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    });
}

function makeNarrativeReport (report_data) {
    const data = { ...report_data };

    return getShiftNarratives(data).then((narratives) => {
        let narrative_compiled = null;
        narrative_compiled = "<b>NARRATIVE:</b><br/>";
        narratives.forEach(({ timestamp, narrative }) => {
            narrative_compiled = `${narrative_compiled + moment(timestamp).format("hh:mm:ss A")} - ${narrative}<br/>`;
        });
        return $.Deferred().resolve(narrative_compiled);
    });
}

function getShiftNarratives (data) {
    const timestamps = $.extend(true, {}, shift_timestamps);
    timestamps.event_id = data.event_id;
    timestamps.start = moment(timestamps.start).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");
    if (data.internal_alert_level === "A0") timestamps.end = null;

    return $.getJSON("/../../accomplishment/getNarrativesForShift", timestamps)
    .then(x => x);
}

function makeShiftSummaryReport (report_data) {
    let report = null;
    const {
        mt, ct, event_start, most_recent,
        first_trigger: { trigger_type: first_trigger_type, info: first_trigger_info },
        internal_alert_level, validity, inshift_triggers
    } = report_data;
    const report_header = `<b>END-OF-SHIFT REPORT (${mt.replace(/[^A-Z]/g, "")}, ${ct.replace(/[^A-Z]/g, "")})</b><br/>`;
    const shift_start = `<b>SHIFT START:<br/>${moment(shift_timestamps.start).format("MMMM DD, YYYY, hh:mm A")}</b>`;
    const shift_end = `<b>SHIFT END:<br/>${moment(shift_timestamps.end).format("MMMM DD, YYYY, hh:mm A")}</b>`;

    // ORGANIZE SHIFT START INFO
    let start_info = null;
    const report_start = moment(event_start).format("MMMM DD, YYYY, hh:mm A");

    if (moment(event_start).isAfter(moment(shift_timestamps.start).add(30, "minutes")) && moment(event_start).isSameOrBefore(moment(shift_timestamps.end).subtract(30, "minutes"))) {
        start_info = `Monitoring initiated on ${report_start} due to ${basis_to_raise[first_trigger_type][0]} (${first_trigger_info}).`;
    } else {
        const a = `Event monitoring started on ${report_start} due to ${basis_to_raise[first_trigger_type][0]} (${first_trigger_info}).`;
        let b = null;
        if (most_recent.length > 0) {
            b = "the following recent trigger/s: ";
            b += "<ul>";
            most_recent.forEach((recent) => {
                const { trigger_type, timestamp, info } = recent;
                b = `${b}<li> ${basis_to_raise[trigger_type][1]} - alerted on ${moment(timestamp).format("MMMM DD, YYYY, hh:mm A")} due to ${basis_to_raise[trigger_type][0]} (${info})</li>`;
            });
            b += "</ul>";
        } else { b = "no new alert triggers from previous shift.<br/>"; }
        start_info = `Monitoring continued with ${b}- ${a}`;
    }

    // ORGANIZE SHIFT END INFO
    let end_info = null;
    if (internal_alert_level === "A0") {
        end_info = `Alert <b>lowered to A0</b>; monitoring ended at <b>${moment(validity).format("MMMM DD, YYYY, hh:mm A")}</b>.<br/>`;
    } else {
        let a = `The current internal alert level is <b>${internal_alert_level}</b>.<br/>- `;
        if (inshift_triggers !== null && inshift_triggers.length !== 0) {
            a += "The following alert trigger/s was/were encountered: ";
            a += "<ul>";
            inshift_triggers.forEach((inshift) => {
                const { trigger_type, timestamp, info } = inshift;
                a = `${a}<li> <b>${basis_to_raise[trigger_type][1]}</b> - alerted on <b>${moment(timestamp).format("MMMM DD, YYYY, hh:mm A")}</b> due to ${basis_to_raise[trigger_type][0]} (${info})</li>`;
            });
            a += "</ul>";
        } else { a += "No new alert triggers encountered.<br/>"; }
        const con = `Monitoring will continue until <b>${moment(validity).format("MMMM DD, YYYY, hh:mm A")}</b>.<br/>`;

        end_info = `${a}- ${con}`;
    }

    report = `${report_header}<br/>${shift_start}<br/>- ${start_info}<br/><br/>${shift_end}<br/>- ${end_info}`;
    return report;
}

function getDataAnalysisReport (obj) {
    const {
        event_id, columns, surficial, report_data: { internal_alert_level }
    } = obj;

    return $.getJSON("/../../accomplishment/getEndOfShiftDataAnalysis", { shift_start: shift_timestamps.start, event_id })
    .catch(({ responseText, status: conn_status, statusText }) => {
        alert(`Status ${conn_status}: ${statusText}`);
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    })
    .then((result) => {
        let { analysis } = result;
        if (analysis === null) {
            const subsurface = createInitialSubsurfaceAnalysis(columns);
            const ground = createInitialSurficialAnalysis(surficial);
            const additional = checkForAdditionalTriggersForAnalysis(internal_alert_level);

            analysis = "<b>DATA ANALYSIS:</b><br/>- " +
            `<i>Subsurface data: ${subsurface}</i>` +
            `<br/>- <i>Surficial data: ${ground}</i>` +
            `<br/>- <i>Rainfall data: </i> ${additional}`;
        }

        return $.Deferred().resolve(analysis);
    });
}

function createInitialSubsurfaceAnalysis (columns) {
    let report = "";
    let connector = "is";
    let cols = "";

    const inactive = columns.filter(x => x.status === "deactivated");
    const { length: in_len } = inactive;
    if (in_len > 0) {
        if (in_len > 1) connector = "are";
        cols = inactive.map(x => x.tsm_name.toUpperCase());
        cols = [cols.slice(0, -1).join(", "), cols.slice(-1)[0]].join(cols.length < 2 ? "" : " and ");
        report += `<b>${cols}</b> ${connector} already deactivated. `;
    }

    const no_data = columns.filter(x => x.status === "no_data");
    const { length: no_len } = no_data;
    if (no_len > 0) {
        cols = no_data.map(x => x.tsm_name.toUpperCase());
        cols = [cols.slice(0, -1).join(", "), cols.slice(-1)[0]].join(cols.length < 2 ? "" : " and ");
        report += `No available data from <b>${cols}</b> all throughout the shift. `;
    }

    const with_data = columns.filter(x => x.status === "with_data");
    with_data.forEach(({ tsm_name }) => {
        report += `<b>${tsm_name.toUpperCase()}</b> - [write analysis here]. `;
    });

    return report;
}

function createInitialSurficialAnalysis ({ hasSentSurficialData, surficial_data }) {
    let report = "No surficial data received from LEWC";

    if (hasSentSurficialData) {
        const { latest, second_latest, markers } = surficial_data;
        report = `Latest data received last <b>${moment(latest).format("MMMM DD, YYYY, hh:mm A")}</b>. `;
        report += `Displacement of marker(s) from last data sending <b>(${moment(second_latest).format("MMMM DD, YYYY, hh:mm A")}):</b> `;

        markers.forEach(({ marker_id, displacement }, index) => {
            let comma = ", ";
            if (index === markers.length - 1) comma = ". ";
            report += `<b>${marker_id} - ${displacement}</b>${comma}`;
        });
    }

    return report;
}

function checkForAdditionalTriggersForAnalysis (internal_alert_level) {
    const triggers = [
        { trigger: "m", head: "Manifestation data:" },
        { trigger: "E", head: "Earthquake data:" }
    ];

    let report = "";
    triggers.forEach(({ trigger, head }) => {
        const regex = new RegExp(trigger, "i");
        if (regex.test(internal_alert_level)) {
            report += `<br/>- <i>${head}<i>`;
        }
    });

    return report;
}

function delegateReportsToTextAreas (reports) {
    reports.forEach((report) => {
        const { data: { site } } = report;
        Object.keys(report).forEach((key) => {
            if (key !== "data") {
                const name = `shift_${key}_${site}`;
                $(`#${name}`).val(report[key]);
                const editor = CKEDITOR.instances[name];
                if (editor) { editor.destroy(true); }
                CKEDITOR.replace(name, { height: 250 });
            }
        });
    });
}

function initializeGraphCheckboxesOnClick () {
    $(document).on("click", ".subsurface_options a", ({ target }) => {
        $(target).children("input").trigger("click");
    });

    $(document).on("click", ".rainfall_checkbox, .surficial_checkbox, .subsurface_checkbox", ({ currentTarget }) => {
        if ($(currentTarget).is(":checked")) {
            const [type, site] = $(currentTarget).val().split("_");
            const shift_start = $("#shift_start").val();
            const shift_end = $("#shift_end").val();
            let validity = $(currentTarget).parents(".graph_checkbox_panel").data("validity");

            // Add thirty minutes to the validity since shift_end is always
            // 30 minutes ahead from last validity possible for the shift
            validity = moment(validity).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");

            let end_ts = shift_end;
            if (moment(validity).isBefore(shift_end)) end_ts = validity;
            window.open(`${window.location.origin}/analysis/eos_charts/${current_user_id}/${type}/${site}/${shift_start}/${end_ts}`, "_blank");
        }
    });
}

function initializeFileUploading () {
    reposition("#resultModal");
    reposition("#loading");

    $(document).on("click", ".browse", ({ currentTarget }) => {
        const file = $(currentTarget).parent().parent().parent()
        .find(".file");
        file.trigger("click");
    });

    $(document).on("change", ".file", ({ currentTarget }) => {
        const { files } = currentTarget;
        const site = $(currentTarget).attr("value");
        if (!Object.prototype.hasOwnProperty.call(upload_files, site)) {
            upload_files[site] = [];
        }

        for (let i = 0; i < files.length; i += 1) {
            if (upload_files[site].map(x => x.site_code).indexOf(files[i].site_code) === -1) {
                upload_files[site].push(files[i]);
                $(`#files-selected-${site}`).tagsinput("add", files[i].site_code);
            }
        }
    });

    $(document).on("itemRemoved", ".files-selected", (x) => {
        const { item, target: { dataset: { site } } } = x;
        const index = upload_files[site].map(({ site_code }) => site_code).indexOf(item);
        upload_files[site].splice(index, 1);
    });
}

function sendReport (site_code, event_id) {
    // Get all three values on textarea reports
    // Get files attached
    // Send
    // Save data analysis/expert opinion part

    let final_report = "";
    let analysis_report;
    const recipients = $("#recipients").tagsinput("items");
    const form_data = new FormData();
    const file_data = typeof upload_files[site_code] !== "undefined" ? upload_files[site_code] : [];
    const is_test = (HOSTNAME.includes("dynaslope.phivolcs.dost.gov.ph")) ? false : true;
    const form = {
        event_id,
        site_code,
        recipients: JSON.stringify(recipients),
        is_test
    };

    $(`#report_field_${site_code} textarea`).each((index, id) => {
        const textarea_id = $(id).attr("id");
        const report = CKEDITOR.instances[textarea_id].getData();
        if (textarea_id.includes("analysis")) analysis_report = report;

        final_report += final_report !== "" ? "<br/><br/>" : "";
        final_report += report;
    });
    form.body = final_report;

    for (let i = 0; i < file_data.length; i += 1) {
        form_data.append("file[]", file_data[i]);
    }

    renderCharts(site_code)
    .then(
        (x) => {
            form.toAttachRender = true;
            form.filename = `${site_code.toUpperCase()}_${moment(shift_timestamps.end).format("DDMMMYYYY_hA")}`;
        },
        () => {
            form.toAttachRender = false;
            $.Deferred().resolve();
        }
    )
    .then(() => {
        for (const key in form) {
            if (form.hasOwnProperty(key)) form_data.append(key, form[key]);
        }
        $("#loading .progress-bar").text("Sending end-of-shift report...");

        saveExpertOpinion(event_id, analysis_report, shift_timestamps.start);
    })
    .then(() => mailReport(form_data))
    .then((x) => {
        $("#loading").modal("hide");
        sites_to_do = sites_to_do.filter(y => y.site_code !== site_code);
        if (x === "Sent.") {
            console.log("Email sent.");
            $(`#report_nav_${site_code} a`).attr("style", "background-color: lightgreen !important");
            $("#resultModal .modal-body").html("<strong>SUCCESS:</strong>&ensp;End-of-shift report sent!");
            $("#resultModal").modal("show");
        } else {
            console.log(`%c► EOS ${x}`, "background: rgba(255,127,80,0.3); color: black");
            $("#resultModal .modal-body").html(`<strong>ERROR:</strong>&ensp;Early warning information and bulletin sending failed!<br/><br/><i>${x}</i>`);
            $("#resultModal").modal("show");
            sendEosErrorLog(`error sending end-of-shift report ${x}`);
        }
    });
}

function mailReport (form_data) {
    return $.ajax({
        type: "POST",
        url: "/../../accomplishment/mail",
        cache: false,
        data: form_data,
        processData: false,
        contentType: false
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        return $.Deferred().resolve(responseText);
    });
}

function refreshNarrativesTextArea (event_id, internal_alert, site) {
    makeNarrativeReport({ event_id, internal_alert_level: internal_alert })
    .then(x => $.Deferred().resolve([{ narratives: x, data: { site } }]))
    .then((x) => { delegateReportsToTextAreas(x, false); });
}

/*************************************************
 * Save Expert Opinion Function
*************************************************/
function saveExpertOpinion (event_id, analysis, shift_start) {
    const form = { event_id, analysis, shift_start };
    $.post("/../../accomplishment/saveExpertOpinion", form)
    .catch(({ responseText, status: conn_status, statusText }) => {
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
        sendEosErrorLog(`error saving expert opinion ${responseText}`);
    });
}

function saveAllDataAnalysisAutomatically () {
    sites_to_do.forEach((obj) => {
        const { site_code, event_id } = obj;
        const analysis = CKEDITOR.instances[`shift_analysis_${site_code}`].getData();
        saveExpertOpinion(event_id, analysis, shift_timestamps.start);
    });

    console.log("Auto-save done", sites_to_do);
}

function createAutoSaveDataAnalysisInterval () {
    return setInterval(() => {
        saveAllDataAnalysisAutomatically();
    }, 60000);
}

function downloadCharts (site_code) {
    renderCharts(site_code)
    .done((data) => {
        $("#loading").modal("hide");
        if (data === "Finished") {
            const filename = `${site_code.toUpperCase()}_${moment(shift_timestamps.end).format("DDMMMYYYY_hA")}`;
            window.location.href = `/../../chart_export/viewPDF/${filename}.pdf`;
        } else {
            $("#resultModal .modal-body").html("<strong>ERROR:</strong>&ensp;Charts Rendering and Download<br/><br/><i></i>");
            $("#resultModal").modal("show");
        }
    })
    .fail((response) => {
        $("#loading").modal("hide");
        $("#resultModal .modal-body").html(`<strong>ERROR:</strong>&ensp;Charts Rendering and Download<br/><br/><i>${response}</i>`);
        $("#resultModal").modal("show");
    })
    .catch(({ responseText, status: conn_status, statusText }) => {
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
    });
}

function renderCharts (site_code) {
    const shouldRender = checkIfThereIsChartToRender(site_code);
    if (shouldRender === false) return $.Deferred().reject("No selected charts to download");
    const svg = shouldRender;

    $("#loading .progress-bar").text("Rendering end-of-shift charts...");
    $("#loading").modal("show");

    return $.post("/../../chart_export/renderCharts", { site_code, svg, connection_id: current_user_id })
    .catch(({ responseText, status: conn_status, statusText }) => {
        console.log(`%c► EOS ${responseText}`, "background: rgba(255,127,80,0.3); color: black");
        sendEosErrorLog(`error rendering EOS chart ${responseText}`, true);
    });
}

function checkIfThereIsChartToRender (site_code) {
    const svg = [];
    $(`#graph_checkbox_${site_code}`).find("input[type=checkbox]:checked")
    .each((index, cbox) => {
        let val = $(cbox).val();
        if (val.search("subsurface") === -1) {
            const x = val.search("_");
            val = val.slice(0, x);
        }
        svg.push(val);
    });

    if (svg.length === 0) return false;
    return svg;
}

function sendEosErrorLog (x, is_chart = false) {
    let metric_name = "eos_error_logs";
    if (is_chart) metric_name = "eos_charts_error_logs";
    const report = {
        type: "error_logs",
        metric_name,
        module_name: "End-of-shift Report",
        report_message: x
    };

    PMS.send(report);
}
