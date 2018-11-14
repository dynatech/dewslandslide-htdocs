
$(document).ready(() => {
    (($) => {
        const $navbar = $("#navigation");
        const y_pos = $navbar.offset().top;

        $(document).scroll(function () {
            const scrollTop = $(this).scrollTop();

            if (scrollTop > y_pos) {
                $navbar.addClass("sticky");
                $navbar.find("#links").addClass("col-sm-8");
                $navbar.find("#logo").show();
                $("#page-wrapper").addClass("sticky-wrapper");
            } else if (scrollTop <= y_pos) {
                $navbar.removeClass("sticky");
                $navbar.find("#links").removeClass("col-sm-8").clearQueue();
                $navbar.find("#logo").hide();
                $("#page-wrapper").removeClass("sticky-wrapper");
            }
        });
    })(jQuery, undefined);
    
    // Instantiate All Dropdown Instances
    $(".dropdown-toggle").dropdown();

    $("body").on("hide.bs.collapse", ".panel", ({ target }) => {
        $(target).css("padding-bottom", 0);
    });

    $("body").on("show.bs.collapse", ".panel", ({ target }) => {
        $(target).css("padding-bottom", 8);
    });

    (($) => {
        $(".container-line-text.timeline-head-text").each((i, elem) => {
            recenterTimelineHeadText();
        });
    })(jQuery, undefined);
});

function recenterTimelineHeadText () {
    $(".container-line-text.timeline-head-text").each((i, elem) => {
        const width = $(elem).outerWidth();
        const parent_width = $(elem).parent().width();
        $(elem).css("left", (parent_width / 2) - (width / 2));
    });
}
