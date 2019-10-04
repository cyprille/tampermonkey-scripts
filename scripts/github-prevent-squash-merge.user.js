// ==UserScript==
// @name         GitHub prevent squash merge
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Prevent the merge button to be displayed depending on branch names
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @author       Cyprille Chauvry
// @match        https://github.com/wizaplace/wizaplace/pull/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-prevent-squash-merge.user.js
// @downloadURL  https://raw.githubusercontent.com/cyprille/tampermonkey-scripts/master/scripts/github-prevent-squash-merge.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ############## Customize your configuration here ############## //
    // Watched branch names
    let baseName = 'master';
    let headName = 'develop';

    // Refresh interval (ms)
    let refreshInterval = 200;
    // ############################################################### //

    // Prevents the Tampermonkey editor from screaming about jQuery not loaded yet
    var $ = window.jQuery;

    // Main ref class selector
    let refSelector = 'div.TableObject-item--primary';

    // Starts the refreshing process
    setInterval(function() {
        check();
    }, refreshInterval);

    function check()
    {
        // Current PR refs
        let baseRef = $(refSelector + ' span.base-ref a span').text();
        let headRef = $(refSelector + ' span.head-ref a span').text();

        // Current PR State is 'Open'
        let isOpenPR = $('span.State').hasClass('State--green');

        // Current merging strategy is 'merge'
        let isMerging = $('div#partial-pull-merging .merge-pr').hasClass('is-merging');

        if (baseName === baseRef
            && headName === headRef
            && true === isOpenPR
        ) {
            // Checks the merging strategy
            if (false === isMerging) {
                // Hides options from merging menu when different from simple merge
                $('.select-menu-merge-method div button').each(function() {
                    if ('merge' !== this.value) {
                        this.hidden = true;
                    }
                });

                // Disables merging button when different from simple merge
                $('div.select-menu div.BtnGroup button').each(function() {
                    if ('merge' !== this.value
                        && ! $(this).hasClass('btn-group-merge')
                    ) {
                        $(this).prop("disabled", true);
                    }
                });
            }
        }
    }
})();
