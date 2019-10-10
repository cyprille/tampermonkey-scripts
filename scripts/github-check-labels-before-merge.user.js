// ==UserScript==
// @name         GitHub Check Labels Before Merge
// @namespace    http://tampermonkey.net/
// @version      2.2.1
// @description  Prevent the merge button to be displayed when labels aren't as attended
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @author       Cyprille Chauvry
// @match        https://github.com/*/*/pull/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-check-labels-before-merge.user.js
// @downloadURL  https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-check-labels-before-merge.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ############## Customize your configuration here ############## //
    // Ignored base branch name (example: 'master')
    let ignoredBaseName = '';

    // Forbidden labels (example: ['WIP'])
    let forbiddenLabels = [];

    // Required labels (example: ['hacktoberfest'])
    let requiredLabels = [];

    // Refresh interval (ms) (example: 1000)
    let refreshInterval = 200;
    // ############################################################### //

    // Init
    var isLabelsValid = true;

    // Prevents the Tampermonkey editor from screaming about jQuery not loaded yet
    var $ = window.jQuery;

    // Main ref class selector
    let refSelector = 'div.TableObject-item--primary';

    // Current PR refs
    let baseRef = $(refSelector + ' span.base-ref a span').text();

    // Current PR state is 'Open'
    let isOpenPR = $('span.State').hasClass('State--green');

    // Starts the refreshing process
    setInterval(function() {
        check();
    }, refreshInterval);

    function check() {
        if (ignoredBaseName !== baseRef
            && true === isOpenPR
        ) {
            var prLabels = {};
            var forbiddenMessage = {};
            var requiredMessage = {};

            // Get the current PR labels
            $.each($('div.labels a.sidebar-labels-style'), function() {
                prLabels[this.text] = true;
            });

            // Checks the forbidden labels
            $(Object.keys(prLabels)).each(function(index, label) {
                if ($.inArray(label, forbiddenLabels) !== -1) {
                    forbiddenMessage[label] = '<p><strong style="color: #f44;">' + label + '</strong> is a forbidden label</p>';
                }
            });

            // Checks the required labels
            $.each(requiredLabels, function(index, label) {
                if ($.inArray(label, Object.keys(prLabels)) === -1) {
                    requiredMessage[label] = '<p><strong style="color: #6cc644;">' + label + '</strong> is a required label</p>';
                }
            });

            // By precaution, removes all the branch action item bloc
            $('div#branch-action-item').remove();

            // Displays why merge button is blocked (if so)
            if (Object.keys(forbiddenMessage).length > 0 || Object.keys(requiredMessage).length > 0) {
                isLabelsValid = false;

                var div = '<div id="branch-action-item" class="branch-action-item"><div class="branch-action-item-alert"><div class="branch-action-item-icon completeness-indicator completeness-indicator-problem"><svg class="octicon octicon-alert" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"></path></svg>'
                    + '</div><h3 class="h4 status-heading">This pull request has some label issues</h3><span class="status-meta">Please correct it before continuing.<br/><br/></span>' + Object.values(forbiddenMessage).join('') + Object.values(requiredMessage).join('') + '</div></div>';

                $('div.branch-action-item-alert').remove();
                $('div.merge-message').before(div);
            } else {
                isLabelsValid = true;
            }

            // Checks the merging strategy
            if (false === isLabelsValid) {
                // Disables merging button when labels are invalid
                $('div.select-menu div.BtnGroup button').each(function() {
                    $(this).prop("disabled", true);
                });

                // Disables select menu when labels are invalid
                $('div.merge-message').hide();
            } else {
                // Enables merging button when labels are valid
                $('div.select-menu div.BtnGroup button').each(function() {
                    $(this).removeAttr('disabled');
                    $(this).prop("disabled", false);
                });

                // Enables select menu when labels are valid
                $('div.merge-message').show();
            }
        }
    }
})();
