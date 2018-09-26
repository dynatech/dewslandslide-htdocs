
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Early Warning Information Release Form [public_alert/alert_release_form.php]
 *  [host]/public_alert/release_form
 *
****/

let this_event_status = "new";
let validity_global = null;
let heightened_features_table = null;
let heightened_features = [];
let toExtendND = false;
let trigger_list = [];
let current_event = {};
let saved_triggers = [];
let m_features_num = 1;

$(document).ready(() => {
    setPageWrapperHeight();
    initializeTooltips();
    initializeTimestamps();
    initializeFormValidator();

    ondataTimestampChange();
    mainTabGeneralxRoutine();
    onSiteChange();
    onPublicAlertLevelChange();
    onTriggerSwitchClick();
    onOperationalTriggersAndNoDataClick();
    onRxButtonClick();
    initializeManifestationRelatedDOM();

    routineAreaFunctions();
});

/*******************************************
 *
 *   Adjust page wrapper height on resize
 *
*******************************************/
function setPageWrapperHeight () {
    $(window).on("resize", () => {
        const window_h = $(window).height();
        $("#page-wrapper").css("min-height", window_h);
    }).resize();
}

/*******************************************
 *
 *           Initialize tooltips
 *
*******************************************/
function initializeTooltips () {
    $("#nd label").tooltip();
    $(".cbox_trigger_nd[value=R0]").parent("label").tooltip();
    $(".cbox_trigger_rx").parent("label").tooltip();
    $(".trigger_info[name=trigger_manifestation_info]").siblings("label").tooltip();
}

