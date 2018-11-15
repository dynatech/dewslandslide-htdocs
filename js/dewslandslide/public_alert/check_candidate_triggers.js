
const moment = require("moment");
const { readFileSync } = require("fs");

const { argv: args } = process;

const json = readFileSync(args[2]);
const alerts = readFileSync(args[3]);
const sites = readFileSync(args[4], "utf8");
let sent_routine = [];

if (typeof args[5] !== "undefined") {
    sent_routine = JSON.parse(readFileSync(args[5]));
}

const [json_parsed] = JSON.parse(json); // Note that PublicAlert.json is really wrapped in an array
const db_alerts = JSON.parse(alerts);
const dynaslope_sites = JSON.parse(sites);

const response = {};

try {
    response.candidate = checkCandidateTriggers(json_parsed, db_alerts);
} catch (err) {
    response.candidate = null;
    response.error = err;
    console.log(err);
}

console.log(JSON.stringify(response));

function checkCandidateTriggers (cache, ongoing) {
    const { alerts: all_alerts, invalids } = cache;
    const { latest, overdue, extended } = ongoing;
    const final = [];

    const [with_alerts, no_alerts] = separateWithAlertsToNoAlertsOnJSON(all_alerts);

    // Get all the latest and overdue releases on site
    const merged_arr = latest.concat(overdue);

    let return_arr = processEntriesWithAlerts(with_alerts, merged_arr, invalids);
    const invalid_entries = return_arr.filter(x => x.status === "invalid");
    final.push(...return_arr);

    return_arr = tagSitesForLowering(merged_arr, no_alerts);
    const [lowering_return, lowering_index] = return_arr;
    final.push(...lowering_return);

    return_arr = prepareSitesForExtendedRelease(extended, no_alerts);
    const [extended_return, extended_index] = return_arr;
    final.push(...extended_return);

    const excluded_index = [...lowering_index, ...extended_index];
    return_arr = prepareSitesForRoutineRelease(no_alerts, excluded_index, invalid_entries);
    final.push(...return_arr);

    return final;
}

function separateWithAlertsToNoAlertsOnJSON (alerts_arr) {
    const no_alerts = [];
    const with_alerts = [];
    alerts_arr.forEach((x) => {
        if (x.public_alert === "A0") no_alerts.push(x);
        else with_alerts.push(x);
    });
    return [with_alerts, no_alerts];
}

