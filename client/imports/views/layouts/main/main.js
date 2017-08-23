import {Template} from "meteor/templating";
import "/client/imports/views/layouts/navigation/navigation";
import "/client/imports/views/layouts/top_navbar/top_navbar";
import "/client/imports/views/layouts/footer/footer.html";
import {Settings} from "/lib/imports/collections";
import Enums from "/lib/imports/enums";
import "./main.html";

const toastr = require('toastr');

const fixHeight = function () {
    const body = $("body");
    if (!body.hasClass('body-small')) {
        const pageWrapper = $('#page-wrapper');
        const navbarHeigh = $('nav.navbar-default').height();
        const wrapperHeigh = pageWrapper.height();

        if (navbarHeigh > wrapperHeigh) {
            pageWrapper.css("min-height", navbarHeigh + "px");
        }

        if (navbarHeigh < wrapperHeigh) {
            pageWrapper.css("min-height", $(window).height() + "px");
        }

        if (body.hasClass('fixed-nav')) {
            if (navbarHeigh > wrapperHeigh) {
                pageWrapper.css("min-height", navbarHeigh + "px");
            } else {
                pageWrapper.css("min-height", $(window).height() - 60 + "px");
            }
        }
    }
};

const doUIStuff = function () {
    const body = $("body");

    // Minimalize menu when screen is less than 768px
    $(window).bind("resize load", function () {
        if ($(this).width() < 769) {
            body.addClass('body-small')
        } else {
            body.removeClass('body-small')
        }

        fixHeight();
    });

    // Fix height of layout when resize, scroll and load
    $(window).bind("scroll", function () {
        fixHeight();
    });

    // set skin
    let skin = localStorage.getItem(Enums.LOCAL_STORAGE_KEYS.MONGOCLIENT_SKIN);
    if (skin && skin !== 'skin-default') body.addClass(skin);

    // set fixed-sidebar
    body.addClass('fixed-sidebar');
    $('.sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.9
    });

    // make nav resizable
    const nav = $('.navbar-static-side');
    const pageWrapper = $('#page-wrapper');

    nav.resizable();
    nav.on('resize', function () {
        pageWrapper.css('margin', '0 0 0 ' + nav.width() + 'px');
    });

    // Hack to enable multiple modals by making sure the .modal-open class
    // is set to the <body> when there is at least one modal open left
    body.on('hidden.bs.modal', function () {
        if ($('.modal.in').length > 0) {
            body.addClass('modal-open');
        }
    });
};

Template.mainLayout.rendered = function () {
    $(document).idleTimer(30 * 60 * 1000);
    $(document).on("idle.idleTimer", function () {
        //toastr.info('You are idle for 30 minutes :(', 'Idle');
    });
    $(document).on("active.idleTimer", function () {
        toastr.success('Welcome back !', 'We missed you');
    });

    doUIStuff();

    let settings = this.subscribe('settings');

    let initializedLiveChat = false;
    this.autorun(() => {
        if (settings.ready()) {
            const foundSettings = Settings.findOne();
            if (foundSettings && foundSettings.showLiveChat && !initializedLiveChat) {
                initializedLiveChat = true;
                liveChatFunc(window, window.nudgespot || []);
                window.nudgespot.init("748ae792d632f6c5e14ad610e53ef745");
            }
        }
    });

};

const liveChatFunc = function (d, n) {
    let s, a, p;
    s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = (document.location.protocol === "https:" ? "https:" : "http:") + "//cdn.nudgespot.com" + "/nudgespot.js";
    a = document.getElementsByTagName("script");
    p = a[a.length - 1];
    p.parentNode.insertBefore(s, p.nextSibling);
    window.nudgespot = n;
    n.init = function (t) {
        function f(n, m) {
            const a = m.split('.');
            2 == a.length && (n = n[a[0]], m = a[1]);
            n[m] = function () {
                n.push([m].concat(Array.prototype.slice.call(arguments, 0)))
            }
        }

        n._version = 0.1;
        n._globals = [t];
        n.people = n.people || [];
        n.params = n.params || [];
        let m = "track register unregister identify set_config people.delete people.create people.update people.create_property people.tag people.remove_Tag".split(" ");
        for (let i = 0; i < m.length; i++)f(n, m[i])
    }
};