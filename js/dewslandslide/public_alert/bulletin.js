
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Bulletin Functions
 *  used by [public_alert/monitoring_events_individual.php]
 *  and [public_alert/monitoring_dashboard.php]
 *
****/

let on_edit = null;
let release_id = null;
let event_id = null;
let original_field_values = [];
let bulletin_timestamp = null;
const HOSTNAME = window.location.hostname;
let $LOADING;
let $RESULT_MODAL;

$(document).ready(() => {
    $LOADING = $("#loading");
    $RESULT_MODAL = $("#bulletin-result-modal");
    reposition("#bulletin-result-modal");

    $("#edit-bulletin").click(() => {
        on_edit = on_edit !== true;
        edit(on_edit);
    });
});

function loadBulletin (id1, id2) {
    release_id = id1;
    event_id = id2;

    const bulletin_div = "#bulletin_div";

    $.when(postBulletinModal(release_id), getFirstEventRelease(event_id))
    .done(([modal_html], [release]) => {
        const obj = processBulletinModal(modal_html, bulletin_div);
        const is_onset = addOnsetMessageIfApplicable(release, release_id, obj);

        addMailRecipients(is_onset);

        $("#bulletin-modal").modal({ backdrop: "static", keyboard: false, show: true });
    })
    .catch((x) => {
        sendBulletinError(`error loading bulletin\n${x.responseText}`, release_id);
        showErrorModal(x, "loading bulletin");
    });
}

function postBulletinModal (release_id) {
    return $.post(`/../../bulletin/main/${release_id}/0`);
}

function processBulletinModal (modal_html, bulletin_div) {
    $(bulletin_div).html(modal_html);

    const loc = $("#location").text().replace(/\s+/g, " ").trim();
    const alert = $("#alert_level_released").text().replace(/\s+/g, " ").trim()
    .slice(0, 7);
    const datetime = $("#datetime").text();
    const text = `DEWS-L Bulletin for ${datetime}\n${alert} - ${loc}`;

    $("#info").val(text);

    const temp_ts = datetime.replace("MN", "AM").replace("NN", "PM");
    bulletin_timestamp = moment(temp_ts, "MMMM DD, YYYY, h:mm A");

    const is_bulletin_sent = parseInt($(`#${release_id}`).attr("data-sent"), 10);

    if (is_bulletin_sent === 1) $("#send").removeClass("btn-danger").addClass("btn-primary").text("Sent Already (Send Again)");
    else $("#send").removeClass("btn-primary").addClass("btn-danger").text("Send");

    return { loc, alert, text };
}

function getFirstEventRelease (event_id) {
    return $.getJSON(`/../../monitoring/getFirstEventRelease/${event_id}`);
}

function addOnsetMessageIfApplicable (release, release_id, obj) {
    const [{ release_id: id, release_time: time, data_timestamp: data_ts }] = release;
    const { loc, alert, text } = obj;
    const onset = id === release_id;

    if (onset) {
        console.log("Onset Bulletin Release");

        const basis = [];
        release.forEach(({ timestamp: trigger_ts, cause }) => {
            const x = `${cause} at ${moment(trigger_ts).format("DD MMMM YYYY, h:mm A")}`;
            basis.push(x);
        });

        let temp_release = moment(data_ts).format("YYYY-MM-DD ") + time;
        temp_release = moment(temp_release);

        let release_time = moment(data_ts).hour() > moment(time, ["HH:mm:ss, HH:mm:ss"]).hour() ? temp_release.add(1, "day") : temp_release;
        release_time = release_time.format("DD MMMM YYYY, hh:mm A");

        const str = `As of ${release_time}, ${loc} is under ${alert} based on ${basis.join(", ")}.`;
        $("#info").val(`${str}\n\n${text}`);
    }

    return onset;
}

function addMailRecipients (is_onset) {
    const $rec_span = $("#recipients_span");
    const recipients = [];

    if (HOSTNAME.includes("dynaslope.phivolcs.dost")) {
        recipients.push("rusolidum@phivolcs.dost.gov.ph", "asdaag48@gmail.com");

        if (is_onset) {
            recipients.push("phivolcs-dynaslope@googlegroups.com", "phivolcs-senslope@googlegroups.com");
        }
    } else if ($rec_span.html().length === 0) {
        recipients.push("dynaslope.mail@gmail.com");
        $rec_span.append("<b style='background-color:yellow;'>TEST SERVER ONLY -- RUS & AGD NOT AUTOMATICALLY TAGGED AS RECIPIENTS FOR SAFEGUARD</b><br/>");
    }

    $("#recipients").tagsinput("removeAll");
    recipients.forEach((x) => { $("#recipients").tagsinput("add", x); });
}