/*******************************************
 *
 *           Initialize Timestamps
 *
*******************************************/
function initializeTimestamps () {
    $(".datetime").datetimepicker({
        format: "YYYY-MM-DD HH:mm:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    }).on("dp.show", function (e) {
        $(this).data("DateTimePicker").maxDate(moment().second(0));
    });

    $(".time").datetimepicker({
        format: "HH:mm:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    });
}

/*******************************************
 *
 *   Control changes in General vs Routine
 *
*******************************************/
function mainTabGeneralxRoutine () {
    $(".btn-group-justified button").click(function () {
        const div_size = {
            a: ["5", "3", "4"],
            b: ["6", "0", "6"]
        };
        const $form_group = $("#release_info_area .panel-body .form-group");
        if ($(this).attr("id") === "general") {
            $("#sites_area").slideUp();
            $("#operational_area").slideDown();
            $("#site_id").val("").trigger("change");
            $form_group.each(function (i) {
                $(this).switchClass(`col-sm-${div_size.b[i]}`, `col-sm-${div_size.a[i]}`, 500, "easeOutQuart", () => {
                    $("#site_id").parent().prop("style", "display: block");
                });
            });
        } else {
            $(".extended").parent().css({ color: "rgb(62, 212, 43)" });
            $(".active").parent().css({ color: "red" });

            $("#sites_area").slideDown();
            $("#operational_area").slideUp();
            $("#site_info_area").slideUp();
            $("#public_alert_level").val("").trigger("change");
            $("#public_alert_level option[value=A3], #public_alert_level option[value=A2], #public_alert_level option[value=A1]").prop("disabled", true);
            $("#site_id").val("").parent().prop("style", "display: none");
            $form_group.each(function (i) {
                $(this).switchClass(`col-sm-${div_size.a[i]}`, `col-sm-${div_size.b[i]}`, 500, "easeInQuart");
            });
            this_event_status = "routine";
            getFinishedReleasedRoutineSites();
        }
    });
}

/*******************************************
 *
 *   Activities when Data Timestamp Changes
 *
*******************************************/
function ondataTimestampChange () {
    $(".datetime").on("dp.change", (e) => { if (this_event_status === "routine") getFinishedReleasedRoutineSites(); });

    // Ensure that Data Timestamp is filled
    // first before Public Alert Level
    $(".datetime").on("change dp.change", (e) => {
        if (e.currentTarget.id === "entry" && $("#timestamp_entry") !== "") $("#public_alert_level").prop("disabled", false).val("");
    });
}

/*******************************************
 *
 *     Procedures on Site Option Change
 *
*******************************************/
function onSiteChange () {
    $("#site_id").change(({ currentTarget: { value } }) => {
        const site_id = value === "" ? 0 : value;
        saved_triggers = [];

        // Clear all trigger timestamps area
        $(".trigger_time").val("");

        // Clear all validation on form
        $("#operational_area .form-group").removeClass("has-feedback").removeClass("has-error").removeClass("has-success");
        $("#operational_area .glyphicon.form-control-feedback").remove();

        $("#heightened-features-div").hide();

        getLastSiteEvent(site_id)
        .done((event) => {
            // Reset fields on site_info_area
            $("#status").html("Monitoring Status: <br><b>[STATUS]</b>");
            $("#details").html("Event-based monitoring started on <b>[TIMESTAMP]</b>, valid until <b>[VALIDITY]</b>. Recent early warning released last <b>[LAST]</b>.");
            $("#current_alert").html("Current Internal Alert: <br><b>[ALERT]</b>");
            $("#site_info_area").slideUp(10);

            current_event = Object.assign({}, event);

            const { status: event_status, event_start, validity } = event;
            if (event_status === "on-going" || event_status === "extended") {
                this_event_status = event_status;
                validity_global = validity;
                $("#status").html($("#status").html().replace("[STATUS]", event_status.toUpperCase()));
                if (event_status === "on-going") {
                    $("#details").html($("#details").html()
                    .replace("[TIMESTAMP]", moment(event_start).format("dddd, MMMM Do YYYY, HH:mm"))
                    .replace("[VALIDITY]", moment(validity).format("dddd, MMMM Do YYYY, HH:mm")));
                } else {
                    $("#details").html(`Event-based monitoring started on <b>${moment(event_start).format("dddd, MMMM Do YYYY, HH:mm")}</b> and ended on <b>${moment(validity).format("dddd, MMMM Do YYYY, HH:mm")}</b>. The site is under three-day extended monitoring.`);
                }
                $("#site_info_area").slideDown();
            } else { // If no current alert for the site
                this_event_status = "new";
                saved_triggers = [];
                current_event = {};
                validity_global = null;
                heightened_features = [];

                $(".previous_info span:nth-child(2)").text("No trigger yet.");
                $("#site_info_area").slideUp();
                $(".cbox_trigger_rx").prop({ disabled: true, checked: false }).trigger("change");
                $(".cbox_trigger_nd").prop({ disabled: true, checked: false });
                $("#public_alert_level").val("").trigger("change")
                .find("option")
                .prop("disabled", false);
            }

            // TO-DO: Break out of promise chain if status is finished or invalid
            // return $.Deferred().reject(); else return event
            // change this chain from done -> then
        })
        .then(getLastRelease)
        .done((release) => {
            const { internal_alert_level, data_timestamp } = release;
            // Save internal alert level on CURRENT ALERT LEVEL
            // and change column size of different columns for aesthetics
            $("#current_alert").html($("#current_alert").html().replace("[ALERT]", internal_alert_level));
            $("#details").html($("#details").html()
            .replace("[LAST]", moment(data_timestamp).add(30, "minutes").format("dddd, MMMM Do YYYY, HH:mm")));

            const triggers = internal_alert_level.substr(3).split("");
            for (let i = 0; i < triggers.length; i += 1) {
                if (triggers[i + 1] === "0" || triggers[i + 1] === "x") {
                    saved_triggers.push(triggers[i] + triggers[i + 1]);
                    i += 1;
                } else saved_triggers.push(triggers[i]);
            }

            // Trigger Public ALert change and restrict unintentional level lowering
            // except to A0
            const x = internal_alert_level.substr(0, 2);
            const public_alert = x === "ND" ? "A1" : x;
            switch (public_alert) {
                case "A3":
                    $("#public_alert_level option[value=A2]").prop("disabled", true);
                    // fall through
                case "A2":
                    $("#public_alert_level option[value=A1]").prop("disabled", true); break;
                case "A1":
                    // fall through
                default:
                    $("#public_alert_level option").prop("disabled", false); break;
            }

            $("#public_alert_level").val(public_alert).trigger("change");
            if (x === "ND") setTimeout(() => { $(".cbox_nd").trigger("click"); }, 1000);
        })
        .then(getAllEventTriggers)
        .done((event_triggers) => {
            $(".cbox_trigger_rx").prop("disabled", true).prop("checked", false);
            $(".cbox_trigger_nd").prop("disabled", true).prop("checked", false);
            $(".cbox_trigger_switch").prop("checked", false);

            const trig_list = [...saved_triggers];
            const base_trigs = trig_list.filter(x => x !== "rx").map(clearZeroAndXFromTrigger);

            // Re-save the triggers WITHOUT 0 on saved_triggers after using its
            // purpose of checking x0 checkboxes
            saved_triggers = [...base_trigs];

            trig_list.forEach((trigger) => {
                switch (trigger) {
                    case "R0": case "Rx": case "rx":
                        if (trigger === "R0") checkCbox(trigger, "nd");
                        else checkCbox("rx", "rx");
                        // fall through
                    case "R": checkCbox("rs"); enableCbox("R0"); break;
                    case "E": checkCbox("es"); break;
                    case "D": checkCbox("ds"); break;
                    case "g0": case "G0": checkCbox("g0", "nd");
                        // fall through
                    case "G": case "g": checkCbox("gs"); enableCbox("g0"); break;
                    case "s0": case "S0": checkCbox("s0", "nd");
                        // fall through
                    case "S": case "s": checkCbox("ss"); enableCbox("s0"); break;
                    case "m0": case "M0": checkCbox("m0", "nd");
                        // fall through
                    case "M": case "m": checkCbox("ms"); enableCbox("m0"); break;
                    default: checkCbox(trigger); break;
                }
            });

            const grouped_triggers = base_trigs.map(trigger =>
                groupTriggersByType(trigger, event_triggers));

            $(".cbox_trigger_switch").trigger("change");
            $(".cbox_trigger_nd").trigger("change");

            const desc_lookup = {
                R: "#rainfall_desc", E: "#eq_desc", G: "#surficial_desc", S: "#subsurface_desc", D: "#od_desc", M: "#manifestation_desc"
            };

            grouped_triggers.forEach((trigger_group) => {
                const { timestamp, trigger_type, eq_info } = trigger_group[0];
                let desc = `Latest trigger occurred on ${moment(timestamp).format("dddd, MMMM Do YYYY, HH:mm")}`;
                switch (trigger_type) {
                    case "g": // fall through
                    case "s": // fall through
                    case "m":
                        desc += " (L2)"; break;
                    case "G": // fall through
                    case "S": // fall through
                    case "M":
                        desc += " (L3)"; break;
                    case "E":
                        const { magnitude, latitude, longitude } = eq_info[0];
                        $("#magnitude").val(magnitude);
                        $("#latitude").val(latitude);
                        $("#longitude").val(longitude);
                        break;
                    default: break;
                }

                $(`${desc_lookup[trigger_type.toUpperCase()]} span:nth-child(2)`).text(desc);

                // EDIT THING ON HEIGHTENED FEATURES MANIFESTATION
                if (trigger_type === "M" || trigger_type === "m") {
                    heightened_features = trigger_group[0].heightened_m_features;
                    showHeightenedManifestationFeatures(heightened_features);
                }
            });
        })
        .catch(({ responseText, status: conn_status, statusText }) => {
            alert(`Status ${conn_status}: ${statusText}`);
            alert(responseText);
        });
    });
}

function getLastSiteEvent (site_id) {
    return $.getJSON(`../pubrelease/getLastSiteEvent/${site_id}`)
    .catch(err => err);
}

function getLastRelease ({ event_id }) {
    return $.getJSON(`../pubrelease/getLastRelease/${event_id}`)
    .catch(err => err);
}

function getAllEventTriggers ({ event_id }) {
    return $.getJSON(`../pubrelease/getAllEventTriggers/${event_id}`)
    .catch(err => err);
}

// Remove 0 from trigger list (if internal alert has no data)
function clearZeroAndXFromTrigger (x) {
    return x.replace("0", "").replace("x", "");
}

function checkCbox (x, y = "switch") { $(`.cbox_trigger_${y}[value=${x}]`).prop("checked", true); }
function enableCbox (x) { $(`.cbox_trigger_nd[value=${x}]`).prop("disabled", false); }

function groupTriggersByType (trigger, event_triggers) {
    const group = event_triggers.filter(({ trigger_type }) =>
        trigger_type === trigger || trigger_type === trigger.toLowerCase());
    group.sort((a, b) => {
        if (moment(a.timestamp).isAfter(b.timestamp)) return -1; return 1;
    });
    return group;
}

/*******************************************
 *
 *  Procedures on Public Alert Level change
 *
*******************************************/
function onPublicAlertLevelChange () {
    $("#public_alert_level").change(({ target: { value } }) => {
        $(".cbox_trigger_switch").prop("disabled", false);
        $(".cbox_trigger").prop("checked", false);
        $("#alert_invalid").slideUp();

        publicAlertHandler(value);

        // Show invalid alert notification if Alert is lowered prematurely
        if (!$.isEmptyObject(current_event)) {
            if (value === "A0" && moment($("#timestamp_entry").val()).add(30, "minutes").isBefore(current_event.validity)) {
                this_event_status = "invalid";
                $("#alert_invalid").slideDown();
            } else $("#alert_invalid").slideUp();
        }

        $(".cbox_trigger_switch").trigger("change");
        $(".cbox_trigger").trigger("change");
    });
}

function publicAlertHandler (alert_level) {
    const trigger_switch = $(".cbox_trigger_switch");
    switch (alert_level) {
        default:
        case "":
            $(trigger_switch).prop({ checked: false, disabled: true });
            $(".cbox_nd[value=ND]").prop({ checked: false, disabled: true });
            break;
        case "A0":
            $(trigger_switch).not("[value=ms]").prop({ checked: false, disabled: true });
            $(".cbox_trigger_switch[value='ms']").prop("disabled", false);
            $(".cbox_trigger[value=M], .cbox_trigger[value=m]").prop("disabled", true);
            $(".cbox_nd[value=ND]").prop({ checked: false, disabled: false });
            $(".cbox_trigger_nd").prop({ checked: false, disabled: true });
            $(".cbox_trigger_rx").prop({ checked: false, disabled: true });
            toExtendND = false;
            break;
        case "A1":
            $(".cbox_trigger_switch[value='gs'], .cbox_trigger_switch[value='ss']").prop({ checked: false, disabled: true });
            $(".cbox_nd[value=ND]").prop({ checked: false, disabled: false });
            $(".cbox_trigger[value=M], .cbox_trigger[value=m]").prop("disabled", true);
            break;
        case "A2":
            $(".cbox_trigger[value=G], .cbox_trigger[value=S], .cbox_trigger[value=M]").prop({ checked: false, disabled: true });
            $(".cbox_trigger[value=m]").prop("disabled", false);
            $(".cbox_nd[value=ND]").prop({ checked: false, disabled: true });
            break;
        case "A3": $(trigger_switch).prop("disabled", false);
            $(".cbox_trigger[value='G'], .cbox_trigger[value='S'], .cbox_trigger[value=M]").prop("disabled", false);
            $(".cbox_nd[value=ND]").prop({ checked: false, disabled: true });
            break;
    }
}

/*******************************************
 *
 *  Procedures on Trigger Switch Click
 *
*******************************************/
const lookup = [{ value: "rs", area_div: "rainfall_area", isVisible: false },
    { value: "es", area_div: "eq_area", isVisible: false },
    { value: "ds", area_div: "od_area", isVisible: false },
    { value: "gs", area_div: "surficial_area", isVisible: false },
    { value: "ss", area_div: "subsurface_area", isVisible: false },
    { value: "ms", area_div: "manifestation_area", isVisible: false }];

function onTriggerSwitchClick () {
    $(".cbox_trigger_switch").change(() => {
        const switch_checked = $(".cbox_trigger_switch:checked");
        for (let i = 0; i < lookup.length; i += 1) lookup[i].isVisible = false;

        for (let i = 0; i < switch_checked.length; i += 1) {
            const val = $(switch_checked[i]).val();
            const pos = lookup.map(({ value }) => value).indexOf(val);
            if (pos >= 0) lookup[pos].isVisible = true;
        }

        // Hide trigger fields that are not checked
        lookup.forEach(({ isVisible, area_div }) => {
            if (isVisible) $(`#${area_div}`).slideDown();
            else $(`#${area_div}`).slideUp();
        });
    });
}

/*******************************************
 *
 *    Procedures on Operationa Triggers
 *      and No Data Checkboxes Click
 *
*******************************************/
function onOperationalTriggersAndNoDataClick () {
    $(".cbox_nd").click(() => {
        const internal_alert_div = $("#internal_alert_level");
        const internal_alert = internal_alert_div.val();
        let temp;
        if ($(".cbox_nd").is(":checked")) {
            temp = internal_alert.replace(internal_alert.substr(0, 2), "ND");
            toExtendND = true;
        } else {
            temp = internal_alert.replace("ND", $("#public_alert_level").val());
            toExtendND = false;
        }

        internal_alert_div.val(temp);
    });

    $(".cbox_trigger, .cbox_trigger_nd").change(({ currentTarget }) => {
        trigger_list = [];
        trigger_list = [...saved_triggers];
        const { value: trigger_letter } = currentTarget;

        // Disable trigger divs on ND check
        if (trigger_letter.indexOf("0") >= 0) onNoDataClick(currentTarget);
        else {
            const isSpecificTriggerReleased = trigger_list.some((x) => {
                return x.toUpperCase() === trigger_letter.toUpperCase();
            });
            const temp_letter = trigger_letter === "R" ? trigger_letter : trigger_letter.toLowerCase();
            const nd_trigger = `.cbox_trigger_nd[value=${temp_letter}0]`;

            // if cbox trigger is checked, uncheck and disable corresponding ND
            if ($(`.cbox_trigger[value=${trigger_letter}]`).is(":checked")) {
                $(nd_trigger).prop({ disabled: true, checked: false });
                $(nd_trigger).trigger("change");

            // if trigger already occurred or released, make ND button available
            } else if (isSpecificTriggerReleased) {
                // Except if non-triggering features is checked; make ND unavailable
                if ($("#nt_feature_cbox").is(":checked") && trigger_letter.toLowerCase() === "m") {
                    $(nd_trigger).prop({ disabled: true });
                } else $(nd_trigger).prop({ disabled: false });
            }
        }

        // Disable Timestamp Input Validation Checkbox Fields
        const $timestamp_div = $(currentTarget).closest("span").next("div").children("input");
        const $tech_info = $(`#${$timestamp_div.attr("id")}_info`);
        if ($(`.cbox_trigger[value=${trigger_letter}]`).is(":checked")) {
            $timestamp_div.prop("disabled", false);
            $tech_info.prop("disabled", false);
        } else {
            $timestamp_div.prop("disabled", true);
            $tech_info.prop("disabled", true);
        }

        // If Checkbox is E, enable magnitude, latitude and longitude
        if ($(".cbox_trigger[value=E]").is(":checked")) $("#magnitude, #latitude, #longitude").prop("disabled", false);
        else $("#magnitude, #latitude, #longitude").prop("disabled", true);

        // If Checkbox is D, enable magnitude, latitude and longitude
        if ($(".cbox_trigger[value=D]").is(":checked")) $(".od_group, #reason").prop("disabled", false);
        else $(".od_group, #reason").prop("disabled", true);

        const $small_m = $(".cbox_trigger[value=m]");
        const $big_m = $(".cbox_trigger[value=M]");
        const public_alert = $("#public_alert_level").val();

        // If Checkbox is m or M, enable corresponding group and validator
        if ($(".cbox_trigger[value=m]").is(":checked") || $(".cbox_trigger[value=M]").is(":checked")) {
            if ($small_m.is(":checked")) $big_m.prop({ disabled: true, checked: false });
            else $small_m.prop({ disabled: true, checked: false });

            $("#features_div").slideDown();
            $("#manifestation_validator, #manifestation_area .trigger_info").prop({ disabled: false });
            $("#features_field input:not([type='checkbox']), #features_field select, #features_field textarea").prop("disabled", false);
            $("#features_field input[type='checkbox']").prop("disabled", false);
        } else {
            // TODO: Add logic about M2 being disabled on A3 onset of M
            if ($(currentTarget).hasClass("cbox_trigger")) {
                if (public_alert !== "A1" && public_alert !== "A0") {
                    if (public_alert === "A3") $big_m.prop("disabled", false);
                    $small_m.prop("disabled", false);
                }
            }

            $("#features_div").slideUp();
            if (!$("#nt_feature_cbox").is(":checked")) $("#manifestation_validator").prop({ disabled: true });
            $("#manifestation_area .trigger_info").prop({ disabled: true });
            $("#features_field input:not([type='checkbox']), #features_field select, #features_field textarea").prop("disabled", true);
            $("#features_field input[type='checkbox']").prop({ disabled: true, checked: false });
        }

        $("#features_field .feature_group").each(function () {
            if ($(this).find(".feature_type").val() === "") {
                $(this).find(".dropdown-toggle").prop("disabled", true);
            }
            $(this).find(".feature_name").attr("readonly", true);
        });

        const cbox_checked_arr = $(".cbox_trigger:checked, .cbox_trigger_nd:checked");
        for (let i = 0; i < cbox_checked_arr.length; i += 1) {
            const trigger = cbox_checked_arr[i].value;
            trigger_list.push(trigger);
        }

        // Remove duplicates on trigger_list
        trigger_list = trigger_list.filter((elem, index, self) => index === self.indexOf(elem));

        trigger_list = removeTriggersFromSameGroup(trigger_list);

        // Mark toExtendND true if X0 (ND-trigger) is checked
        toExtendND = trigger_list.some(trigger => trigger.includes("0"));

        const priority_lookup = {
            S: 5, G: 4, M: 3, R: 2, E: 1, D: 0, r: -1
        };

        function isSmallR ([trigger]) {
            return trigger === "r" ? "r" : trigger.toUpperCase();
        }

        trigger_list.sort((a, b) => {
            const x = priority_lookup[isSmallR(a)];
            const y = priority_lookup[isSmallR(b)];
            if (x > y) return -1; return 1;
        });

        const public_alert_level = $(".cbox_nd[value=ND]").is(":checked") ? "ND" : $("#public_alert_level").val();
        const internal_alert_level = public_alert_level === "A0" ? public_alert_level : `${public_alert_level}-${trigger_list.join("")}`;
        $("#internal_alert_level").val(internal_alert_level);

        // Trigger Rx if it is checked and does not have Rx/rx on internal alert
        if ($(".cbox_trigger_rx").is(":checked")) {
            $(".cbox_trigger_rx").trigger("change");
        }
    });
}

/*******************************************
 *
 *     Prioritizes X0/x0 over X over x
 *
*******************************************/
function removeTriggersFromSameGroup (triggers) {
    const x0_list = triggers.filter(trigger => trigger.includes("0"));
    const capital_list = triggers.filter(trigger => /^[SMG]$/.test(trigger));
    
    let trig_list = [...triggers];
    x0_list.forEach(([x0_trigger]) => {
        const z = new RegExp(`${x0_trigger}[^0]?$`, "g");
        trig_list = trig_list.filter(trigger => !z.test(trigger));
        
        const x0_uc = x0_trigger.toUpperCase();
        const index = trig_list.indexOf(x0_uc);
        if (index > -1) {
            trig_list[index] = `${x0_uc}0`;
        }
    });
    
    capital_list.forEach(([capital_trigger]) => {
        const z = new RegExp(`${capital_trigger.toLowerCase()}`, "g");
        trig_list = trig_list.filter(trigger => !z.test(trigger));
    });

    return trig_list;
}

/*******************************************
 *
 *    Disable Cbox_Triggers and timestamp
 *    input if Cbox_Trigger_ND is checked
 *
*******************************************/
function onNoDataClick (nd_trigger) {
    let trigger_letter = nd_trigger.value[0];
    let tech_info = null;
    let double = false;
    const public_alert = $("#public_alert_level").val();

    switch (trigger_letter) {
        case "R": tech_info = "rainfall"; break;
        case "g": tech_info = "surficial"; double = true; break;
        case "s": tech_info = "subsurface"; double = true; break;
        case "m": tech_info = "manifestation"; double = true; break;
        default: break;
    }

    trigger_letter = public_alert === "A3" ? trigger_letter.toUpperCase() : trigger_letter;

    let triggers_div_temp = `.cbox_trigger[value=${trigger_letter}]`;
    if (public_alert === "A3") {
        const copy_letter = trigger_letter === trigger_letter.toUpperCase()
            ? trigger_letter.toLowerCase() : trigger_letter.toUpperCase();
        triggers_div_temp += `, .cbox_trigger[value=${copy_letter}]`;
    }

    const $triggers_div = $(triggers_div_temp);
    if (nd_trigger.checked) {
        $triggers_div.prop("checked", false).prop("disabled", true);

        let $tech_info_div = null;
        if (double) $tech_info_div = $(`#trigger_${tech_info}_1_info, #trigger_${tech_info}_2_info`);
        else $tech_info_div = $(`#trigger_${tech_info}_info`);
        $tech_info_div.prop("disabled", true).val("");
    } else if (public_alert === "A1" && trigger_letter === "m") {
        $triggers_div.prop("disabled", true);
    } else {
        $triggers_div.prop("disabled", false);
    }

    // Enable/Disable Rainfall Intermediate Threshold option (rx)
    // if R0 is checked
    if (trigger_letter === "R") {
        if (nd_trigger.checked) $(".cbox_trigger_rx").prop("checked", false).prop("disabled", true);
        else $(".cbox_trigger_rx").prop("disabled", false);
    }
}

/*******************************************
 *
 *  Procedures on Rain Rx checkbox click
 *
*******************************************/
function onRxButtonClick () {
    $(".cbox_trigger_rx").change(({ target }) => {
        let rx_internal = "";
        const internal = $("#internal_alert_level").val();
        const r_trigger_selector = ".cbox_trigger[value=R]";
        const r0_selector = ".cbox_trigger_nd[value=R0]";
        const $r_trigger_input = $(r_trigger_selector);
        const $r0_input = $(r0_selector);

        if ($(target).is(":checked")) {
            $r0_input.prop("checked", false).prop("disabled", true);
            $r_trigger_input.prop("checked", false).prop("disabled", true);
            $r_trigger_input.parent().next().children("input")
            .prop("disabled", true)
            .val("");
            $("#trigger_rainfall_info").prop("disabled", true).val("");
            rx_internal = internal.indexOf("R") > -1 ? internal.replace(/R/g, "Rx") : `${internal}rx`;
        } else {
            $(`${r_trigger_selector}, ${r0_selector}`).prop("checked", false).prop("disabled", false);
            rx_internal = internal.replace(/Rx/g, "R").replace(/rx/g, "");
        }

        $("#internal_alert_level").val(rx_internal);
    });
}

/*******************************************
 *
 *    Manifestation Related Functions
 *
*******************************************/
function initializeManifestationRelatedDOM () {
    $("#add_feature, #add_nt_feature").click(function () {
        let base_id = null;
        let field;
        let group_id;
        let rule;
        console.log(this.id);

        if (this.id === "add_feature") {
            base_id = "#base"; field = "#features_field";
            group_id = "#feature_";
            rule = {
                depends () {
                    return $(".cbox_trigger[value='m']").is(":checked") || $(".cbox_trigger[value='M']").is(":checked");
                }
            };
        } else {
            base_id = "#nt_base"; field = "#nt_features_field";
            group_id = "#nt_feature_"; rule = true;
        }

        const base = $(base_id).clone()
        .data("value", m_features_num)
        .prop("id", group_id.slice(1) + m_features_num)
        .prepend("<hr/><button type=\"button\" class=\"close\"><span class=\"glyphicon glyphicon-trash\"></span></button>");

        $(field).append(base);
        initializeTimestamps();
        $(".dropdown-toggle").dropdown();

        const id = group_id + m_features_num;
        console.log(id);

        let name;
        $(`${id} input, ${id} select, ${id} textarea`).each(function () {
            name = $(this).prop("name");
            $(this).addClass(id.slice(1))
            .prop("name", `${name}_${m_features_num}`).val("");

            $(this).rules("add", { required: rule });
        });

        $(id).find(".has-success, .has-error").removeClass("has-success has-error")
        .find("span.glyphicon-ok, span.glyphicon-remove, label.error")
        .remove();
        $(id).find(".feature_name").attr("readonly", true);
        $(id).find(".dropdown-toggle").prop("disabled", true);

        m_features_num += 1;
    });

    $(document).on("click", "#features_field .close, #nt_features_field .close", function () {
        $(this).parent().remove();
    });

    $(document).on("change", ".feature_type", function () {
        const feature_type = this.value;
        const field_id = `#${$(this).parents(".feature_group").prop("id")}`;
        const name_list = `${field_id} .feature_name_list`;
        $(`${field_id} .feature_name`).val("");

        $(`${name_list} li:not([data-value='new'])`).remove();
        if (feature_type !== "" && feature_type !== "none") {
            const site_id = $("subsurface").val();
            $.get(`/../../pubrelease/getFeatureNames/${site_id}/${feature_type}`, (data) => {
                $(name_list).siblings("button").prop("disabled", false);
                data.forEach(({ feature_name, feature_id }) => {
                    const option = $(`${name_list} li[data-value='new']`).clone()
                    .attr("data-value", feature_name)
                    .data("feature-id", feature_id);
                    const link = $(option).html();
                    const new_link = $(link).text(feature_name);
                    const a = $(option).html(new_link);
                    $(name_list).prepend(a);
                });
            }, "json");
            $(`${field_id} .feature_narrative, ${field_id} .feature_remarks, ${field_id} .reporter`).prop("disabled", false);
        } else {
            $(name_list).siblings("button").prop("disabled", true);
            $(`${field_id} .feature_narrative, ${field_id} .feature_remarks, ${field_id} .reporter`).prop("disabled", true);
            if (feature_type === "none") $(`${field_id} .reporter`).prop("disabled", false);
        }
    });

    $(document).on("click", ".feature_name_list li", function () {
        const value = $(this).data("value");
        const id = $(this).data("feature-id");
        const feature_name = $(this).parents(".input-group-btn").siblings(".feature_name");
        if (value === "new") feature_name.prop("readonly", false).val("").data("feature-id", 0);
        else feature_name.val(value).data("feature-id", id);
    });

    $("#nt_feature_cbox").change(function () {
        if (this.checked) {
            $("#nt_features_div").slideDown();
            if ($("#manifestation_validator").prop("disabled") === true) $("#manifestation_validator").prop({ disabled: false }).val("");
            $("#nt_features_field input:not([type='checkbox']), #nt_features_field select, #nt_features_field textarea").prop("disabled", false);

            if ($(".cbox_trigger_nd[value=m0]").is(":checked")) $(".cbox_trigger_nd[value=m0]").trigger("click");
            $(".cbox_trigger_nd[value=m0]").prop({ disabled: true });
        } else {
            $("#nt_features_div").slideUp();
            if ($(".cbox_trigger[value=m]:checked, .cbox_trigger[value=M]:checked").length === 0) $("#manifestation_validator").prop({ disabled: true }).val("");

            let trig_list = [];
            trig_list = [...saved_triggers];
            const occurence = trig_list.map(x => x.toUpperCase() === "M");

            if (occurence.indexOf(true) > -1) {
                if ($(".cbox_trigger[value=m]:checked, .cbox_trigger[value=M]:checked").length === 0) {
                    $(".cbox_trigger_nd[value=m0]").prop({ disabled: false });
                }
            }
        }
    });
}

function initializeHeightenedFeaturesTable (heightened_feat) {
    return $("#heightened-features-table").DataTable({
        columnDefs: [
            { className: "text-right", targets: [1, 4] },
            { className: "text-left", targets: [2, 3] },
            { className: "text-center", targets: [0] },
            {
                sortable: false,
                targets: [2, 3]
            }
        ],
        data: heightened_feat,
        columns: [
            {
                data: "manifestation_id",
                render (data, type, full, meta) {
                    return `<a style='color:blue' href='/../monitoring/events/${full.event_id}/${full.release_id}' target='_blank'>${data}</a>`;
                }
            },
            {
                data: "ts_observance",
                render (data, type, full, meta) {
                    if (data == null) return "-";
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            {
                data: "feature_type",
                render (data, type, full, meta) {
                    if (data == null) return "-";
                    return data[0].toUpperCase() + data.slice(1);
                }
            },
            {
                data: "feature_name",
                render (data, type, full, meta) {
                    if (data == null) return "-";
                    return data;
                }
            },
            {
                data: "op_trigger",
                render (data, type, full, meta) {
                    if (data == null) return "-";
                    return data;
                }
            }
        ],
        paginate: false,
        info: false,
        searching: false,
        order: [[1, "desc"]],
        rowCallback (row, data, index) {
            if (data.op_trigger > 0) {
                $(row).css("background-color", "rgba(255,0,0,0.5)");
            }
        }
    });
}

function reloadTable (table, data) {
    table.clear();
    table.rows.add(data);
    table.draw();
}

function showHeightenedManifestationFeatures (heightened_feat) {
    $("#heightened-features-div").show();
    if (heightened_features_table == null) {
        heightened_features_table = initializeHeightenedFeaturesTable(heightened_feat);
    } else reloadTable(heightened_features_table, heightened_feat);
}

/*******************************************
 *
 *  Control details on Sites Area (Routine)
 *
********************************************/
function routineAreaFunctions () {
    // Outside array pertains to season group [season 1, season 2]
    // Inside arrays contains months (0 - January, 11 - December)
    const wet = [[0, 1, 5, 6, 7, 8, 9, 10, 11], [4, 5, 6, 7, 8, 9]];
    const dry = [[2, 3, 4], [0, 1, 2, 3, 10, 11]];

    $("#sites_area .panel-heading button#all").click(() => {
        $("#sites_area input[type=checkbox]:enabled").trigger("click");
    });

    $("#sites_area .panel-heading button#wet").click(() => {
        const month = moment($("#timestamp_entry").val()).get("month");
        [1, 2].forEach((i) => {
            if (wet[i - 1].indexOf(month) > -1) $(`#sites_area input[type=checkbox][season=${i}]:enabled`).trigger("click");
        });
    });

    $("#sites_area .panel-heading button#dry").click(() => {
        const month = moment($("#timestamp_entry").val()).get("month");
        [1, 2].forEach((i) => {
            if (dry[i - 1].indexOf(month) > -1) $(`#sites_area input[type=checkbox][season=${i}]:enabled`).trigger("click");
        });
    });
}

/*******************************************
 *
 *   Disable Sites on Routine Selection
 *   When routine release already made
 *
*******************************************/
function getFinishedReleasedRoutineSites () {
    const timestamp = $("#timestamp_entry").val();
    if ($("#timestamp_entry").val() !== "") {
        $.get(
            "../pubrelease/getSentRoutine", { timestamp },
            (data) => {
                if (data.length === 0) $("input.routine-checkboxes:checked").prop("disabled", false).prop("checked", false);
                else data.forEach((a) => { $(`input.routine-checkboxes[value=${a.site_id}]`).prop("checked", true).prop("disabled", true); });
            }, "json"
        )
        .done(() => {
            $("#sites_area .panel-body").slideDown();
        });
    } else $("#sites_area .panel-body").slideUp();
}

/*******************************************
 *
 *       Initialize Form Validation
 *
********************************************/
function initializeFormValidator () {
    jQuery.validator.addMethod("TimestampTest", (value, element) => {
        const x = $("#timestamp_initial_trigger").val();
        if (value === "") return true;
        else if (validity_global != null) {
            if (moment(value).isAfter(x) && moment(value).isBefore(validity_global)) return true;
            return false;
        }
        return (moment(value).isAfter(x));
    }, "Timestamp is either before the initial trigger timestamp or after the validity of alert.");

    jQuery.validator.addMethod("TimestampTest2", (value, element) => {
        if (retriggerList === null || value === "") return true;

        if (moment(retriggerList[retriggerList.length - 1]).isBefore(value, "hour")) return true;
        return false;
    }, "Timestamp should be more recent than the last re-trigger timestamp.");

    let msg = null;
    function dynamicMsg () { return msg; }

    const checkInputIfChecked = {
        switch (trigger) { return $(`.cbox_trigger_switch[value=${trigger}]`).is(":checked"); },
        trigger (trigger) { return $(`.cbox_trigger[value=${trigger}]`).is(":checked"); }
    };

    jQuery.validator.addMethod("requiredTrigger", (value, element, param) => {
        const alert = $("#public_alert_level").val();
        const checker = checkInputIfChecked.switch;
        switch (alert) {
            case "A1":
                msg = "At least one trigger (Rainfall, Earthquake, or On-Demand) required.";
                return (checker("rs") || checker("es") || checker("ds"));
            case "A2": // fall through
            case "A3":
                msg = "At least Surficial, Subsurface, and/or Manifestation trigger required.";
                return (checker("ss") || checker("gs") || checker("ms"));
            default: return true;
        }
    }, dynamicMsg);

    $.validator.addClassRules({
        cbox_trigger_switch: {
            requiredTrigger: true
        }
    });

    // Upon checking of trigger switch, this validation will check
    // if the corresponding trigger input is checked upon new trigger input
    jQuery.validator.addMethod("isNewTrigger", (value, element, param) => {
        const val = $(element).val();
        const triggers = $("#internal_alert_level").val().substr(3); // Trigger/s currently present on internal alert
        const A2_triggers = ["g", "s", "m"];
        const A3_triggers = ["G", "S", "M"];
        const checker = checkInputIfChecked.trigger;
        msg = "New trigger timestamp required.";

        if ($("#public_alert_level").val() === "A3" && [...A2_triggers, ...A3_triggers].some(x => x === val)) {
            msg = "L3 trigger timestamp required.";

            const val_upper = val.toUpperCase();
            const val_lower = val.toLowerCase();

            if (triggers.indexOf(val_upper) > -1 || triggers.indexOf(val_lower) > -1) {
                return true;
            } else if (val === "G" || val === "S" || val === "M") {
                return checker("G") || checker("S") || checker("M");
            } else if (val === "g" && !checker("G") && val === "s" && !checker("S") && val === "m" && !checker("M")) {
                msg = "At least L2 or L3 timestamp required.";
                return checker("g") || checker("s") || checker("m");
            }

            return true;
        }

        if (triggers.indexOf(val) > -1) return true;
        else if (!($(`.cbox_trigger[value=${val}]`).is(":checked"))) return false;
        return true;
    }, dynamicMsg);

    $.validator.addClassRules({
        cbox_trigger: {
            isNewTrigger: true
        }
    });

    jQuery.validator.addMethod("hasTriggerTime", (value, element, param) => $(element).val() !== "", "New trigger timestamp required.");

    $.validator.addClassRules({
        trigger_time: {
            hasTriggerTime: true
        }
    });

    jQuery.validator.addMethod("hasTriggerInfo", (value, element, param) => $(element).val() !== "", "Basic technical information of the trigger required.");

    $.validator.addClassRules({
        trigger_info: {
            hasTriggerInfo: true
        }
    });

    jQuery.validator.addMethod("isEndOfValidity", (value, element, param) => {
        reposition("#nd_modal");
        reposition("#non_trig_modal");
        const ts_entry = $("#timestamp_entry").val();
        const public_alert = $("#public_alert_level").val();
        let flag = false; let non_trig_modal = false;

        if (moment(validity_global).isSame(moment(ts_entry).add(30, "minutes"))) {
            if (public_alert === "A0") {
                const ht = heightened_features.length;
                if (ht > 0) {
                    if ($("#nt_feature_cbox").is(":checked") && $("#nt_features_field > .feature_group").length >= ht) flag = true;
                    else {
                        flag = false;
                        non_trig_modal = true;
                    }
                } else flag = true;
            } else if ($(".cbox_trigger_rx").is(":checked")) flag = true;
            else if (public_alert === "A1") {
                if ($(".cbox_trigger_nd").is(":checked")) flag = true;
                else if ($(".cbox_nd").is(":checked") || $(element).is(":checked") || $(".cbox_trigger").is(":checked")) flag = true;
                else flag = false;
            } else if (public_alert === "A2" || public_alert === "A3") {
                if ($(".cbox_trigger_nd").is(":checked")) flag = true;
                else if ($(".cbox_trigger").is(":checked")) flag = true;
                else flag = false;
            } else flag = false;
        } else flag = true;

        if (flag === false) {
            if (non_trig_modal) $("#non_trig_modal").modal("show");
            else $("#nd_modal").modal("show");
            return false;
        }
        return true;
    }, "");

    $.validator.addClassRules({
        cbox_nd: { isEndOfValidity: true },
        cbox_trigger_nd: { isEndOfValidity: true },
        cbox_trigger_rx: { isEndOfValidity: true },
        nt_feature: { isEndOfValidity: true }
    });

    const manifestation_required = {
        depends () {
            return $(".cbox_trigger[value='m']").is(":checked") || $(".cbox_trigger[value='M']").is(":checked");
        }
    };

    const eq_rules = {
        required: {
            depends () {
                return $(".cbox_trigger[value='E']").is(":checked");
            }
        },
        step: false
    };

    jQuery.validator.addMethod("isNTCboxChecked", (value, element) => {
        if ($(".cbox_trigger[value='m']").is(":checked") || $(".cbox_trigger[value='M']").is(":checked")) return $(element).val() !== "";
        return true;
    }, "This field is required.");

    jQuery.validator.addMethod("featureTypeTest", (value, element, param) => {
        const field_id = `#${$(element).parents(".feature_group").prop("id")}`;
        if ($(`${field_id} .feature_type`).val() === "none") return true;
        return value !== "";
    }, "This field is required.");

    $.validator.addClassRules({
        feature_name: {
            featureTypeTest: true
        },
        feature_narrative: {
            featureTypeTest: true
        },
        feature_remarks: {
            featureTypeTest: true
        }
    });

    $("#publicReleaseForm").validate({
        debug: true,
        rules: {
            public_alert_level: "required",
            timestamp_entry: "required",
            release_time: "required",
            site_id: "required",
            reporter_2: "required",
            comments: {
                required: {
                    depends () {
                        return this_event_status === "invalid";
                    }
                }
            },
            "routine_sites[]": {
                required: {
                    depends () {
                        return this_event_status === "routine";
                    }
                }
            },
            magnitude: eq_rules,
            latitude: eq_rules,
            longitude: eq_rules,
            manifestation_validator: { isNTCboxChecked: true },
            feature_type: { required: manifestation_required },
            feature_name: { required: manifestation_required },
            observance_timestamp: { required: manifestation_required },
            feature_reporter: { required: manifestation_required },
            feature_narrative: { required: manifestation_required },
            feature_remarks: { required: manifestation_required },
            nt_feature_type: { required: true },
            nt_observance_timestamp: { required: true },
            nt_feature_reporter: { required: true }
        },
        messages: {
            comments: "Provide a reason to invalidate this event. If the event is not invalid and is really an end of event EWI, release it on the indicated end of validity."
        },
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
                if (!$(element).hasClass("cbox_trigger") && !$(element).hasClass("cbox_trigger_switch") && !$(element).hasClass("cbox_nd") &&
                    !$(element).hasClass("cbox_trigger_nd") && $(element).attr("name") !== "routine_sites[]") { $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>").insertAfter(element); }
                if (element.parent().is(".datetime") || element.parent().is(".datetime")) $next_span.css("right", "15px");
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
                if (element.attr("id") === "reason") $next_span.css({ top: "0", right: "0" });
                if (element.hasClass("reporter")) $next_span.css({ top: "25px", right: "5px" });
                if (element.hasClass("feature_name")) $next_span.css({ top: "0", right: "34px" });
                if (element.is("input[type=number]")) $next_span.css({ top: "24px", right: "0px" });
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
            const data = $("#publicReleaseForm").serializeArray();
            const temp = {};
            data.forEach((value) => { temp[value.name] = value.value === "" ? null : value.value; });
            temp.status = this_event_status;
            temp.reporter_1 = $("#reporter_1").attr("reporter_id");
            temp.trigger_list = $(".cbox_trigger:checked").map(function () { return this.value; }).get();
            temp.trigger_list = temp.trigger_list.length === 0 ? null : temp.trigger_list;

            const trig_list = temp.trigger_list;
            if (trig_list != null) {
                if (trig_list.indexOf("m") > -1 || trig_list.indexOf("M") > -1) {
                    temp.feature_groups = [];
                    let trig_manifestation = null;
                    $("#features_field .feature_group").each(function () {
                        const ob_ts = $(this).find(".observance_timestamp").val();
                        if (trig_manifestation == null) trig_manifestation = ob_ts;
                        else if (moment(ob_ts).isAfter(trig_manifestation)) {
                            trig_manifestation = ob_ts;
                        }
                        temp.feature_groups.push(this.id);
                    });
                    temp.trigger_manifestation = trig_manifestation;
                }
            }

            if ($("#nt_feature_cbox").is(":checked")) {
                temp.nt_feature_groups = [];
                $("#nt_features_field .feature_group").each(function () {
                    temp.nt_feature_groups.push(this.id);
                });
            }

            if (this_event_status === "new") {
                if (temp.public_alert_level === "A0") {
                    temp.routine_list = [{
                        site_id: temp.site,
                        internal_alert_level: temp.internal_alert_level
                    }];
                    temp.status = "routine";
                }
            } else if (this_event_status === "on-going") {
                temp.current_event_id = current_event.event_id;

                // If A0, check if legit lowered or invalid
                if (temp.public_alert_level === "A0") {
                    if (moment(current_event.validity).isSameOrBefore(moment(temp.timestamp_entry).add(30, "minutes"))) {
                        temp.status = "extended";
                        $.post("../issues_and_reminders/archiveIssuesFromLoweredEvents", { event_id: temp.current_event_id })
                        .done((has_updated) => {
                            if (has_updated === "true") { doSend("getNormalAndLockedIssues"); }
                        });
                    } else { temp.status = "invalid"; }

                // Check if needed for 4-hour extension if ND
                } else if (temp.trigger_list == null && moment(current_event.validity).isSame(moment(temp.timestamp_entry).add(30, "minutes"))) {
                    if (toExtendND) temp.extend_ND = true;
                    else if (typeof temp.cbox_trigger_rx !== "undefined") temp.extend_rain_x = true;
                }
            } else if (this_event_status === "invalid") {
                temp.current_event_id = current_event.event_id;
            } else if (this_event_status === "routine") {
                temp.routine_list = [];
                $("input[name='routine_sites[]']:checked").each((i, elem) => {
                    if ($(elem).is(":disabled")) {
                        const obj = {
                            site_id: elem.value,
                            internal_alert_level: temp.internal_alert_level
                        };
                        temp.routine_list.push(obj);
                    }
                });
            } else if (this_event_status === "extended") {
                // Status is either "extended" or "finished"
                if (temp.public_alert_level === "A0") {
                    temp.current_event_id = current_event.event_id;
                    temp.status = "extended";

                // Alert heightened so status is "new" and change current event to "finished"
                } else {
                    temp.status = "new";
                    temp.previous_event_id = current_event.event_id;
                }
            }

            console.log(temp);

            $("#loading .progress-bar").text("Submitting early warning releases... Please wait.");
            reposition("#loading");
            $("#loading").modal("show");

            $.ajax({
                url: "../pubrelease/insert",
                type: "POST",
                data: temp,
                success (result, textStatus, jqXHR) {
                    $("#loading").modal("hide");
                    $("#loading .progress-bar").text("Loading...");
                    console.log(result);
                    setTimeout(() => {
                        if (result === "Routine") { $("#view").attr("href", "../monitoring/events").text("View All Releases"); } else $("#view").attr("href", `../monitoring/events/${result}`).text("View Recent Release");
                        reposition("#view_modal");
                        $("#view_modal").modal("show");
                    }, 1000);

                    // Send to websocket to refresh all dashboards
                    doSend("updateDashboardTables");
                },
                error (xhr, status, error) {
                    const err = xhr.responseText;
                    alert(err);
                }
            });
        }
    });
}