function processEntriesWithAlerts (with_alerts, merged_arr, invalids) {
    const return_arr = [];
    with_alerts.forEach((alert) => {
        let entry = alert;
        const { site_code, internal_alert } = entry;
        const entry_source = internal_alert.split("-")[1];

        // Set trigger/alert status to valid
        // if seen invalid, or partially invalid, overwrite it
        entry.status = "valid"; // Set trigger/alert status to valid
        entry.invalid_list = []; // initialize list of invalid triggers for dashboard showing

        const site_invalids = getAllInvalidTriggersForSite(invalids, site_code);

        let isValidButNeedsManual = false;
        site_invalids.forEach((invalid_entry) => {
            const alertIndex = merged_arr.findIndex(elem => elem.site_code === invalid_entry.site_code);
            const { alert: public_alert } = invalid_entry;

            // Get alerts sources from the alerts array and invalids array
            const invalid_trigger = invalid_entry.trigger_source;
            let alerts_source = entry_source.split("");
            alerts_source = alerts_source.map((x) => {
                let trig = null;
                switch (x.toUpperCase()) {
                    case "S": trig = "subsurface"; break;
                    case "R": trig = "rainfall"; break;
                    default: trig = null; break;
                }
                return trig;
            });

            alerts_source.forEach((source) => {
                if (source === invalid_trigger) {
                    // Bind this invalid trigger and source on alert
                    entry.invalid_list.push(invalid_entry);

                    // Check if alert exists on database
                    if (alertIndex === -1 && alerts_source.length === 1) {
                        entry.status = "invalid";
                    } else { entry.status = "partial"; }

                    let trigger_letter = null;
                    switch (source) {
                        case "subsurface": trigger_letter = "S"; break;
                        case "rainfall": trigger_letter = "R"; break;
                        default: trigger_letter = "Z"; break;
                    }

                    let isPresentOnProposedInternalAlert = false;
                    let isRpresent = false;
                    let isSpresent = -1;
                    if (alertIndex > -1) {
                        const { internal_alert_level } = merged_arr[alertIndex];
                        const temp = new RegExp(trigger_letter, "i");
                        isPresentOnProposedInternalAlert = internal_alert.search(temp);
                        isRpresent = internal_alert_level.includes("R");
                        isSpresent = internal_alert_level.search(/s/i);
                    }

                    if (alertIndex === -1 || isPresentOnProposedInternalAlert > -1) {
                        let return_obj = null;
                        if (source === "subsurface") {
                            // Check if alert exists on database already
                            if (isSpresent > -1) {
                                // If already exist and it has sensor that became invalid,
                                // recommend manual input
                                isValidButNeedsManual = true;
                            } else {
                                return_obj = adjustAlertLevelIfInvalidSensor(public_alert, entry);
                            }
                        } else if (source === "rainfall") {
                            // Check if alert exists on database already
                            if (isRpresent) {
                                // If already exist and it has rain that became invalid,
                                // recommend manual input
                                isValidButNeedsManual = true;
                            } else {
                                return_obj = adjustAlertLevelIfInvalidRain(entry);
                            }
                        }

                        if (return_obj !== null) {
                            const { invalid_index } = return_obj;
                            entry = Object.assign({}, entry, return_obj);
                            entry.triggers[invalid_index].invalid = true;
                        }
                    }
                }
            });
        });

        if (entry.internal_alert.length <= 3) entry.status = "invalid";

        if (!isValidButNeedsManual) {
            const return_obj = getLatestTrigger(entry);
            entry = Object.assign({}, entry, return_obj);
        }

        let forUpdating = true;
        // Check if alert entry is already updated on latest/overdue table
        const index = merged_arr.findIndex(elem => elem.site_code === entry.site_code);

        if (index !== -1) {
            // Tag the site on merged_arr as cleared
            // else if not, it is candidate for lowering already
            merged_arr[index].forRelease = true;

            const { data_timestamp, trigger_timestamp } = merged_arr[index];
            const { latest_trigger_timestamp, ts } = entry;

            if (moment(data_timestamp).isSame(ts)) {
                forUpdating = false;
            }

            if (moment(trigger_timestamp).isSameOrAfter(latest_trigger_timestamp)) {
                entry.latest_trigger_timestamp = "end";
                entry.trigger = "No new triggers";
            }

            if (isValidButNeedsManual) {
                entry.latest_trigger_timestamp = "manual";
                entry.trigger = "manual";
                entry.validity = "manual";
                entry.isManual = true;
            }
        }

        if (forUpdating) return_arr.push(entry);
    });

    return return_arr;
}

function getAllInvalidTriggersForSite (invalid_arr, site_code) {
    const site_invalids = [];
    for (let i = 0; i < invalid_arr.length; i += 1) {
        if (invalid_arr[i].site_code === site_code) { site_invalids.push(invalid_arr[i]); }
    }
    site_invalids.sort((a, b) => {
        if (a.alert > b.alert) return -1;
        return ((b.alert > a.alert) ? 1 : 0);
    });
    return site_invalids;
}

function adjustAlertLevelIfInvalidSensor (public_alert, entry) {
    const {
        internal_alert, subsurface: subsurface_alert,
        surficial: surficial_alert, triggers: retriggers
    } = entry;
    let public_alert_level,
        internal_alert_level,
        invalid_index;

    const isL2Available = getRetriggerIndex(retriggers, "L2");
    if (isL2Available > -1 && public_alert === "A3") {
        public_alert_level = "A2";
        internal_alert_level = internal_alert.replace(/S0*/g, "s").replace("A3", "A2");

        invalid_index = getRetriggerIndex(retriggers, "L3");
    } else {
        public_alert_level = "A1";
        internal_alert_level = internal_alert.replace(/[sS]0*/g, "");

        const hasSensorData = subsurface_alert.filter(x => x.alert !== "ND");
        if (hasSensorData === 0 && surficial_alert === "g0") internal_alert_level = internal_alert_level.replace(/A[1-3]/g, "ND");
        else internal_alert_level = internal_alert_level.replace(/A[1-3]/g, "A1");

        invalid_index = getRetriggerIndex(retriggers, "L2");
    }

    const obj = {
        public_alert: public_alert_level,
        internal_alert: internal_alert_level,
        invalid_index
    };

    return obj;
}

function getRetriggerIndex (retriggers, trigger) {
    const temp = retriggers.map(x => x.alert).indexOf(trigger);
    return temp;
}

function adjustAlertLevelIfInvalidRain (entry) {
    const { internal_alert, triggers: retriggers } = entry;

    // Rain trigger is plain invalid
    const internal_alert_level = internal_alert.replace(/R0*/g, "");
    const invalid_index = getRetriggerIndex(retriggers, "r1");

    const obj = {
        internal_alert: internal_alert_level,
        invalid_index
    };
    return obj;
}

