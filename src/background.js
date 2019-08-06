let send = null;
let receive = null;
let sendWindow = null;
let receiveWindow = null;
let sendWindowFullScreen = false;
let receiveWindowFullScreen = null;

// contentsで送信した値を受信
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        
        // コピーするための判断情報を、元のタブに送信する
        sendResponse({sender: sender.tab.id, send: send, receive: receive});

        // 送信元からのイベントで、受信先も用意されている場合は、ペースト 開始
        if ( sender.tab.id === send && receive) {

            // コピー後に、コピー先にフォーカスするかどうか
            // chrome.tabs.update(receive, {active: true});
            // chrome.windows.update(receiveWindow, {focused: true});

            chrome.tabs.sendMessage(receive, 
                { text: request.text, receive: receive, key: false }
            );
        }
    }
);


chrome.commands.onCommand.addListener(function(command) {
    // console.log('onCommand: ', command);

    if ( receive ) {

        let keyCode = 0;
        switch(command){
            case "myCommand1": //up
                keyCode = 38;
                
                chrome.tabs.getSelected(window.id, function (tab) {
                    let mode = false;
                    if (send && tab.id === send) {
                        sendWindowFullScreen = !sendWindowFullScreen;
                        mode = sendWindowFullScreen;
                    } else if (receive && tab.id === receive) {
                        receiveWindowFullScreen = !receiveWindowFullScreen;
                        mode = receiveWindowFullScreen;
                    } else {
                        return;
                    }

                    const stateString = (mode) ? "maximized" : "normal";
                    chrome.windows.update(tab.windowId, {state: stateString});
                });

                break;

            case "myCommand2": //down
                keyCode = 40;

                if ( send && receive) {

                    // コピー
                    chrome.tabs.sendMessage(send, 
                        { key: keyCode }
                    );

                    // コピー後に、コピー先にフォーカスするかどうか
                    // chrome.tabs.update(receive, {active: true});
                    // chrome.windows.update(receiveWindow, {focused: true});

                    // ペースト
                    chrome.tabs.sendMessage(receive, 
                        { text: "text", receive: receive, key: false }
                    );
                }

                break; 

            case "myCommand3": //left
                keyCode = 37;
                chrome.tabs.update(send, {active: true});
                chrome.windows.update(sendWindow, {focused: true});
                break; 

            case "myCommand4": //right
                keyCode = 39;
                chrome.tabs.update(receive, {active: true});
                chrome.windows.update(receiveWindow, {focused: true});
                break;

            default:
                break;
        }

        
    }
});

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
    // console.info(e);
    const nowID = e.id;
    const nowWinID = e.windowId;

    if(!send && receive !== nowID) {
        send = nowID;
        sendWindow = nowWinID;
        setBadge();
        return true;
    } else if (send === nowID) {
        send = null;
        sendWindow = null;
        setBadge();
        return true;
    }

    if(!receive) {
        receive = nowID;
        receiveWindow = nowWinID;
        setBadge();
        return true;
    } else if (receive === nowID) {
        receive = null;
        receiveWindow = null;
        setBadge();
        return true;
    }

});

