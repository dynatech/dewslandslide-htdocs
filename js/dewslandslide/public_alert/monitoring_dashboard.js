
/****
 * Created by Kevin Dhale dela Cruz
 * JS file for Monitoring Dashboard
 * [host]/home or [host]/dashboard
****/

let ongoing = [];
let latest_table = null;
let extended_table = null;
let overdue_table = null;
let candidate_table = null;
let modal_form = null;
let entry = {};
let current_row = {};
const sites_list = [];
let merged_arr = [];

const lookup = {
    r1: ["rainfall", "rainfall", "R"],
    r2: ["rainfall", "rainfall", "R"],
    l2: ["surficial", "surficial_1", "g"],
    l3: ["surficial", "surficial_2", "G"],
    L2: ["subsurface", "subsurface_1", "s"],
    L3: ["subsurface", "subsurface_2", "S"],
    d1: ["od", "od", "D"],
    e1: ["eq", "eq", "E"]
};

$(document).ready(() => {
    getSites();
    initializeCandidateTriggersIconOnClick();
    initializeTriggerSwitchOnClick();
    initializeReleaseModalForm();
    initializeMailIconOnClick();
    initializeSendBulletin();

    reposition("#bulletinLoadingModal");
    reposition("#resultModal");
    reposition("#release-modal");

    setInterval(() => { $("#release_time").val(moment().format("HH:mm:00")); }, 1000);
});

/** ******** END OF DASHBOARD EWI WEB RELEASE MECHANISM **********/

function getSites () {
    $.getJSON("../monitoring/getSites", (sites) => {
        sites.forEach((x) => { sites_list[x.site_code] = x.site_id; });
    });
}

