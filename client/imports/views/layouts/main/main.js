import {Template} from 'meteor/templating';

import '/client/imports/views/layouts/navigation/navigation.html';
import '/client/imports/views/layouts/top_navbar/top_navbar.html';
import '/client/imports/views/layouts/footer/footer.html';
import './main.html';

const toastr = require('toastr');

Template.mainLayout.rendered = function () {

    $(document).idleTimer(30 * 60 * 1000);
    $(document).on("idle.idleTimer", function () {
        toastr.info('You are idle for 30 minutes :(', 'Idle');
    });
    $(document).on("active.idleTimer", function () {
        toastr.success('Welcome back !', 'We missed you');
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
};