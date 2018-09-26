$(document).ready(() => {

    $("#ewi-asap-modal").on("shown.bs.modal", () => {
        temp_ewi_template_holder = $("#constructed-ewi-amd").val();
    });
    $("#edit-btn-ewi-amd").click(() => {
        if ($("#edit-btn-ewi-amd").val() === "edit") {
            $("#constructed-ewi-amd").prop("disabled", false);
            $("#edit-btn-ewi-amd").val("undo");
            $("#edit-btn-ewi-amd").text("Undo");
            $("#edit-btn-ewi-amd").attr("class", "btn btn-danger");
        } else {
            $("#constructed-ewi-amd").prop("disabled", true);
            $("#constructed-ewi-amd").val(temp_ewi_template_holder);
            $("#edit-btn-ewi-amd").attr("class", "btn btn-warning");
            $("#edit-btn-ewi-amd").text("Edit");
            $("#edit-btn-ewi-amd").val("edit");
        }
    });

    $("#send-btn-ewi-amd").click(() => {
        temp = [];
        $("#loading").show();
        var current_recipients = $("#ewi-recipients-dashboard").tagsinput("items");
        var default_recipients = $("#default-recipients").val().split(",");
        var difference = [];
        var tagOffices = [];

        $.grep(current_recipients, (el) => {
            if ($.inArray(el, default_recipients) == -1) difference.push(el);
        });

        ewi_recipient_flag = true;
        var footer = ` -${$("#footer-ewi").val()} from PHIVOLCS-DYNASLOPE`;
        var text = $("#constructed-ewi-amd").val();
        if (temp_ewi_template_holder == $("#constructed-ewi-amd").val()) {
            $("#edit-btn-ewi-amd").val("edit");
        }

        try {
            for (let counter = 0; counter < current_recipients.length; counter++) {
                var raw_office = current_recipients[counter].split(":");
                if ($.inArray(raw_office[0].trim(), tagOffices) == -1) {
                    tagOffices.push(raw_office[0].trim());
                }
            }

            $("input[name=\"offices\"]").prop("checked", false);
            $("input[name=\"sitenames\"]").prop("checked", false);

            var tagSitenames = [];
            tagSitenames.push($("#site-abbr").val().toUpperCase());

            switch (tagSitenames[0]) {
                case "MSL":
                    tagSitenames[0] = "MES";
                    break;
                case "MSU":
                    tagSitenames[0] = "MES";
                    break;
            }

            var msg = {
                type: "smssendgroup",
                user: "You",
                offices: tagOffices,
                sitenames: tagSitenames,
                msg: text + footer,
                ewi_filter: true,
                ewi_tag: true
            };

            wss_connect.send(JSON.stringify(msg));
            message_type = "smssendgroup";
            messages = [];
            updateMessages(msg);

            if (difference != null || difference.length !== 0) {
                const added_contacts = [];
                difference.forEach((x) => {
                    if (x.indexOf("|") === -1) {
                        added_contacts.push([x]);
                    } else {
                        temp = x.split("|");
                        added_contacts.push(temp.splice(1, 1));
                    }
                });

                for (let counter = 0; counter < added_contacts.length; counter += 1) {
                    user = "You";
                    gsm_timestamp_indicator = $("#server-time").text();
                    temp_msg_holder = {
                        type: "smssend",
                        user,
                        numbers: added_contacts[counter],
                        msg: text + footer,
                        timestamp_written: gsm_timestamp_indicator,
                        ewi_tag: true
                    };
                    wss_connect.send(JSON.stringify(temp_msg_holder));
                }
            }

            $("#constructed-ewi-amd").val("");
            $("#ewi-asap-modal").modal("toggle");
            $(`#${latest_release_id}_sms`).css("color", "red").attr("data-sent", 1);
        } catch (err) {
            $("#result-ewi-message").text("Failed!, Please check the template.");
            alert(err.stack);
            $("#success-ewi-modal").modal("toggle");
            $("#ewi-asap-modal").modal("toggle");
        }
    });
});