function buildDashboardTables (socket_data) {
    if (socket_data.code === "existingAlerts") {
        ongoing = { ...socket_data.alerts };
    }

    const tables = {
        latest: latest_table,
        extended: extended_table,
        overdue: overdue_table,
        candidate: candidate_table
    };

    let { alerts } = socket_data;

    if (alerts == null) {
        console.log("=== ERROR PROCESSING ALERTS! ===");
        console.log(socket_data.error);
        alerts = { candidate: null };
    }

    Object.keys(alerts).forEach((key) => {
        if (tables[key] === null) {
            switch (key) {
                case "latest":
                    latest_table = buildLatestAndOverdue(key, alerts[key]);
                    alerts[key].forEach((x) => {
                        checkIfAlreadySent(x.latest_release_id, x.event_id, x.data_timestamp);
                    });
                    break;
                case "extended":
                    extended_table = buildExtendedTable(alerts[key]);
                    break;
                case "overdue":
                    overdue_table = buildLatestAndOverdue(key, alerts[key]);
                    overdue_table.column(6).visible(false);
                    break;
                case "candidate":
                    candidate_table = buildCandidateTable(alerts[key]);
                    break;
                default: break;
            }
        } else {
            console.log("Table reloaded:", key);
            reloadTable(tables[key], alerts[key], key);
        }

        tableCSSifEmpty(key, alerts[key]);
    });

    function buildLatestAndOverdue (table, table_data) {
        return $(`#${table}`).DataTable({
            data: table_data,
            columnDefs: [
                { className: "text-left", targets: [0, 3] },
                { className: "text-right", targets: [1, 2, 4, 5] },
                { className: "text-center", targets: [6] }
            ],
            columns: [
                {
                    data: "site_code",
                    render (data, type, full) {
                        return `<b><a href='../monitoring/events/${full.event_id}'>${data.toUpperCase()}</a></b>`;
                    },
                    name: "site_code"
                },
                {
                    data: "event_start",
                    render (data, type, full) { return moment(data).format("DD MMMM YYYY HH:mm"); },
                    name: "event_start"
                },
                {
                    data: "trigger_timestamp",
                    render (data, type, full) { return moment(data).format("DD MMMM YYYY HH:mm"); },
                    name: "trigger_timestamp"
                },
                {
                    data: "internal_alert_level",
                    render (data, type, full) { return data; },
                    name: "internal_alert_level"
                },
                {
                    data: "validity",
                    render (data, type, full) { return moment(data).format("DD MMMM YYYY HH:mm"); },
                    name: "validity"
                },
                {
                    data: "release_time",
                    render (data, type, full) {
                        const { internal_alert_level } = full;
                        if (internal_alert_level === "A0" || internal_alert_level === "ND") return "FINISHED";
                        return data;
                    },
                    name: "release_time"
                },
                {
                    render (data, type, full) {
                        return `<a><span class='glyphicon glyphicon-phone send_ewi_sms' id='${full.latest_release_id}_sms' data-sent='0' data-event-id='${full.event_id}_sms' ></span></a>&ensp;&ensp;<a><span class='glyphicon glyphicon-envelope' id='${full.latest_release_id}' data-sent='0' data-event-id='${full.event_id}'></span></a>`;
                    }
                }
            ],
            order: [[4, "asc"]],
            processing: true,
            filter: false,
            info: false,
            paginate: false,
            autoWidth: false,
            language: {
                emptyTable: "There are no sites under monitoring at the moment."
            },
            rowCallback (row, data, index) {
                const { internal_alert_level } = data;
                let temp = internal_alert_level.slice(0, 2);
                if (temp === "ND") { temp = (internal_alert_level.length > 2) ? "A1" : "A0"; }
                $(row).addClass(`alert-${temp.charAt(1)}`);
            },
            initComplete () {
                let row_count = 0;
                this.api().rows().every((rowIdx, tableLoop, rowLoop) => {
                    const { internal_alert_level } = this.data();
                    if (internal_alert_level !== "A0" && internal_alert_level !== "ND") {
                        row_count += 1;
                    }
                });

                $(`#${table}-panel .row-count`).text(`Row count: ${row_count}`);
            }
        });
    }

    function buildExtendedTable (table_data) {
        return $("#extended").DataTable({
            data: table_data,
            columnDefs: [
                { className: "text-left", targets: [0] },
                { className: "text-right", targets: [1, 2, 3] },
                { className: "text-center", targets: [4] }
            ],
            columns: [
                {
                    data: "site_code",
                    render (data, type, full) { return `<b><a href='../monitoring/events/${full.event_id}'>${data.toUpperCase()}</a></b>`; },
                    name: "site_code"
                },
                {
                    data: "validity",
                    render (data, type, full) { return moment(data).format("DD MMMM YYYY HH:mm"); },
                    name: "validity"
                },
                {
                    data: "start",
                    render (data, type, full) { return moment.unix(data).format("DD MMMM YYYY HH:mm"); },
                    name: "start"
                },
                {
                    data: "end",
                    render (data, type, full) { return moment.unix(data).format("DD MMMM YYYY HH:mm"); },
                    name: "end"
                },
                {
                    render (data, type, full) {
                        return `<a><span class='glyphicon glyphicon-phone send_ewi_extended_sms'></span></a>&ensp;&ensp;<a><span class='glyphicon glyphicon-envelope' id='${full.latest_release_id}' data-sent='0' data-event-id='${full.event_id}'></span></a>`;
                    }
                }
            ],
            order: [[3, "asc"]],
            processing: true,
            filter: false,
            info: true,
            infoCallback (settings, start, end, max, total, pre) {
                $("#extended-panel .row-count").text(`Row count: ${end}`);
            },
            paginate: false,
            autoWidth: false,
            language: {
                emptyTable: "There are no sites under 3-day extended monitoring."
            },
            rowCallback (row, data, index) {
                switch (data.day) {
                    case 0: break;
                    case 1: $(row).addClass("day-one"); break;
                    case 2: $(row).addClass("day-two"); break;
                    case 3: $(row).addClass("day-three"); break;
                    default: if (data.day !== 0) $(row).addClass("day-overdue"); break;
                }
            }
        });
    }

    function buildCandidateTable (table_data) {
        return $("#candidate").DataTable({
            data: table_data,
            columnDefs: [
                { className: "text-left", targets: [0, 3] },
                { className: "text-right", targets: [1, 2, 4] },
                { className: "text-center", targets: [5] }
            ],
            columns: [
                {
                    data: "site_code",
                    render (data, type, full) { return `<b>${data.toUpperCase()}</b>`; },
                    name: "site_code"
                },
                {
                    data: "data_timestamp",
                    render (data, type, full) {
                        const { ts } = full;
                        if (ts == null) return "No new triggers";
                        return moment(ts).format("DD MMMM YYYY HH:mm");
                    },
                    name: "data_timestamp"
                },
                {
                    data: "latest_trigger_timestamp",
                    render (data, type, full) {
                        if (data === "end") return "No new triggers";
                        else if (data === "manual" || data === "extended" || data === "routine") return "---";
                        return moment(data).format("DD MMMM YYYY HH:mm");
                    },
                    name: "latest_trigger_timestamp"
                },
                {
                    data: "trigger",
                    render (data, type, full) {
                        if (data === "No new triggers") return data;
                        else if (data === "manual" || data === "extended" || data === "routine") return "---";
                        return data.toUpperCase();
                    },
                    name: "trigger"
                },
                {
                    data: "validity",
                    render (data, type, full) {
                        if (data === "end") return "END OF VALIDITY";
                        else if (data === "manual") return "---";
                        else if (data === "extended") return "EXTENDED RELEASE";
                        else if (data === "routine") return "ROUTINE RELEASE";
                        return moment(data).format("DD MMMM YYYY HH:mm");
                    },
                    name: "validity"
                },
                {
                    render (data, type, full) {
                        if (typeof full.isManual !== "undefined") return "<a><span class='glyphicon glyphicon-info-sign' title='Info'></span></a>";
                        return "<a><span class='glyphicon glyphicon-ok' title='Approve'></span></a>&ensp;<a><span class='glyphicon glyphicon-remove' title='Dismiss'></span></a>";
                    }
                }
            ],
            order: [[3, "asc"]],
            processing: true,
            filter: false,
            info: true,
            infoCallback (settings, start, end, max, total, pre) {
                $("#candidate-panel .row-count").text(`Row count: ${end}`);
            },
            paginate: false,
            autoWidth: false,
            language: {
                emptyTable: "There are no current candidate triggers."
            },
            rowCallback (row, data, index) {
                let color = "255,255,255,255";
                switch (data.status) {
                    case "valid":
                        color = "0,128,0,0.5";
                        break;
                    case "partial":
                        color = "255,165,0,0.5";
                        break;
                    case "invalid":
                        color = "255,0,0,0.5";
                        break;
                    default: break;
                }
                $(row).attr("style", `background-color: rgba(${color})`);
            }
        });
    }

    $("#loading").modal("hide");
}

