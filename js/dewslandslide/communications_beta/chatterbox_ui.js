let OPTIONS_STATUS = "hidden";
let QUICK_ACCESS_STATUS = "hidden";
$(document).ready(() => {
	initializeChatterboxPanelBehavior();
	initializeOnClickShowPanelButton();
});

function initializeChatterboxPanelBehavior(){
	$("#recent-activity-panel").show();
	$("#quick-access-panel").hide();
	$("#conversation-panel").hide();
}

function initializeOnClickShowPanelButton(){
	// $("#go-to-conversation").click(() => {
	// 	$("#recent-activity-panel").hide(400);
	// 	$("#quick-access-panel").hide(400);
	// 	$("#conversation-panel").show(400);
	// });

	$("#go-to-recent-activity").click(() => {
		$("#recent-activity-panel").show(400);
		// $("#quick-access-panel").show(400);
		$("#conversation-panel").hide(400);
	});

	$("#options").click(() => {
		if(OPTIONS_STATUS == "hidden"){
			$("#options-panel").show(400);
			OPTIONS_STATUS = "showed";
			$("#options").css("color", "#F8991D");
		}else {
			$("#options-panel").hide(400);
			OPTIONS_STATUS = "hidden"
			$("#options").css("color", "white");
		}
		
	});

	$("#go-to-quick-access ,#hide-quick-access").click(() => {
		if(QUICK_ACCESS_STATUS == "hidden"){
			$("#quick-access-panel").show(400);
			$("#messages-panel").hide(400);
			QUICK_ACCESS_STATUS = "showed";
			// $("#go-to-quick-access").css("color", "#F8991D");
			// $("#hide-quick-access").css("color", "#F8991D");
		}else {
			$("#quick-access-panel").hide(400);
			$("#messages-panel").show(400);
			QUICK_ACCESS_STATUS = "hidden"
			// $("#go-to-quick-access").css("color", "white");
			// $("#hide-quick-access").css("color", "white");
		}
		
	});
}