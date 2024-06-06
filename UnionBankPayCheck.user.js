// ==UserScript==
// @name         UnionBankPayCheck
// @namespace    https://github.com/xjkuchao/public/
// @version      0.1
// @description  UnionBank pay check
// @author       tyler (xjkuchao@gmail.com)
// @match        https://business.unionbankph.com/corporate-app-shell/home*
// @downloadURL  https://github.com/xjkuchao/public/raw/main/UnionBankPayCheck.user.js
// @updateURL    https://github.com/xjkuchao/public/raw/main/UnionBankPayCheck.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @require  	 https://code.jquery.com/jquery-3.7.1.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

(async function () {
    'use strict';

    function getCookie(name) {
        var cookie_name = name + "=";
        var cookie_array = document.cookie.split(';');
        for (var i = 0; i < cookie_array.length; i++) {
            var cookie = cookie_array[i].trim();
            if (cookie.indexOf(cookie_name) == 0) {
                return cookie.substring(cookie_name.length, cookie.length);
            }
        }
        return "";
    }

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    function getResults(page, size) {
        var url = `https://business.unionbankph.com/corporate-app-shell/web-api/v4/notifications/logs?page=${page}&size=${size}`;
        const token = getCookie("ACCESS_TOKEN");

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": "Bearer " + token
            },
            responseType: 'json',
            onload: function (res) {
                console.log("get results", res.response);
            }
        });
    }

    async function check() {
        // const cookies = getCookie("ACCESS_TOKEN");
        // console.log(cookies);

        getResults(0, 5);

        setTimeout(check, 3000);
    }

    // waitForKeyElements("#side", check);
    check();
})();