function tableCSSifEmpty (table, data) {
    if ($(`#${table}`).dataTable().fnSettings().aoData.length === 0) {
        if (table === "candidate" && data == null) {
            reposition("#errorProcessingModal");
            $("#errorProcessingModal").modal("show");
        }

        $(`#${table} .dataTables_empty`).css({ "font-size": "20px", padding: "30px 15px 10px 15px", width: "600px" });
    }
}

function reloadTable (table, data, tbl_name) {
    table.clear();
    table.rows.add(data).draw();

    ["latest", "extended", "overdue", "candidate"].forEach((tbl) => { tableCSSifEmpty(tbl, data); });
    if (tbl_name === "latest") {
        data.forEach((x) => {
            checkIfAlreadySent(x.latest_release_id, x.event_id, x.data_timestamp);
        });
    }
}

function initializeCandidateTriggersIconOnClick () {
    $("#candidate tbody").on("click", "tr .glyphicon-ok", ({ currentTarget }) => {
        $("#modalForm .form-group").removeClass("has-feedback").removeClass("has-error").removeClass("has-success");
        $("#modalForm .glyphicon.form-control-feedback").remove();
        modal_form.resetForm();

        entry = {};
        const i = $(currentTarget).parents("tr");
        current_row = candidate_table.row(i).data();
        const { site_code, ts } = current_row;
        $("#timestamp_entry").val(ts);

        if (site_code === "routine") {
            const { routine_list } = current_row;
            const a0_sites = [];
            const nd_sites = [];
            routine_list.forEach((row) => {
                const { internal_alert, site_code: sc } = row;
                const site_uc = sc.toUpperCase();
                if (internal_alert === "A0") a0_sites.push(site_uc);
                else nd_sites.push(site_uc);
            });

            entry = {
                status: "routine",
                routine_list
            };

            $("#alert-0").val(a0_sites.join(", "));
            $("#nd-alert-0").val(nd_sites.join(", "));

            $("#alert-0-count").text(a0_sites.length);
            $("#nd-alert-0-count").text(nd_sites.length);

            $("#routine-release").show();
            $("#regular-release").hide();
            $("#release-modal").modal({ backdrop: "static", keyboard: false, show: true });
        } else {
            $("#routine-release").hide();
            $("#regular-release").show();

            const {
                internal_alert,
                status, rainfall
            } = current_row;
            $("#internal_alert_level").val(internal_alert);
            $("#site_id").val(sites_list[site_code]);
            $("#comments").val("");

            // Search candidate trigger if existing on latest and overdue
            const { latest, overdue, extended } = ongoing;
            merged_arr = [...latest, ...overdue];
            const index = merged_arr.map(x => x.site_code).indexOf(site_code);
            let previous = null;
            let enableReleaseButton = false;

            if (index > -1) {
                previous = merged_arr[index];
                entry.trigger_list = showModalTriggers(current_row, previous.trigger_timestamp);
                entry.previous_validity = previous.validity;

                if (internal_alert === "A0" || internal_alert === "ND") {
                    if (moment(previous.validity).isAfter(moment(ts).add(30, "minutes"))) {
                        entry.status = "invalid";
                    } else entry.status = "extended";
                } else entry.status = "on-going";

                entry.event_id = previous.event_id;
            } else {
                const index_ex = extended.map(x => x.site_code).indexOf(site_code);
                entry.trigger_list = showModalTriggers(current_row, null);
                enableReleaseButton = true;

                if (status === "extended") {
                    entry.status = "extended";
                    entry.event_id = extended[index_ex].event_id;
                } else {
                    // Search if candidate trigger exists on extended
                    if (index_ex > -1) entry.previous_event_id = extended[index_ex].event_id;
                    entry.status = "new";
                }
            }

            // Check data timestamp for regular release (x:30)
            // Disable send button if not else enable button
            const hour = moment(ts).hour();
            const minute = moment(ts).minutes();
            if ((hour % 4 === 3 && minute === 30) || enableReleaseButton) $("#release").prop("disabled", false);
            else $("#release").prop("disabled", true);

            // Insert X on internal alert if Rx is not yet automatic on JSON
            entry.rainfall = rainfall;
            if (rainfall === "rx") {
                let internal = internal_alert;
                if (internal.indexOf("x") === -1) {
                    if (internal.indexOf("R") > -1) internal = internal.replace(/R/g, "Rx");
                    else internal += "rx";
                    $("#internal_alert_level").val(internal);
                }
            }

            showInvalidTriggersOnModal(current_row);

            // Automatically check trigger_switch if invalid area is empty
            $(".trigger_switch").each((count, item) => {
                if ($(`#${item.value}_area .invalid_area`).html() === "") {
                    $(item).prop("checked", true);
                }
            });

            // toggleTriggerOnRelease( row, index );
            $("#release-modal").modal({ backdrop: "static", keyboard: false, show: true });
            // console.log(entry);
        }
    });

    $("#candidate tbody").on("click", "tr .glyphicon-info-sign", (x) => {
        reposition("#manualInputModal");
        $("#manualInputModal").modal("show");
    });
}

