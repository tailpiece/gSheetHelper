var send = null;
var receive = null;

// contentsで送信した値を受信
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        
        // 送信元からのイベントで、受信先も用意されている場合は、コピペ開始
        if ( sender.tab.id === send && receive) {
            chrome.tabs.sendMessage(receive, 
                { text: request.text }
            );
        }

        sendResponse({sender: sender.tab.id, send: send, receive: receive});
    }
);


// 現在の状況に応じてバッジの内容を変える
const setBadge = function() {
    let setText = "--";

    setText = (send) ? "O" : "-";
    setText += (receive) ? "K" : "-";
    chrome.browserAction.setBadgeText({text:setText});

    if (send && receive) {
        chrome.browserAction.setBadgeBackgroundColor({color:[0, 200, 0, 100]});
    } else if (send || receive) {
        chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 100]});
    } else {
        chrome.browserAction.setBadgeBackgroundColor({color:[200, 200, 200, 100]});
    }
    
}

// バッジを初期化
setBadge();

// アイコンをクリックした際の挙動
chrome.browserAction.onClicked.addListener(function (e) {
    const nowID = e.id;

    if(!send && receive !== nowID) {
        send = nowID;
        setBadge();
        return true;
    } else if (send === nowID) {
        send = null;
        setBadge();
        return true;
    }

    if(!receive) {
        receive = nowID;
        setBadge();
        return true;
    } else if (receive === nowID) {
        receive = null;
        setBadge();
        return true;
    }

});

