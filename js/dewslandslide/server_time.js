$(document).ready(function(){
	setInterval('updateClock()', 500);
});

function updateClock() {
	$.get( "../../../utilities/getServerTime", function( data ) {
		var time = JSON.parse(data);
		$('#server-time').text(time);
	});
}