function initializeTriggerSwitchOnClick () {
    $(".trigger_switch").click(({ currentTarget }) => {
        toggleTriggerOnRelease(currentTarget.value, current_row);
    });
}

function showModalTriggers (row, latest) {
    const retrigger_list = typeof row.triggers !== "undefined" ? row.triggers : null;
    const qualified_retriggers = [];

    // Get triggers ONLY if they are not yet saved
    // candidate trigger > latest trigger
    if (retrigger_list != null) {
        retrigger_list.forEach((x) => {
            if (moment(x.ts).isAfter(latest) || latest == null) {
                qualified_retriggers.push(x);
            }
        });
    }

    // Disable/Hide all trigger fields on modal form
    ["r1", "e1", "l2", "l3", "L2", "L3", "d1", "e1"].forEach((x) => {
        const y = lookup[x];
        $(`#${y[0]}_area`).hide();
        $(`#trigger_${y[1]}`).val("").prop({ readonly: false, disabled: true });
        $(`#trigger_${y[1]}_info`).val("").prop("disabled", true);
        $(".trigger_switch").prop({ disabled: true, checked: false });
        if (x === "d1") $(".od_group, #reason").prop("disabled", true);
        else if (x === "e1") $("#magnitude, #latitude, #longitude").val("").prop("disabled", true);
    });

    const retrigger_letters_arr = [];

    if (retrigger_list != null) {
        qualified_retriggers.forEach((x) => {
            const op_alert = x.alert;
            const y = lookup[op_alert];
            $(`#${y[0]}_area`).show();
            $(`#trigger_${y[1]}`).val(x.ts).prop({ readonly: true, disabled: false });
            let info = y[2] === "E" ? row.tech_info[`${y[0]}`].info : row.tech_info[`${y[0]}`];

            if (y[0] === "subsurface" || y[0] === "surficial") {
                info = info[op_alert];
            }

            $(`#trigger_${y[1]}_info`).val(info).prop("disabled", false);

            $(`.trigger_switch[value=${y[0]}]`).prop("disabled", false);

            if (y[2] === "D") $(".od_group, #reason").prop("disabled", false);
            else if (y[2] === "E") {
                const { magnitude, longitude, latitude } = row.tech_info[`${y[1]}`];
                $("#magnitude").val(magnitude).prop("disabled", false);
                $("#longitude").val(longitude).prop("disabled", false);
                $("#latitude").val(latitude).prop("disabled", false);
            }
            retrigger_letters_arr.push(y[2]);
        });
    }
    return retrigger_letters_arr;
}

