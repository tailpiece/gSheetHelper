// ドキュメントのどこがクリックされても発火
document.addEventListener('click', onClickEvent, true);
 
function onClickEvent(event) {
    // スプレッドシートの、入力欄に表示されている文字列を取得
    const txt = $("#t-formula-bar-input").find(".cell-input").text();

    // backgroundに送信
    chrome.runtime.sendMessage({ text: txt }, function(res){
        // backgroundから帰ってきた値を確認し、送信元と送信先がセットされていた場合、コピーを行う
        if(res.sender === res.send  && res.receive) {
            document.addEventListener("copy" , listener);
            document.execCommand("copy");
        }
    });
}

// クリップボードイベントを上書き（なんかあんまり上手くできていない・・・？）
const listener = function(e){
    // スプレッドシートの、入力欄に表示されている文字列を取得
    const txt = $("#t-formula-bar-input").find(".cell-input").text();

    e.clipboardData.setData("text/plain", txt);
    e.preventDefault();
    document.removeEventListener("copy", listener);
};


function triggerEvent(element, event) {
    if (document.createEvent) {
        // IE以外
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type, bubbling, cancelable
        return element.dispatchEvent(evt);
    } else {
        // IE
        var evt = document.createEventObject();
        return element.fireEvent("on"+event, evt)
    }
}


// 受信側
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    // console.info(message, sender, sendResponse);
/*
    // 現在、key_eventがスプレッドシートにtriggerできていないのでコメントアウト
    var key_event = $.Event('KeyPress'); 
        key_event.keyCode = (message.key) ? message.key : 40;
        key_event.which = (message.key) ? message.key : 40;
*/
    // console.info( key_event );

    if(message.key) {
        // $(document).trigger(key_event);
        // triggerEvent(document, key_event);
        document.execCommand("copy");
    }

    // テキストの内容があった場合、少し待ってからペースト
    if(message.text != "" && !message.key) {
        // triggerEvent(document, key_event);
        // $(document).trigger(key_event);

        setTimeout(function(){
            document.execCommand("paste");
        }, 200);
    }
});