function getLatestTrigger (entry) {
    const retriggers = entry.triggers;
    let max = null;
    for (let i = 0; i < retriggers.length; i += 1) {
        if (max == null || moment(max.ts).isBefore(retriggers[i].ts)) {
            max = retriggers[i];
        }
    }
    return {
        latest_trigger_timestamp: max.ts,
        trigger: max.alert
    };
}

function tagSitesForLowering (merged_arr, no_alerts) {
    const return_arr = [];
    const lowering_index = [];
    // Tag a site as candidate for lowering if it has alert
    // on site but already A0 on json
    merged_arr.forEach((site) => {
        if (typeof site.forRelease === "undefined") {
            const index = no_alerts.findIndex(elem => elem.site_code === site.site_code);
            let x = no_alerts[index];
            lowering_index.push(index);
            const { data_timestamp, internal_alert_level } = site;
            // Check if alert for site is A0 and not yet released
            if (!moment(data_timestamp).isSame(x.ts) && internal_alert_level !== "A0" && internal_alert_level !== "ND") {
                x = Object.assign({}, x, {
                    status: "valid",
                    latest_trigger_timestamp: "end",
                    trigger: "No new triggers",
                    validity: "end"
                });
                return_arr.push(x);
            }
        }
    });
    return [return_arr, lowering_index];
}

function prepareSitesForExtendedRelease (extended_sites, no_alerts) {
    const return_arr = [];
    const extended_index = [];
    extended_sites.forEach((site) => {
        const index = no_alerts.findIndex(elem => elem.site_code === site.site_code);
        if (index > -1) {
            let x = no_alerts[index];
            extended_index.push(index);

            const { data_timestamp, day } = site;
            const { ts } = x;
            // Check if alert for site is not yet released and not Day 0
            if (!moment(data_timestamp).isSame(ts) && day > 0) {
                // Check if JSON entry data timestamp is 11:30 for release
                if (moment(ts).hour() === 11 && moment(ts).minute() === 30) {
                    x = Object.assign({}, x, {
                        status: "extended",
                        latest_trigger_timestamp: "extended",
                        trigger: "extended",
                        validity: "extended"
                    });
                    return_arr.push(x);
                }
            }
        }
    });
    return [return_arr, extended_index];
}

function prepareSitesForRoutineRelease (no_alerts, excluded_index, invalid_entries) {
    // Outside array pertains to season group [season 1, season 2]
    // Inside arrays contains months (0 - January, 11 - December)
    const wet = [[0, 1, 5, 6, 7, 8, 9, 10, 11], [4, 5, 6, 7, 8, 9]];
    const dry = [[2, 3, 4], [0, 1, 2, 3, 10, 11]];

    const { ts: data_timestamp } = no_alerts[0];
    const datetime = moment(data_timestamp);
    const weekday = datetime.isoWeekday(); // 1 - Monday, 7 - Sunday
    let matrix = null;
    const return_arr = [];
    const routine_list = [];

    if (datetime.format("HH:mm") === "11:30") {
        if (weekday === 3) matrix = dry;
        else if (weekday === 2 || weekday === 5) matrix = wet;
    }

    if (matrix !== null) {
        const merged = [...no_alerts, ...invalid_entries];
        merged.forEach((entry, index) => {
            const { site_code, ts } = entry;
            const month = moment(ts).month();
            const { season } = dynaslope_sites.find(site => site.site_code === site_code);

            if (matrix[season - 1].includes(month)) {
                const is_sent = sent_routine.some(x => x.site_code === entry.site_code);
                let is_invalid = false;
                if (typeof entry.status !== "undefined" && entry.status === "invalid") is_invalid = true;
                let is_excluded = false;

                if (!is_sent) {
                    if (is_invalid) {
                        const { surficial: surficial_alert, subsurface: subsurface_alert } = entry;
                        let internal_alert = "A0";
                        if (subsurface_alert.length === 0) {
                            if (surficial_alert === "g0") internal_alert = "ND";
                        }
                        entry.internal_alert = internal_alert;
                    } else {
                        is_excluded = excluded_index.includes(index);
                    }

                    if (!is_excluded) {
                        routine_list.push(entry);
                    }
                }
            }
        });

        if (routine_list.length !== 0) {
            return_arr.push({
                site_code: "routine",
                ts: routine_list[0].ts,
                latest_trigger_timestamp: "routine",
                trigger: "routine",
                validity: "routine",
                routine_list
            });
        }
    }
    return return_arr;
}
