$(document).ready(() => {
	console.log("CACHED VERSION #: "+localStorage['version']);
    $.get("../../versioning/getVersion", (data) => {
        var version = JSON.parse(data);
      	if (localStorage['version'] == null) {
			localStorage['version'] = version;
		} else if (localStorage['version'] != version) {
			localStorage['version'] = version;
			location.reload(true);
			console.log("Chatterbox updated successfully!");
		} else {
			console.log("Chatterbox up to date!");
		}
    });
});