function chatterboxViaMonitoringDashboard (dashboard_data) {
    $("#send-btn-ewi-amd").prop("disabled", true);
    $("#send-btn-ewi-amd").attr("title", "4/8/12 PM/AM Lock implemented, wait for the proper release time.");
    const current_client_time = moment().format("YYYY-MM-DD HH:mm:ss");
    const remainder = moment(current_client_time).minute() % 30;
    const client_release_time = moment(current_client_time).subtract(remainder, "m").format("YYYY-MM-DD HH:mm:00");

    if (client_release_time === dashboard_data.event_start) {
        $("#send-btn-ewi-amd").prop("disabled", false);
        $("#send-btn-ewi-amd").attr("title", "4/8/12 PM/AM Lock disabled.");
    } else if (moment(current_client_time).hours() % 4 === 0) {
        $("#send-btn-ewi-amd").attr("title", "4/8/12 PM/AM Lock disabled.");
        $("#send-btn-ewi-amd").prop("disabled", false);
    } else if (dashboard_data.event_start === dashboard_data.data_timestamp) {
        $("#send-btn-ewi-amd").prop("disabled", false);
        $("#send-btn-ewi-amd").attr("title", "4/8/12 PM/AM Lock disabled.");
    }

    let alert_site_name = "";
    let alert_level = "";

    if (dashboard_data.internal_alert_level.indexOf("ND-R") > -1 || dashboard_data.internal_alert_level.indexOf("ND") > -1) {
        dashboard_data.internal_alert_level = "A1-R";
    } else if (dashboard_data.internal_alert_level.indexOf("ND-E") > -1) {
        dashboard_data.internal_alert_level = "A1-E";
    } else if (dashboard_data.internal_alert_level.indexOf("A1-Rx") > -1) {
        dashboard_data.internal_alert_level = "A1-R";
    }

    // HOTFIX OF g0/r0/s0 sites
    if (dashboard_data.internal_alert_level.indexOf("A2-g0") > -1) {
        dashboard_data.internal_alert_level = "A2-G";
    } else if (dashboard_data.internal_alert_level.indexOf("A1-R0") > -1) {
        dashboard_data.internal_alert_level = "A1-R";
    } else if (dashboard_data.internal_alert_level.indexOf("A3-S0") > -1) {
        dashboard_data.internal_alert_level = "A3-S";
    } else if (dashboard_data.internal_alert_level.indexOf("A2-s0") > -1) {
        dashboard_data.internal_alert_level = "A2-s";
    }

    if (dashboard_data.name === "msu" || dashboard_data.name === "msl") {
        alert_site_name = "mes";
    } else {
        alert_site_name = dashboard_data.name;
    }
    alert_level = dashboard_data.internal_alert_level.split("-")[0];
    if (alert_level.length === 2) {
        alert_level = `Alert ${alert_level[1]}`;
    }

    $.ajax({
        type: "POST",
        url: "../chatterbox/getCommunityContactViaDashboard/",
        async: true,
        data: { site: alert_site_name },
        success (response) {
            var contacts = JSON.parse(response);
            var default_recipients = [];
            var additional_recipients = [];

            $("#ewi-recipients-dashboard").tagsinput("removeAll");
            $("#ewi-recipients-dashboard").val("");

            for (let counter = 0; counter < contacts.length; counter += 1) {
                const numbers = contacts[counter].number.split(",");
                let number = "";
                let temp = "";

                if (contacts[counter].ewirecipient !== 0) {
                    numbers.forEach((x) => {
                        temp = `${temp}|${x}`;
                        number = temp;
                    });

                    console.log(dashboard_data);
                    if (dashboard_data.status === "extended" && dashboard_data.day != null) {
                        if (contacts[counter].office !== "PLGU" && contacts[counter].office !== "GDAPD-PHIV" && contacts[counter].office !== "REG8") {
                            const detailed = `${contacts[counter].office} : ${contacts[counter].lastname} ${contacts[counter].firstname} ${number}`;
                            default_recipients.push(detailed);
                            $("#ewi-recipients-dashboard").tagsinput("add", detailed);
                        }
                    } else if (contacts[counter].office !== "GDAPD-PHIV") {
                        const detailed = `${contacts[counter].office} : ${contacts[counter].lastname} ${contacts[counter].firstname} ${number}`;
                        default_recipients.push(detailed);
                        $("#ewi-recipients-dashboard").tagsinput("add", detailed);
                    }
                } else {
                    numbers.forEach((x) => {
                        temp = `${temp}|${x}`;
                        number = temp;
                    });
                    const detailed = `${contacts[counter].office} : ${contacts[counter].lastname} ${contacts[counter].firstname} ${number}`;
                    additional_recipients.push(detailed);
                }
            }
            $("#default-recipients").val(default_recipients);
            $("#additional-recipients").val(additional_recipients);
        }
    });

    $("#constructed-ewi-amd").prop("disabled", true);
    $("#edit-btn-ewi-amd").attr("class", "btn btn-warning");
    $("#edit-btn-ewi-amd").text("Edit");
    $("#edit-btn-ewi-amd").val("edit");
    $("#event_details").val(JSON.stringify(dashboard_data));

    if (dashboard_data.status === "extended") {
        if (dashboard_data.internal_alert_level.indexOf("A1") >= -1 || dashboard_data.internal_alert_level === "ND") {
            dashboard_data.internal_alert_level = "A0";
        }
    }

    let alertLevel = dashboard_data.internal_alert_level.split("-")[0];
    const alertTrigger = dashboard_data.internal_alert_level.split("-")[1];

    $.ajax({
        type: "POST",
        url: "../communications/getkeyinputviatriggertype",
        async: true,
        data: { trigger_type: alertTrigger, level: alertLevel },
        success (data) {
            let techInfo = JSON.parse(data);
            let alert_stat;
            if (techInfo != null) {
                if (dashboard_data.status === "on-going" && alertLevel.includes("3") === true) {
                    alert_stat = "Event-Level3";
                } else if (dashboard_data.status === "on-going") {
                    alert_stat = "Event";
                } else {
                    alert_stat = dashboard_data.status;
                }

                if (Array.isArray(techInfo.key_input) === false) {
                    techInfo = techInfo[0];
                } else {
                    for (let counter = 0; counter < techInfo.key_input[0].length; counter += 1) {
                        if (alert_stat === techInfo.key_input[0][counter].alert_status) {
                            techInfo = techInfo.key_input[0][counter];
                        }
                    }
                }
            }

            $.ajax({
                type: "POST",
                url: "../communications/getbackboneviastatus",
                async: true,
                data: { alert_status: techInfo.alert_status },
                success (techInfoData) {
                    var backboneMessage = JSON.parse(techInfoData);
                    if (alertLevel.length === 2 && alertLevel.indexOf("A") !== -1) {
                        alertLevel = alertLevel.replace("A", "Alert ");
                    }

                    $.ajax({
                        type: "POST",
                        url: "../communications/getrecommendedresponse",
                        async: true,
                        data: { recommended_response: alertLevel },
                        success (recommResponseData) {
                            var recommendedResponse = JSON.parse(recommResponseData);
                            var template = "";
                            var level;
                            if (recommendedResponse[0].alert_symbol_level.match(/\d+/g)) {
                                level = recommendedResponse[0].alert_symbol_level[recommendedResponse[0].alert_symbol_level.length - 1];
                            }
                            for (let counter = 0; counter < backboneMessage.length; counter += 1) {
                                if (backboneMessage[counter].alert_status.indexOf(level) === -1 && level === 3) {
                                    template = backboneMessage[counter].template;
                                } else if (level === 1 || level === 2) {
                                    if (backboneMessage[counter].alert_status === "Event") {
                                        template = backboneMessage[counter].template;
                                    }
                                } else {
                                    template = backboneMessage[counter].template;
                                    break;
                                }
                            }

                            for (let counter = 0; counter < backboneMessage.length; counter += 1) {
                               if (backboneMessage[counter].alert_status.toLowerCase() === dashboard_data.status) {
                                    template = backboneMessage[counter].template;
                                    switch (dashboard_data.day) {
                                        case 0:
                                            template = template.replace("(nth-day-extended)", "unang araw ng 3-day extended");
                                            break;
                                        case 1:
                                            template = template.replace("(nth-day-extended)", "ikalawang araw ng 3-day extended");
                                            break;
                                        case 2:
                                            template = template.replace("(nth-day-extended)", "huling araw ng 3-day extended");
                                            break;
                                        case 3:
                                            template = template.replace("(nth-day-extended)", "susunod na routine");
                                            break;
                                        default:
                                            template = template.replace("(nth-day-extended)", "tatlong araw na routine");
                                            break;
                                    }

                                    let next_gndmeas_template = "";
                                    $.ajax({
                                        type: "POST",
                                        url: "../chatterbox/getRoutineSeason",
                                        async: false,
                                        data: { site_name: dashboard_data.name },
                                        success (response) {
                                            let list_of_sites = JSON.parse(response);
                                            let next_routine_day = [];
                                            let day = moment().format("dddd");
                                            let month = moment().month();
                                            let wet = [[1, 2, 6, 7, 8, 9, 10, 11, 12], [5, 6, 7, 8, 9, 10]];
                                            let dry = [[3, 4, 5], [1, 2, 3, 4, 11, 12]];
                                            month += 1;
                                            for (let counter = 0; counter < list_of_sites.length; counter++) {
                                                if (list_of_sites[counter].site == dashboard_data.name) {
                                                    next_routine_day.push(dashboard_data);
                                                }
                                            }
                                            // tues fri - wet
                                            // wed - dry

                                            if (wet[next_routine_day[0].season -1].includes(month)) {
                                                if (day == "Wednesday") {
                                                    next_gndmeas_template = "sa darating na biyernes";
                                                } else {
                                                    next_gndmeas_template = "sa darating na miyerkules";
                                                }
                                                
                                            } else {
                                                next_gndmeas_template = "sa darating na martes";
                                            }

                                            switch (dashboard_data.day) {
                                                case 0:
                                                case 1:
                                                case 2:
                                                    template = template.replace("(next-gndmeas-submission)", "bukas bago mag-11:30 AM");
                                                    break;
                                                case 3:
                                                    template = template.replace("(next-gndmeas-submission)", next_gndmeas_template);
                                                    break;
                                                default:
                                                    template = template.replace("(next-gndmeas-submission)", "tatlong araw na routine");
                                                    break;
                                            }
                                        }
                                    });
                                }
                            }

                            const currentDate = new Date();
                            const current_meridiem = currentDate.getHours();

                            if (current_meridiem >= 13 && current_meridiem <= 18) {
                                template = template.replace("(greetings)", "hapon");
                            } else if (current_meridiem >= 18 && current_meridiem <= 23) {
                                template = template.replace("(greetings)", "gabi");
                            } else if (current_meridiem >= 0 && current_meridiem <= 3) {
                                template = template.replace("(greetings)", "gabi");
                            } else if (current_meridiem >= 4 && current_meridiem <= 11) {
                                template = template.replace("(greetings)", "umaga");
                            } else {
                                template = template.replace("(greetings)", "tanghali");
                            }

                            template = template.replace("(alert_level)", alert_level);
                            const ewiLocation = `${dashboard_data.sitio}, ${dashboard_data.barangay}, ${dashboard_data.municipality}, ${dashboard_data.province}`;
                            let formatSbmp = ewiLocation.replace("null", "");
                            if (formatSbmp.charAt(0) === ",") {
                                formatSbmp = formatSbmp.substr(1);
                            }

                            template = template.replace("(site_location)", formatSbmp);

                            if (techInfo.key_input.substring(0, 4) === " at ") {
                                techInfo.key_input = techInfo.key_input.substring(4);
                            }

                            template = template.replace("(technical_info)", techInfo.key_input);
                            template = template.replace("(recommended_response)", recommendedResponse[0].key_input);

                            const current_time = moment().format("YYYY-MM-DD HH:mm");

                            const release_time = moment(dashboard_data.data_timestamp).format("YYYY-MM-DD hh:mm A");
                            const onset_time = moment(dashboard_data.event_start).format("YYYY-MM-DD hh:mm A");

                            data_timestamp = release_time;
                            
                            let parsed_time;
                            let meridiem;

                            if (onset_time !== release_time) {
                                meridiem = moment(dashboard_data.data_timestamp).add(30, "m").format("hh:mm A");
                                if (meridiem === "12:00 AM") {
                                    meridiem = meridiem.replace("AM", "MN");
                                } else if (meridiem === "12:00 PM") {
                                    meridiem = meridiem.replace("PM", "NN");
                                }

                                parsed_time = moment().format("LL");
                                template = template.replace("(current_date_time)", `${parsed_time} ${meridiem}`);
                                template = template.replace("(current_date)", moment().format("MMMM D, YYYY"));
                            } else {
                                meridiem = moment(dashboard_data.event_start).format("hh:mm A");
                                if (meridiem.slice(-8) === "12:00 AM") {
                                    meridiem = meridiem.replace("AM", "MN");
                                } else if (meridiem.slice(-8) === "12:00 PM") {
                                    meridiem = meridiem.replace("PM", "NN");
                                }

                                parsed_time = moment().format("LL");
                                template = template.replace("(current_date_time)", `${parsed_time} ${meridiem}`);
                                template = template.replace("(current_date)", moment().format("MMMM D, YYYY"));
                            }

                            if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 00:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 04:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-07:30 AM");
                                template = template.replace("(gndmeas_date_submission)", "mamaya");

                                template = template.replace("(next_ewi_time)", "04:00 AM");
                                template = template.replace("(next_ewi_date)", "mamayang");
                            } else if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 04:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 08:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-07:30 AM");
                                template = template.replace("(gndmeas_date_submission)", "mamaya");

                                template = template.replace("(next_ewi_time)", "08:00 AM");
                                template = template.replace("(next_ewi_date)", "mamayang");
                            } else if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 08:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 12:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-11:30 AM");
                                template = template.replace("(gndmeas_date_submission)", "mamaya");

                                template = template.replace("(next_ewi_time)", "12:00 NN");
                                template = template.replace("(next_ewi_date)", "mamayang");
                            } else if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 12:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 16:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-3:30 PM");
                                template = template.replace("(gndmeas_date_submission)", "mamaya");

                                template = template.replace("(next_ewi_time)", "04:00 PM");
                                template = template.replace("(next_ewi_date)", "mamayang");
                            } else if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 16:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").format("YYYY-MM-DD")} 20:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-7:30 AM");
                                template = template.replace("(gndmeas_date_submission)", "bukas");

                                template = template.replace("(next_ewi_time)", "08:00 PM");
                                template = template.replace("(next_ewi_date)", "mamayang");
                            } else if (moment(current_time).valueOf() >= moment(`${moment().locale("en").format("YYYY-MM-DD")} 20:00`).valueOf() && moment(current_time).valueOf() < moment(`${moment().locale("en").add(24, "hours").format("YYYY-MM-DD")} 00:00`).valueOf()) {
                                template = template.replace("(gndmeas_time_submission)", "bago mag-7:30 AM");
                                template = template.replace("(gndmeas_date_submission)", "bukas");

                                template = template.replace("(next_ewi_time)", "12:00 MN");
                                template = template.replace("(next_ewi_date)", "bukas ng");
                            } else {
                                alert("Error Occured: Please contact Administrator");
                            }
                            $("#msg").val(template);
                            $("#site-abbr").val(dashboard_data.name);
                            $("#extended_status").val(`${dashboard_data.status},${dashboard_data.day}`);
                            $("#constructed-ewi-amd").val(template);
                            $("#ewi-asap-modal").modal("toggle");
                        }
                    });
                }
            });
        }
    });
}

// SCRIPTS FOR SEMI-AUTO GNDMEAS REMINDER

function initializeActivityChangeOnClick() {
    // some code here
}