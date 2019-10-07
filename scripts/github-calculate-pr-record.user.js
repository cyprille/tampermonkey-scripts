// ==UserScript==
// @name         GitHub calculates PR Wall of Fame
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculates if a Wizaplace Wall of Fame record has been set
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @author       Cyprille Chauvry
// @match        https://github.com/wizaplace/*/pull/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-calculate-pr-record.user.js
// @downloadURL  https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-calculate-pr-record.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ############## Customize your configuration here ############## //
    // Refresh interval (ms) (example: 1000)
    let refreshInterval = 1000;

    // Watched repositories to start calculations (example: ['wizaplace'])
    let watchedRepositories = [];

    // Update message for records (example: You should <a href="https://docs.google.com/spreadsheets/d/1qAfK-QfusljE_cmiyiIXA6uinQfv8SGcKywyT_Kv-Ls/edit#gid=0" title="Wall of Fame" target="_blank">update the wall of fame!</a>)
    let updateMessage = 'You should update the wall of fame!';

    // Stats
    let maxFiles = 0;
    let maxLines = 0;
    let maxComments = 0;
    let maxFilesDirectlyApproved = 0;
    let maxLinesDirectlyApproved = 0;
    let shittyRatioFiles = 0;
    let shittyRatioLines = 0;
    // ############################################################### //

    // Init
    let watchedRepo = false;

    // Prevents the Tampermonkey editor from screaming about jQuery not loaded yet
    var $ = window.jQuery;

    // Current PR repo name
    let repoName = $('.repohead-details-container h1 strong a').text();

    // Current PR state is 'Merged'
    let isMergedPR = $('span.State').hasClass('State--purple');

    // Current PR files number
    let prFiles = parseInt($.trim($('#files_tab_counter').text()));

    // Current PR lines number
    let prLines = parseInt($.trim($('#diffstat span.text-green').text()).replace('+', '')) + parseInt($.trim($('#diffstat span.text-red').text()).replace('−', ''));

    // Current PR comments number
    let prComments = parseInt($.trim($('#conversation_tab_counter').text()));

    // Current PR ratio files
    let prRatioFiles = prFiles / prComments;

    // Current PR ratio lines
    let prRatioLines = prLines / prComments;

    // Starts the refreshing process
    setInterval(function() {
        check();
    }, refreshInterval);

    // Checks if repo is watched
    $(Object.values(watchedRepositories)).each(function(index, repo) {
        if (repo === repoName) {
            watchedRepo = true;
        }
    });

    function check() {
        if (true === watchedRepo) {
            let messages = [];

            if (prFiles > maxFiles) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Maximum number of files ' + maxFiles + ' => ' + prFiles + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (prLines > maxLines) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Maximum number of lines ' + maxLines + ' => ' + prLines + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (prComments > maxComments) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Maximum number of comments ' + maxComments + ' => ' + prComments + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (0 === prComments && true === isMergedPR && prFiles > maxFilesDirectlyApproved) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Maximum files directly approved ' + maxFilesDirectlyApproved + ' => ' + prFiles + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (0 === prComments && true === isMergedPR && prLines > maxLinesDirectlyApproved) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Maximum lines directly approved ' + maxLinesDirectlyApproved + ' => ' + prLines + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (prRatioFiles > shittyRatioFiles) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Shitty ratio files ' + shittyRatioFiles + ' => ' + prRatioFiles + '</strong></p><p>' + updateMessage + '</p>');
            }

            if (prRatioLines > shittyRatioLines) {
                messages.push('<p>A new record has been broken: <strong style="color: #f44;">Shitty ratio lines ' + shittyRatioLines + ' => ' + prRatioLines + '</strong></p><p>' + updateMessage + '</p>');
            }

            // If a new record has been broken!
            if (messages.length > 0) {
                // Creates the flash div
                var div = '<div id="">';

                $.each(messages, function(index, message) {
                    // Displays the record
                    div += '<div class="flash flash-full flash-success"><div class="container">' + message + '</div></div>';
                });

                // Ends the flash div
                div += '</div>';

                // Displays a flash message with PR broken record
                $('#js-flash-container').html(div);
            }
        }
    }
})();