function renderPDF (id) {
    const is_edited = on_edit === true ? 1 : 0;
    const edits = [];
    const edited_field_values = [];

    if (is_edited) {
        $(".editable").each((i) => {
            edited_field_values.push([$(this).prop("id"), $(this).val()]);
            const temp = encodeURIComponent($(this).val());
            edits.push(temp);
        });

        console.log(original_field_values, edited_field_values);

        sendBulletinAccuracyReport(release_id, edited_field_values, original_field_values);

        // GINTAGS implementation
        tagBulletin(release_id, edited_field_values, original_field_values);
    }

    $("#bulletin-modal").modal("hide");

    $LOADING.find(".progress-bar").text("Rendering Bulletin PDF...");
    $LOADING.modal({ backdrop: "static", show: "true" });

    const address = `/../../bulletin/run_script/${id}/${is_edited}`;

    edit(false);

    return $.ajax({
        url: address,
        type: "GET",
        cache: false,
        data: { edits: edits.join("**") }
    })
    .done((response) => {
        if (response === "Success.") {
            console.log("PDF RENDERED");
            $LOADING.modal("hide");
            $LOADING.find(".progress-bar").text("Loading...");
        } else console.log(response);
    })
    .catch((x) => {
        $LOADING.modal("hide");
        $LOADING.find(".progress-bar").text("Loading...");
        sendBulletinError(`error rendering PDF\n${x.responseText}`);
        showErrorModal(x, "rendering PDF");
    });
}

function sendBulletinAccuracyReport (release_id, edited_field_values, original_field_values) {
    const remarks_str = [];
    for (let i = 0; i < edited_field_values.length; i += 1) {
        if (edited_field_values[i][1] !== original_field_values[i][1]) {
            let str = `Edited "${original_field_values[i][0]}"`;
            str += `(from "${original_field_values[i][1]}" to "${edited_field_values[i][1]}")`;
            remarks_str.push(str);
        }
    }

    const report = {
        type: "accuracy",
        metric_name: "bulletin_accuracy",
        module_name: "Bulletin",
        report_message: remarks_str,
        reference_id: release_id,
        reference_table: "public_alert_release"
    };

    PMS.send(report);
}

// GINTAGS implementation
function tagBulletin (release_id, edited_field_values, original_field_values) {
    $.get(
        `/../../gintagshelper/getGinTagsViaTableElement/${release_id}`,
        (x) => {
            if (x.length == 0) {
                const remarks_str = [];
                for (let i = 0; i < edited_field_values.length; i++) {
                    if (edited_field_values[i][1] !== original_field_values[i][1]) {
                        let str = `Edited "${original_field_values[i][0]}"`;
                        str += `(from "${original_field_values[i][1]}" to "${edited_field_values[i][1]}")`;
                        remarks_str.push(str);
                    }
                }

                if (remarks_str.length != 0) {
                    console.log("TAGGING");
                    const gintags_collection = [{
                        tag_name: "#AlteredBulletin",
                        tag_description: "monitoring",
                        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                        tagger: $("#current_user_id").val(),
                        table_element_id: release_id,
                        remarks: remarks_str.join("; "),
                        table_used: "public_alert_event/release"
                    }];

                    $.post("/../../generalinformation/insertGinTags/", { gintags: JSON.stringify(gintags_collection) });
                }
            }
        }, "json"
    );
}

function sendMail (text, subject, filename, recipients, release_id) {
	$LOADING.find(".progress-bar").text("Sending EWI and Bulletin...");
	const is_test = HOSTNAME.includes("dynaslope.phivolcs.dost") ? false : true;    const form = {
        text,
        subject,
        filename,
        recipients,
        is_test
    };

    console.log(text, subject, filename);

    mailBulletin(form)
    .then((data) => {
        $LOADING.modal("hide");
        $LOADING.find(".progress-bar").text("Loading...");

        $RESULT_MODAL.find(".modal-header > #site-id").html(subject.slice(0, 3));
        const $result_body = $RESULT_MODAL.find(".modal-body");
        $result_body.find("span").hide();
        let return_val;

        if (data === "Sent.") {
            console.log("Email sent");

            // const baseline = moment(bulletin_timestamp).add(20, "minutes");
            const exec_time = moment().diff(bulletin_timestamp);
            const report = {
                type: "timeliness",
                metric_name: "bulletin_timeliness",
                module_name: "Bulletin",
                execution_time: exec_time,
		reference_id: release_id,
        	reference_table: "public_alert_release"
            };

            PMS.send(report);
            $(`#${release_id}`).css("color", "red").attr("data-sent", 1);

            insertNarrative(recipients);

            $result_body.find(".success").show();
            return_val = $.Deferred().resolve();
        } else {
            $result_body.find(".error").text(data);
            $result_body.find(".failed").show();
            return_val = $.Deferred().reject();
        }

        $RESULT_MODAL.modal("show");
        return return_val;
    })
    .catch((x) => {
        sendBulletinError(`error sending bulletin\n${x.responseText}`);
        showErrorModal(x, "sending bulletin");
    });
}

