$(document).ready(function() {

	autoresize();
	chatterboxLoader();
	$(window).on('resize',function(){
		autoresize();
	});

	function autoresize(){
		var division_height = $(window).height()-120;
		$('.division').css({"height": division_height});
		$('.division').css({"max-height": division_height});
		$('#quick-inbox-display').css({"height": division_height-158});
		$('#quick-inbox-unknown-display').css({"height": division_height-158});
		$('#quick-event-inbox-display').css({"height": division_height-158});
		$('#quick-release-display').css({"height": division_height-79});
		$('#group-message-display').css({"height": division_height-272});
		$('.chat-message').css({"height": division_height-280});
		$('.activity-body').css({"height": division_height-33});
	}

	function chatterboxLoader () {
		// Wrap every letter in a span
		$('.ml2').each(function(){
		  $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
		});

		anime.timeline({loop: true})
		  .add({
		    targets: '.ml2 .letter',
		    scale: [4,1],
		    opacity: [0,1],
		    translateZ: 0,
		    easing: "easeOutExpo",
		    duration: 950,
		    delay: function(el, i) {
		      return 70*i;
		    }
		  }).add({
		    targets: '.ml2',
		    opacity: 0,
		    duration: 1000,
		    easing: "easeOutExpo",
		    delay: 1000
		  });
	}
});

