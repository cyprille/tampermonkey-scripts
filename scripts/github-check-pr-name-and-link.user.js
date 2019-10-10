// ==UserScript==
// @name         GitHub check PR name and link
// @namespace    http://tampermonkey.net/
// @version      1.11.0
// @description  Controls if the PR have a valid link in description, a normalized name and a normalized branch name
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @author       Cyprille Chauvry
// @match        https://github.com/*/*/pull/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @connect      atlassian.net
// @updateURL    https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-check-pr-name-and-link.user.js
// @downloadURL  https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-check-pr-name-and-link.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ############## Customize your configuration here ############## //
    // Ignored head branch name (example: 'develop')
    let ignoredHeadName = '';

    // Refresh interval (ms) (example: 1000)
    let refreshInterval = 200;

    // Valid PR name regex (example: '[a-zA-Z]{2,5}-([0-9]{2,}) .+')
    let prNamePattern = '';

    // Valid PR link regex (example: '[a-zA-Z]{2,5}')
    let linkPattern = '';

    // Valid PR URL regex (example: '^https://github.com/awesome-orga/[a-zA-Z0-9-]+/pull/[0-9]+$')
    let urlPattern = '';

    // Valid branch name regex (example: '[a-zA-Z]{2,5}-([0-9]+)')
    let branchNamePattern = '';

    // Valid link text (example: 'Ticket link')
    let validLinkText = '';

    // Link Name (example: 'Ticket link')
    let linkName = '';

    // Blacklisted repositories (example: ['awesome-repo'])
    let reposBlacklist = [];

    // Branch name error message suffix
    let branchNameErrorSuffix = 'It doesn\'t respects <a href="https://github.com/wizaplace/wizaplace/wiki/Nomenclature-GIT">Git nomenclature</a>';
    // ############################################################### //

    // Init
    let blacklistedRepo = false;

    // Prevents the Tampermonkey editor from screaming about jQuery not loaded yet
    var $ = window.jQuery;

    // Current PR state is 'Open'
    let isOpenPR = $('span.State').hasClass('State--green');

    // Main ref class selector
    let refSelector = 'div.TableObject-item--primary';

    // Current PR refs
    let headRef = $(refSelector + ' span.head-ref a span').text();

    // Current PR repo name
    let repoName = $('.repohead-details-container h1 strong a').text();

    // Starts the refreshing process
    setInterval(function() {
        check();
    }, refreshInterval);

    // Checks if repo is blacklisted
    $(Object.values(reposBlacklist)).each(function(index, repo) {
        if (repo === repoName) {
            blacklistedRepo = true;
        }
    });

    function check() {
        // Checks the URL to load or not this extension
        let urlRegex = RegExp(urlPattern);
        let pageMatch = urlRegex.test(window.location.href);

        if (true === pageMatch
            && false === blacklistedRepo
            && ignoredHeadName !== headRef
            && true === isOpenPR
        ) {
            let prName = $('.js-issue-title').html();
            let prNameRegex = RegExp(prNamePattern);
            let branchNameRegex = RegExp(branchNamePattern);
            let linkRegex = RegExp(linkPattern);
            var hasLinkText = false;
            var hasValidLink = false;
            var forbiddenMessage = '';
            var linkIds = [];

            // Current PR refs
            let headRef = $(refSelector + ' span.head-ref a span').text();

            // Gets all links in description
            $('.comment-body').find('a').each(function() {
                // Checks the link text presence
                if (validLinkText === $(this).html()) {
                    hasLinkText = true;

                    if (true === linkRegex.test($(this).attr('href'))) {
                        hasValidLink = true;

                        // Gets the link Id
                        linkIds.push(linkRegex.exec($(this).attr('href'))[1]);
                    }
                }
            });

            // Checks the PR issues
            if (false === branchNameRegex.test(headRef)) {
                forbiddenMessage = '<p><strong style="color: #f44;">Branch name</strong> ' + branchNameErrorSuffix + '</p>';
            } else if (false === prNameRegex.test(prName)) {
                forbiddenMessage = '<p><strong style="color: #f44;">PR name</strong> is invalid</p>';
            } else if (false === hasLinkText) {
                forbiddenMessage = '<p><strong style="color: #f44;">' + linkName + '</strong> is not defined</p>';
            } else if (false === hasValidLink) {
                forbiddenMessage = '<p><strong style="color: #f44;">' + linkName + '</strong> is invalid</p>';
            } else {
                // Checks that the branch ID is in sync with link ID and PR name ID
                let nameMatch = prNameRegex.exec(prName);
                let nameId = nameMatch[1];
                let branchMatch = branchNameRegex.exec(headRef);
                let branchId = branchMatch[2];

                if (nameId !== branchId || ($.inArray(branchId, linkIds) === -1)) {
                    forbiddenMessage = '<p><strong style="color: #f44;">IDs in PR\'s name, branch and link</strong> are not synced</p>';
                }
            }

            // By precaution, removes all the branch action item bloc
            $('div#branch-action-item').remove();

            // Clean the flash messages for this script
            $('#pr-name-and-link').remove();

            // Displays why merge button is blocked (if so)
            if (forbiddenMessage !== '') {
                // Displays a flash message with PR issues
                $('#js-flash-container').append('<div id="pr-name-and-link" class="need-sorting "><div id="pr-records" class="flash flash-full flash-error"><div class="container">' + forbiddenMessage + '</div></div></div>');

                // Sorts the divs inside the flash container to prevent side effects
                $('.need-sorting').sort(function(a, b) {
                    if (a.textContent < b.textContent) {
                        return -1;
                    } else {
                        return 1;
                    }
                }).appendTo('#js-flash-container');

                // Creates the div to append to the merging block
                var div = '<div id="branch-action-item" class="branch-action-item"><div class="branch-action-item-alert"><div class="branch-action-item-icon completeness-indicator completeness-indicator-problem"><svg class="octicon octicon-alert" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"></path></svg>'
                    + '</div><h3 class="h4 status-heading">This pull request has some validity issues</h3><span class="status-meta">Please correct it before continuing.<br/><br/></span>' + forbiddenMessage + '</div></div>';

                // Removes the branch action bloc
                $('div.branch-action-item-alert').remove();
                $('div.merge-message').before(div);

                // Disables merging button when link or name are invalid
                $('div.select-menu div.BtnGroup button').each(function() {
                    $(this).prop("disabled", true);
                });

                // Disables select menu when link or name are invalid
                $('div.merge-message').hide();
            } else {
                // Enables merging button when link or name are valid
                $('div.select-menu div.BtnGroup button').each(function() {
                    $(this).removeAttr('disabled');
                    $(this).prop("disabled", false);
                });

                // Enables select menu when link or name are valid
                $('div.merge-message').show();
            }
        }
    }
})();
