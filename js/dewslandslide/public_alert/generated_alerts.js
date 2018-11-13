
function processReceivedGeneratedAlerts ([data]) {
    const { alerts, invalids } = data;

    const groups = [
        ["#invalid-alerts-group .alert", "#invalid"],
        ["#alerts-panel-group .panel", "#alert"],
        ["#no-alerts-panel-group .panel", "#no-alert"]
    ];

    const headers = ["#invalid-header", "#alert-header", "#no-alert-header"];

    groups.forEach(([parent, exclude]) => {
        $(`${parent}:not(${exclude}-panel-template)`).remove();
    });

    headers.forEach((header) => {
        $(header).prop("hidden", "hidden");
    });

    createInvalidPanels(invalids);
    createAlertPanels(alerts);
    createPanelTables(alerts);

    $("#generated-alerts-tab .panel").css("padding-bottom", 0);
}

function createInvalidPanels (invalids) {
    invalids.forEach((invalid) => {
        $("#invalid-header").prop("hidden", false);
        const {
            ts_last_retrigger, site_code, alert_symbol,
            iomp, remarks
        } = invalid;
        const $invalid_panel = $("#invalid-panel-template").clone().prop("hidden", false).removeAttr("id");

        const input_arr = [
            ["#invalid-timestamp", ts_last_retrigger],
            ["#invalid-site-code", site_code.toUpperCase()],
            ["#invalid-alert-symbol", alert_symbol],
            ["#invalid-iomp", iomp],
            ["#invalid-remarks", remarks]
        ];

        input_arr.forEach(([element, text]) => {
            $invalid_panel.find(element).text(text);
        });

        $("#invalid-alerts-group").append($invalid_panel);
    });
}

function createAlertPanels (alerts) {
    alerts.forEach((alert) => {
        const {
            internal_alert, site_code,
            ts, validity, public_alert
        } = alert;

        const input_arr = [
            ["#alert-timestamp", ts],
            ["#alert-site-code", site_code.toUpperCase()],
            ["#alert-symbol", internal_alert],
            ["#alert-validity", `Valid until: ${validity}`]
        ];

        if (validity) {
            $("#alert-header").prop("hidden", false);
            const $alert_panel = $("#alert-panel-template").clone().removeAttr("id");

            let panel_color = "panel-a1";
            switch (public_alert) {
                case "A2": panel_color = "panel-warning"; break;
                case "A3": panel_color = "panel-danger"; break;
                default: break;
            }

            $alert_panel.removeClass("panel-info").addClass(panel_color);

            input_arr.forEach(([element, text]) => {
                $alert_panel.find(element).text(text);
            });

            $alert_panel.find(".panel-collapse").prop("id", `alert-collapse-${site_code}`);
            $alert_panel.find(".panel-heading").attr("href", `#alert-collapse-${site_code}`);
            $alert_panel.prop("hidden", false);

            $("#alerts-panel-group").append($alert_panel);
        } else {
            $("#no-alert-header").prop("hidden", false);
            const $no_alert_panel = $("#no-alert-panel-template").clone().removeAttr("id");
            const no_alert_input = [
                ["#no-alert-timestamp", ts],
                ["#no-alert-site-code", site_code.toUpperCase()],
                ["#no-alert-symbol", internal_alert]
            ];

            no_alert_input.forEach(([element, text]) => {
                $no_alert_panel.find(element).text(text);
            });

            $no_alert_panel.find(".panel-collapse").prop("id", `no-alert-collapse-${site_code}`);
            $no_alert_panel.find(".panel-heading").attr("href", `#no-alert-collapse-${site_code}`);
            $no_alert_panel.prop("hidden", false);

            $("#no-alerts-panel-group").append($no_alert_panel);
        }
    });
}

function createPanelTables (alerts) {
    alerts.forEach((alert) => {
        const {
            rainfall, site_code, subsurface,
            surficial, tech_info, triggers,
            public_alert
        } = alert;

        const uni_data = [
            { title: "Rainfall Alert", value: rainfall },
            { title: "Surficial Alert", value: surficial }
        ];

        const lookup = [
            ["alert", "ts"],
            ["title", "value"],
            ["tsm_name", "alert_level"]
        ];

        const groups = [
            ["Event Triggers", "Op Trigger", "Timestamp", triggers],
            ["Operational Alert Status", "Op Trigger", "Status", uni_data],
            ["Subsurface Column Status", "Column Name", "Status", subsurface]
        ];

        let panel_group = `#alert-collapse-${site_code}`;
        if (public_alert === "A0") {
            groups.splice(0, 1);
            lookup.splice(0, 1);
            panel_group = `#no-alert-collapse-${site_code}`;
        }

        groups.forEach((group, index) => {
            const [header, column_header_1, column_header_2, data_input] = group;
            const $table_template = $("#table-template").clone().removeAttr("id").prop("hidden", false);

            if (group[0] === "Subsurface Column Status" && subsurface.length === 0) {
                const unhide = $("#no-sub-sensor").clone().prop("hidden", false);
                const no_sub = unhide.css("color", "red").prop("outerHTML");
                $(`${panel_group} #panel-table-row`).append(no_sub);
                return;
            }

            const input_arr = [
                ["label > u", header],
                [".table-header-1", column_header_1],
                [".table-header-2", column_header_2]
            ];

            input_arr.forEach(([element, text]) => {
                $table_template.find(element).text(text);
            });

            const $table_row = $table_template.find("#inside-panel-row").clone()
            .prop("hidden", false)
            .removeAttr("id");

            data_input.forEach((data) => {
                lookup[index].forEach((attr, i) => {
                    $table_row.find(`#column-${i + 1}`)
                    .text(data[attr]);
                });

                $table_template.find("#inside-panel-table").append($table_row.clone());
            });

            $(`${panel_group} #panel-table-row`).append($table_template);
        });

        if (tech_info) {
            const $ti_template = $("#tech-info-template").clone().removeAttr("id").prop("hidden", false);
            Object.keys(tech_info).forEach((key) => {
                const temp_key = key.substr(0, 1).toUpperCase() + key.substr(1);
                $ti_template.find("#tech-info-source > strong").text(temp_key);
                let text = "";
                if (key === "subsurface" || key === "surficial") {
                    Object.keys(tech_info[key]).forEach((tsm_alert, i) => {
                        text += `${tsm_alert}: ${tech_info[key][tsm_alert]}`;
                        if (i === 0 && Object.keys(tech_info[key]).length > 1) text += "; ";
                    });
                } else {
                    text = tech_info[key];
                }

                $ti_template.find("#tech-info-text").text(text);

                $(`${panel_group} #tech-info-row`).append($ti_template.clone());
            });
        }
    });
}
