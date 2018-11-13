
let table_container;
let table;
let table_template;

$(document).ready(() => {
    generateDataTables();
});

function deactivatedSensors () {
    return $.getJSON("../sensor_overview/deactivatedSensors")
    .catch((error) => {
        console.error(error);
    });
}

function deactivatedLoggers () {
    return $.getJSON("../sensor_overview/deactivatedLoggers")
    .catch((error) => {
        console.error(error);
    });
}

function loggerHealth () {
    return $.getJSON("../sensor_overview/loggerHealth")
    .catch((error) => {
        console.error(error);
    });
}

function rainHealth () {
    return $.getJSON("../sensor_overview/rainHealth")
    .catch((error) => {
        console.error(error);
    });
}

function somsHealth () {
    return $.getJSON("../sensor_overview/somsHealth")
    .catch((error) => {
        console.error(error);
    });
}

function piezoHealth () {
    return $.getJSON("../sensor_overview/piezoHealth")
    .catch((error) => {
        console.error(error);
    });
}

function generateDataTables () {
    const active_loggers = [
        loggerHealth(),
        rainHealth(),
        somsHealth(),
        piezoHealth()
    ];

    const deactivated = [
        deactivatedLoggers(),
        deactivatedSensors()
    ];

    $.when(...deactivated).then((...args) => {
        args.forEach((obj) => {
            obj[0].forEach((info) => {
                createTables(info[0], info[1], info[2], info[3]);
            });
        });
    });

    active_loggers.forEach((data) => {
        data.then((value) => {
            value.forEach((val) => {
                createTables(val[0], val[1], val[2], val[3]);
            });
        });
    });
}

function createTables (data_source, tab_id, title, table_title) {
    switch (table_title) {
        case "#deact-sensor-div":
            table_container = $("#deact-table-container")
            .removeAttr("id")
            .prop("hidden", false);
            table = $(`${table_title}`);
            table_template = table
            .find("#deact-sensor-template")
            .clone()
            .prop("hidden", false);
            break;
        case "#deact-logger-div":
            table_container = $("#deact-table-container")
            .removeAttr("id")
            .prop("hidden", false);
            table = $(`${table_title}`);
            table_template = table
            .find("#deact-logger-template")
            .clone()
            .prop("hidden", false);
            break;
        default:
            table_container = $("#table-container")
            .clone()
            .removeAttr("id")
            .prop("hidden", false);
            table = $("#table-div").clone();
            table_template = table
            .find("#table-template")
            .clone()
            .prop("hidden", false);
            break;
    }

    if (table_title) {
        data_source.forEach((info) => {
            const table_row = table_template
            .find("#deact-row-template")
            .clone()
            .removeAttr("id")
            .prop("hidden", false);

            table.find("#table-title").text(title).prop("hidden", false);
            table_row.find("#logger-name").text(info.logger_name.toUpperCase());
            table_row.find("#date-deactivated").text(moment(info.date_deactivated).format("DD MMMM YYYY HH:mm"));
            table_template.append(table_row);
        });
    } else {
        data_source.forEach((info) => {
            const {
                logger_name, time_delta, data_presence, last_data
            } = info;

            const lookup = [
                ["#logger-name", logger_name.toUpperCase()],
                ["#time-delta", time_delta],
                ["#data-presence", data_presence],
                ["#last-data-available", moment(last_data).format("DD MMMM YYYY HH:mm")]
            ];

            const table_row = table_template
            .find("#row-template")
            .clone()
            .removeAttr("id")
            .prop("hidden", false);

            lookup.forEach(([element, text]) => {
                table_row.find(element).text(text);
            });
            table_template.append(table_row);
        });
    }
    table.append(table_template);
    table_container.append(table);
    $(`${tab_id}`).append(table_container);
    table_template.DataTable();
}