function showInvalidTriggersOnModal (row) {
    $(".invalid_area").empty();
    const { invalid_list } = row;

    if (typeof invalid_list !== "undefined") {
        $.each(invalid_list, (count, trigger) => {
            let template = $("#invalid_template").html();
            template = $(template).show();
            const {
                trigger_source, ts_last_retrigger,
                iomp, remarks
            } = trigger;

            const x = `#${trigger_source}_area`;
            $(`${x} .invalid_area`).append(template);
            $(`${x} .invalid_area #timestamp`).text(moment(ts_last_retrigger).format("MMM. D, YYYY, H:mm"));
            $(`${x} .invalid_area #staff`).text(iomp);
            const temp = remarks === "" ? "---" : remarks;
            $(`${x} .invalid_area #remarks`).text(temp);
        });
    }
}

function toggleTriggerOnRelease (trigger_type, row) {
    const { invalid_list, status } = row;
    const orig_public_alert = row.internal_alert.slice(0, 2);
    const orig_internal_alert = row.internal_alert.slice(3);

    if (status !== "valid") {
        const alert = $("#internal_alert_level").val();
        let public_alert = alert.slice(0, 2);
        let internal_alert = alert.slice(3);

        if ($(`.trigger_switch[value=${trigger_type}]`).prop("checked")) {
            invalid_list.forEach((trigger) => {
                if (trigger.source === trigger_type) {
                    if (trigger_type === "rain") {
                        if (orig_internal_alert.indexOf("R") === -1) { internal_alert += "R"; }
                    } else {
                        public_alert = trigger.alert;
                        const x = trigger.alert === "A3" ? "S" : "s";
                        if (orig_internal_alert.indexOf(x) === -1) { internal_alert += x; }
                    }
                }
            });
        } else {
            // Remove trigger letter on internal alert level
            invalid_list.forEach((trigger) => {
                if (trigger.source === trigger_type) {
                    if (trigger_type === "rain") {
                        if (orig_internal_alert.indexOf("R") === -1) { internal_alert = internal_alert.replace(/R/g, ""); }
                    } else {
                        const x = trigger.alert === "A3" ? "S" : "s";
                        if (orig_internal_alert.indexOf(x) === -1) { internal_alert = internal_alert.replace(x, ""); }
                        public_alert = orig_public_alert;
                    }
                }
            });
        }

        const alert_list = internal_alert.split(/([A-z]0?)/g);
        const ordered_internal = sortInternalAlertTriggers(alert_list);
        $("#internal_alert_level").val(`${public_alert}-${ordered_internal}`);
    }
}

function sortInternalAlertTriggers (internal) {
    internal.sort((a, b) => {
        const arr = {
            S: 5, s: 5, s0: 5, G: 4, g: 4, g0: 4, R: 3, R0: 3, E: 2, D: 1
        };
        const x = arr[a];
        const y = arr[b];
        if (x > y) return -1; return 1;
    });

    return internal.join("");
}

