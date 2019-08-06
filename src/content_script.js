// ドキュメントのどこがクリックされても発火
document.addEventListener('click', onClickEvent, true);
 
function onClickEvent(event) {
    // スプレッドシートの、入力欄に表示されている文字列を取得
    const txt = $("#t-formula-bar-input").find(".cell-input").text();

    // クリップボードイベントを上書き（なんかあんまり上手くできていない・・・？）
    const listener = function(e){
        e.clipboardData.setData("text/plain" , txt);
        e.preventDefault();
        document.removeEventListener("copy", listener);
    };

    // backgroundに送信
    chrome.runtime.sendMessage({ text: txt }, function(res){
        // backgroundから帰ってきた値を確認し、送信元と送信先がセットされていた場合、コピーを行う
        if(res.sender === res.send  && res.receive) {
            document.addEventListener("copy" , listener);
            document.execCommand("copy");
        }
    });
}

// 受信側
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // テキストの内容があった場合、少し待ってからペースト
    if(message.text != "") {
        setTimeout(function(){
            document.execCommand("paste");

            // イベント発動時に「下矢印キーを押す」の登録
            var key_event = $.Event('keyup'); 
            key_event.keyCode = 40;
            $(document).trigger(key_event);

        }, 100);
    }

    return;
});