function mailBulletin (form) {
    return $.post("/../../bulletin/mail/", form);
}

function insertNarrative (recipients) {
    const people = recipients.map((x) => {
        if (x === "rusolidum@phivolcs.dost.gov.ph") return "RUS";
        if (x === "asdaag48@gmail.com") return "ASD";
        if (x === "hyunbin_vince@yahoo.com") return "KDDC";
        return x;
    });

    let ts = bulletin_timestamp.format("hh:mm A");
    if (bulletin_timestamp.hour() % 4 !== 0 || bulletin_timestamp.minute() !== 0) {
        ts = `${bulletin_timestamp.format("hh:mm A")} onset`;
    }
    const formatted_ts = ts.replace(/(12:\d{2}) ([AP])M/g, (match, time, meridian) => {
        if (meridian === "P") return `${time} NN`;
        return `${time} MN`;
    });
    const message = `Sent ${formatted_ts} EWI Bulletin to ${people.join(", ")}`;

    const narratives = [{
        event_id,
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        narrative: message
    }];

    return $.post("/../../accomplishment/insertNarratives", { narratives: JSON.stringify(narratives) });
}

function sendBulletinError (message, release_id) {
    const report = {
        type: "error_logs",
        metric_name: "bulletin_error_logs",
        module_name: "Bulletin",
        report_message: message,
	reference_id: release_id,
	reference_table: "public_alert_release"
    };

    PMS.send(report);
}

function edit (on_edit) {
    console.log(on_edit);
    if (on_edit) {
        $(".edit-event-page").css({ "background-color": "#FFFF00" });
        $("#edit-bulletin").text("Exit Edit");
        $("#send").text("Send Edited");
        $("#download").text("Download Edit");
        $("#edit-reminder").show();
        $("#cancel, #bulletinModal .close").hide();

        $(".editable").each(function () {
            original_field_values.push([$(this).prop("id"), $(this).text()]);
            const isLonger = $(this).hasClass("longer_input") ? "col-sm-12" : "";
            $(this).replaceWith(`<input class='editable ${isLonger}' id='${$(this).prop("id")}' value='${$(this).text()}'>`);
        });

        const url = $(window.location).attr("href");
        let content = "Edit this part by changing the <strong>[content]</strong> of the release";
        if (url.includes("home") || url.includes("dashboard")) { content += ` on the <strong><a href='../../monitoring/events/${event_id}/${release_id}'>event page</a></strong>`; }
        $("#datetime.edit-event-page").popover({
            html: true, title: "BULLETIN EDIT", content: content.replace("[content]", "Data Timestamp"), trigger: "hover", placement: "bottom", delay: { hide: 1000 }
        });
        $(".descriptions.edit-event-page").popover({
            html: true, title: "BULLETIN EDIT", content: content.replace("[content]", "Trigger Timestamp, Technical Info, and other needed information (if any)"), trigger: "hover", placement: "bottom", delay: { hide: 1000 }
        });
        $(".editable").popover({
            html: true, title: "BULLETIN EDIT", content: "After editing, report the incident for a hotfix.", trigger: "focus", placement: "bottom"
        });
    } else {
        $(".edit-event-page").css({ "background-color": "#fffff" });
        $("#edit-bulletin").text("Edit");
        $("#send").text("Send");
        $("#download").text("Download");
        $("#edit-reminder").hide();
        $("#cancel, #bulletinModal .close").show();
        $(".edit-event-page").popover("destroy");
        original_field_values = [];
        $(".editable").each(function () {
            const isLonger = $(this).hasClass("col-sm-12") ? "longer_input" : "";
            $(this).replaceWith(`<span class='editable ${isLonger}' id='${$(this).prop("id")}'>${$(this).val()}</span>`);
        });
    }
}
