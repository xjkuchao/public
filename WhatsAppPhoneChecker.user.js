// ==UserScript==
// @name         WhatsAppPhoneChecker
// @namespace    https://github.com/xjkuchao/public/
// @version      0.2
// @description  check phone number is on whatsapp or not
// @author       tyler (xjkuchao@gmail.com)
// @match        https://web.whatsapp.com
// @downloadURL  https://github.com/xjkuchao/public/raw/main/WhatsAppPhoneChecker.user.js
// @updateURL    https://github.com/xjkuchao/public/raw/main/WhatsAppPhoneChecker.user.js
// @grant        GM_xmlhttpRequest
// @connect      api.bywdks.com
// @require  	 https://code.jquery.com/jquery-3.7.1.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

(async function () {
    'use strict';

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    function postResult(prefix, number, status) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://api.bywdks.com/postNumber",
            data: JSON.stringify({
                source: 'whatsapp',
                prefix: prefix,
                number: number,
                status: status
            }),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            },
            responseType: 'json',
            onload: function (res) {
                console.log("post result", res.response);
            }
        });
    }

    function check() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://api.bywdks.com/getNumber?source=whatsapp&prefix=0",
            headers: {
                "Accept": "application/json, text/plain, */*"
            },
            responseType: 'json',
            onload: async function (res) {
                console.log(res);
                if (res.response.code != 0) {
                    console.log(res.response.message);
                    if (res.response.code == 400) {
                        // lock failed, wait 300ms
                        setTimeout(check, 300);
                    } else if (res.response.code == 404) {
                        // no more number, wait 30s
                        setTimeout(check, 30000);
                    } else {
                        // unknow error, wait 5s
                        setTimeout(check, 5000);
                    }

                    return;
                }

                let number = "+" + res.response.data.prefix + res.response.data.number;
                console.log(number);

                let newChatContainer = document.createElement("div");
                document.getElementById("pane-side").insertBefore(newChatContainer, document.getElementById("pane-side").firstChild);

                let link = document.createElement("a");
                link.href = "whatsapp://send/?phone=" + res.response.data.prefix + res.response.data.number;
                console.log(link.href);
                newChatContainer.insertBefore(link, newChatContainer.firstChild);
                link.click();
                await sleep(300);

                while (true) {
                    let errorElement = document.querySelector('[data-animate-modal-body="true"]');
                    if (errorElement) {
                        if (errorElement.firstChild.textContent.indexOf("开始对话") != -1) {
                            await sleep(100);
                            continue;
                        } else if (errorElement.firstChild.textContent.indexOf("url") != -1) {
                            console.log('not exists');
                            postResult(res.response.data.prefix, res.response.data.number, 0);
                            break;
                        } else {
                            console.log('unknow1');
                            break;
                        }
                    } else {
                        console.log('exists');
                        postResult(res.response.data.prefix, res.response.data.number, 1);
                        break;
                    }
                }

                newChatContainer.parentNode.removeChild(newChatContainer);

                setTimeout(check, 50);
            }
        });

        //setTimeout(check, 50);
    }

    waitForKeyElements("#side", check);
})();