function initializeReleaseModalForm () {
    $.validator.addMethod("isInvalid", (value, element, param) => {
        if (entry.status === "invalid") {
            if (value !== "") return true;
            return false;
        }
        return true;
    }, "");

    $.validator.addMethod("at_least_one", (value, element, options) => {
        if ($(".od_group[value=llmc]").is(":checked") || $(".od_group[value=lgu]").is(":checked")) { return true; }
        return false;
    }, "Choose at least one of the two groups as requester.");

    $.validator.addClassRules({ od_group: { at_least_one: true } });

    $.validator.addMethod("at_least_one_invalid", (value, element, param) => {
        const alert = $("#internal_alert_level").val();
        const internal_alert = alert.slice(3);

        if (entry.status === "new") {
            if ($(".trigger_switch:checked:enabled").length === 0) return false;
            return true;
        } else if (internal_alert === "") {
            return false;
        }

        $(".trigger_switch").closest(".form-group").children("label.error").remove();
        return true;
    }, "Check the box of invalid trigger to be released.");

    $.validator.addClassRules({ trigger_switch: { at_least_one_invalid: true } });

    modal_form = $("#modalForm").validate({
        debug: true,
        rules: {
            site_code: "required",
            timestamp_entry: "required",
            release_time: "required",
            trigger_rainfall: "required",
            trigger_eq: "required",
            trigger_od: "required",
            trigger_surficial_1: "required",
            trigger_surficial_2: "required",
            trigger_subsurface_1: "required",
            trigger_subsurface_2: "required",
            trigger_rain_info: "required",
            trigger_eq_info: "required",
            trigger_od_info: "required",
            trigger_surficial_1_info: "required",
            trigger_surficial_2_info: "required",
            trigger_subsurface_1_info: "required",
            trigger_subsurface_2_info: "required",
            reporter_2: "required",
            comments: {
                isInvalid: true
            },
            magnitude: {
                required: true,
                step: false
            },
            latitude: {
                required: true,
                step: false
            },
            longitude: {
                required: true,
                step: false
            },
            reason: "required"
        },
        messages: {
            comments: "Provide a reason to invalidate this event. If the event is not invalid and is really an end of event EWI, release it on the indicated end of validity."
        },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");

            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                if (!element.is("[type=checkbox]")) { $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>").insertAfter(element); }
                if (element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if (element.is("input[type=number]")) element.next("span").css({ top: "24px", right: "20px" });
                if (element.is("textarea") || element.is("select")) element.next("span").css({ top: "24px", right: "22px" });
                if (element.attr("id") === "reason") element.next("span").css({ top: "0", right: "0" });
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
            $("#release-modal").modal("hide");

            const data = $("#modalForm").serializeArray();
            let final = { status: entry.status };
            data.forEach(({ name, value }) => {
                final[name] = value === "" ? null : value;
            });
            final.reporter_1 = $("#reporter_1").attr("value-id");

            if (entry.status === "routine") {
                $("#loading .progress-bar").text("Inserting all routine releases...");
                $("#loading").modal("show");
                final.routine_list = entry.routine_list;
            } else {
                const temp = final.internal_alert_level.slice(0, 2);
                final = {
                    ...final,
                    public_alert_level: temp === "ND" ? "A1" : temp
                };

                if (entry.status === "extended") {
                    final.current_event_id = entry.event_id;
                } else {
                    const { trigger_list: list } = entry;
                    final.trigger_list = list.length === 0 ? null : list;
                }

                if (entry.status === "new") {
                    // Attach event_id if site alert raised again from extended
                    if (typeof entry.previous_event_id !== "undefined") {
                        final.previous_event_id = entry.previous_event_id;
                    }
                } else if (entry.status === "on-going") {
                    const { event_id, previous_validity } = entry;

                    final.current_event_id = event_id;
                    const list = final.trigger_list;

                    // Don't include un-checked retriggers for rain and sensor
                    $(".trigger_switch").each((count, item) => {
                        if (!$(item).is(":checked")) {
                            const haystack = list.join("").toUpperCase();
                            const x = item.value === "rainfall" ? "R" : "S";
                            const index = haystack.indexOf(x);
                            
                            // Splice trigger only if it exists
                            if (index !== -1) list.splice(index, 1);
                        }
                    });

                    if (list != null) {
                        if (list.indexOf("D") > -1) {
                            if ($(".od_group[value=llmc]").is(":checked")) final.llmc = "set";
                            if ($(".od_group[value=lgu]").is(":checked")) final.lgu = "set";
                            final.reason = $("#reason").val();
                        } else if (list.indexOf("E") > -1) {
                            final.magnitude = $("#magnitude").val();
                            final.latitude = $("#latitude").val();
                            final.longitude = $("#longitude").val();
                        }
                    }

                    const extend = /ND|[sg]0/gi.test(final.internal_alert_level);
                    if (list == null && moment(previous_validity).isSame(moment(final.timestamp_entry).add(30, "minutes"))) {
                        if (extend) final.extend_ND = "set";
                        if (entry.rainfall === "rx" || final.internal_alert_level.includes("x")) {
                            final.extend_rain_x = "set";
                        }
                    }
                }
            }

            console.log(final);

            insertEventRelease(final);

            if (entry.status === "extended") {
                archiveIssuesFromLoweredEvents(final.current_event_id);
            }
        }
    });
}

function insertEventRelease (data) {
    $.post("../pubrelease/insert", data)
    .done((result, textStatus, jqXHR) => {
        console.log(result);
        doSend("updateDashboardTables");

        const { timestamp_entry } = data;
        const baseline = moment(timestamp_entry).add(30, "minutes");
        const exec_time = moment().diff(baseline);
        const report = {
            type: "timeliness",
            metric_name: "web_ewi_timeliness",
            module_name: "Web EWI Release",
            execution_time: exec_time,
            reference_id: 0,
            reference_table: "public_alert_release"
        };

        PMS.send(report);

        const $modal = $("#resultModal");
        $modal.find(".modal-header").html("<h4>Early Warning Information Release</h4>");
        $modal.find(".modal-body").html("<p><strong>SUCCESS:</strong>&ensp;Early warning information successfully released on site!</p>");
        setTimeout(() => { $modal.modal("show"); }, 300);
    })
    .catch((x) => {
        showErrorModal(x, "inserting release");
        const report = {
            type: "error_logs",
            metric_name: "web_ewi_error_logs",
            module_name: "Web EWI Release",
            report_message: `error inserting release ${x.responseText}`,
            reference_table: "none",
            reference_id: 0
        };

        PMS.send(report);
    })
    .always(() => { $("#loading").modal("hide"); });
}

function archiveIssuesFromLoweredEvents (current_event_id) {
    $.post("../issues_and_reminders/archiveIssuesFromLoweredEvents", { event_id: current_event_id })
    .done((has_updated) => {
        if (has_updated === "true") { doSend("getNormalAndLockedIssues"); }
    })
    .catch((x) => {
        showErrorModal(x, "archiving issues related to lowered alert event");
    });
}

function initializeMailIconOnClick () {
    $("#latest, #extended").on("click", "tbody tr .glyphicon-envelope", ({ currentTarget }) => {
        const release_id = $(currentTarget).prop("id");
        const event_id = $(currentTarget).attr("data-event-id");
        loadBulletin(release_id, event_id);
        $("#bulletin-modal #send").data("release-id", release_id);
    });
}

function initializeSendBulletin () {
    $("#bulletin-modal #send").click(({ currentTarget }) => {
        const release_id = parseInt($(currentTarget).data("release-id"), 10);
        $.when(renderPDF(release_id))
        .then((x) => {
            if (x === "Success.") {
                const recipients = $("#recipients").tagsinput("items");

                let text = $("#info").val().replace(/\n/g, "<br/>");
                const i = text.indexOf("DEWS");
                if (i > 0) { text = `${text.substr(0, i)}<b>${text.substr(i)}</b>`; }
                else text = `<b>${text}</b>`;

                const subject = $("#subject").text();
                const filename = `${$("#filename").text()}.pdf`;
                sendMail(text, subject, filename, recipients, release_id);
            }
        });
    });
}

function checkIfAlreadySent (release_id, event_id, timestamp) {
    const ts = moment(timestamp).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");
    $.getJSON("/../../accomplishment/getNarrativesForShift", {
        event_id,
        start: moment(ts).format("YYYY-MM-DD HH:mm:ss"),
        end: moment(ts).add(4, "hours").format("YYYY-MM-DD HH:mm:ss")
    })
    .done((data) => {
        let hour_min = moment(ts).format("hh:mm A");
        if (/12:\d{2} PM/g.test(hour_min)) hour_min = hour_min.replace("PM", "NN"); else if (/12:\d{2} AM/g.test(hour_min)) hour_min = hour_min.replace("AM", "MN");

        for (let i = 0; i < data.length; i += 1) {
            const { narrative } = data[i];
            if ((narrative.includes("Bulletin") && narrative.includes(hour_min)) || narrative.includes("onset")) {
                $(`#${release_id}`).css("color", "red").attr("data-sent", 1);
            }

            if ((narrative.includes("SMS") && narrative.includes(hour_min)) || narrative.includes("onset")) {
                $(`#${release_id}_sms`).css("color", "red").attr("data-sent", 1);
            }
        }
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
