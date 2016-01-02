Template.mainLayout.rendered = function () {

    $(document).idleTimer(300000);
    $(document).on("idle.idleTimer", function () {
        toastr.info('You are idle for at least 30 seconds...', 'Idle');
    });
    $(document).on("active.idleTimer", function () {
        toastr.success('Welcome back !', 'You are back');
    });

    // Minimalize menu when screen is less than 768px
    $(window).bind("resize load", function () {
        if ($(this).width() < 769) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }
    });

    // Fix height of layout when resize, scroll and load
    $(window).bind("load resize scroll", function () {
        var body = $("body");
        if (!body.hasClass('body-small')) {

            var navbarHeigh = $('nav.navbar-default').height();
            var wrapperHeigh = $('#page-wrapper').height();

            if (navbarHeigh > wrapperHeigh) {
                $('#page-wrapper').css("min-height", navbarHeigh + "px");
            }

            if (navbarHeigh < wrapperHeigh) {
                $('#page-wrapper').css("min-height", $(window).height() + "px");
            }

            if (body.hasClass('fixed-nav')) {
                if (navbarHeigh > wrapperHeigh) {
                    $('#page-wrapper').css("min-height", navbarHeigh - 60 + "px");
                } else {
                    $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
                }
            }
        }
    });

    //$("body").addClass('light-navbar')


    // SKIN OPTIONS
    // Uncomment this if you want to have different skin option:
    // Available skin: (skin-1 or skin-3, skin-2 deprecated)
    //$('body').addClass('skin-1');

    // FIXED-SIDEBAR
    // Uncomment this if you want to have fixed left navigation
    // $('body').addClass('fixed-sidebar');
    // $('.sidebar-collapse').slimScroll({
    //     height: '100%',
    //     railOpacity: 0.9
    // });

    // BOXED LAYOUT
    // Uncomment this if you want to have boxed layout
    // $('body').addClass('boxed-layout');


};