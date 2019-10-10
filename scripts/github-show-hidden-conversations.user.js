// ==UserScript==
// @name         GitHub show hidden conversations
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Change box's color to red and shake him when you scroll
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @author       BaBeuloula
// @match        https://github.com/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @resource     animateCSS https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css
// @updateURL    https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-show-hidden-conversations.user.js
// @downloadURL  https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-show-hidden-conversations.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Prevents the Tampermonkey editor from screaming about jQuery not loaded yet
    var $ = window.jQuery;

    // GM_addStyle("https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css");
    let animateCSS = GM_getResourceText("animateCSS");
    GM_addStyle(animateCSS);
    GM_addStyle(".ajax-pagination-form .Box, .ajax-pagination-form .Box button { background-color: #cb2431 !important; color: white !important }");

    $(window).on('scroll', function () {
        let trigger = $(window).scrollTop() + $(window).height() - 150;

        // Loop through elements we're affecting
        $(".ajax-pagination-form .Box").each(function(index, elem) {
            let elementOffset = $(elem).offset().top;

            if(elementOffset < trigger) {
                $(elem).addClass('animated tada');
                $(elem).on('animationend', function () {
                    $(this).removeClass('tada');
                });
            }
        });
    });
})();

