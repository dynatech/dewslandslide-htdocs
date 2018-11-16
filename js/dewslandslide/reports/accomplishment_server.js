
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Ratchet websocket implementation on
 *  several site pages:
 *  - Accomplishment Report
 *
****/

const finalHostname = window.location.hostname.split(":");
const wsUri = `ws://${finalHostname[0]}:5070`;

console.log("WS Hostname");
console.log(wsUri);

let websocket;

const reconnect = 10000;
let isConnected = false;

$(document).ready(() => {
    $("#loading").modal("show");
    init();

    // AUTOMATION SCRIPTS
    /* $("#automation-row #alert_release, #automation-row #bulletin_sending").click(function () {
        let data = {
            "staff_name" : $("#user_name").text(),
            "staff_id" : $("#current_user_id").val()
        }

        if(this.checked) { data.switch = true; }
        else { data.switch = false; }

        if( this.id == "alert_release") doSend("toggleAutomatedAlertRelease", data);
        else doSend("toggleAutomatedBulletinSending", data);
    });*/
});

function init () {
    if (browserSupportsWebSockets() === false) {
        console.log("Sorry! your web browser does not support WebSockets. Try using Google Chrome or Firefox Latest Versions");
        return;
    }

    websocket = new WebSocket(wsUri);

    websocket.onopen = function () {
        console.log(`ACCOMPLISHMENT SERVER: CONNECTION TO ${wsUri} has been successfully established`);

        isConnected = true;
        /* doSend("sendIdentification", {"name" : $("#user_name").text(), "staff_id": $("#current_user_id").val()});*/
        $("#loading").modal("hide");

        // if (window.timerID) {
        //     window.clearInterval(window.timerID);
        //     window.timerID = 0;
        // }
    };

    websocket.onmessage = function (evt) {
        onMessage(evt);
    };

    websocket.onerror = function (evt) {
        onError(evt);
    };

    websocket.onclose = function (evt) {
        isConnected = false;
        onClose(evt);
    };
}

function onClose (evt) {
    websocket.close();
    console.log("ACCOMPLISHMENT SERVER: DISCONNECTED");
    waitForConnection();
}

function onMessage (evt) {
    const data = JSON.parse(evt.data);
    const code = data.code;
    const pathname = window.location.pathname;

    console.log("ACCOMPLISHMENT SERVER: onMessage Event Fired");
    console.log("RESPONSE:", data);

    if (code == "sendConnectionID") { setConnectionID(data.connection_id); }
}

function onError (evt) {
    console.log("ACCOMPLISHMENT SERVER: ERROR:", evt.data);
}

function getCurrentDate () {
    var now = new Date();
    var datetime = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    datetime += ` ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    return datetime;
}

function browserSupportsWebSockets () {
    if ("WebSocket" in window) {
        return true;
    }

    return false;
}

function doSend (code, data) {
    const x = typeof data === "undefined" ? null : data;
    const message = {
        code,
        data: x
    };
    websocket.send(JSON.stringify(message));
    console.log("ACCOMPLISHMENT SERVER: onSend Event Fired");
    console.log(`SENT: ${code}`);
}

function waitForConnection () {
    $("#loading").modal("hide");
    if (!isConnected) {
        setTimeout(() => {
            if (websocket.readyState === 1) {
                console.log(`Connection to ${wsUri} has been successfully established`);
                isConnected = true;
            } else {
                console.log("Connection to DASHBOARD SERVER lost... Reconnecting...");
                init();
            }
        }, reconnect);
    }
}

//* **** AUTOMATION FUNCTIONS ******//
