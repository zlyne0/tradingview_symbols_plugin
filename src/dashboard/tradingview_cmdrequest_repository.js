const defaultStatusesListeners = {
    onStart: () => {},
    onLoad: () => {},
    onError: () => {}
};

export function downloadRedList(onResponse, statusesListeners = defaultStatusesListeners) {
    statusesListeners.onStart();

    fetch("https://www.tradingview.com/api/v1/symbols_list/colored/red")
        .then(response => {
//            console.log("status", response.status);
//            console.log(response);
            if (response.status == 200) {
                response.json().then(responseBody => {
                    onResponse(responseBody);
                });
            } else {
                console.log("http error", response.status);
                statusesListeners.onError();
            }
        })
        .catch(error => {
            console.log("error", error);
            statusesListeners.onError();
        });
}

async function createCookiesHeaderValue() {
    const cookies = await browser.cookies.getAll({url: "https://www.tradingview.com"});
    let cookiesStr = '';
    for (let cookie of cookies) {
        if (cookiesStr != '') {
            cookiesStr += '; ';
        }
        cookiesStr += '' + cookie.name + '=' + cookie.value;
    }
    return cookiesStr;
}

export async function updateRedList(symbols, statusesListeners = defaultStatusesListeners) {
    statusesListeners.onStart();

    const cookiesHeaderValue = await createCookiesHeaderValue();

    const myHttpRequest = {
        "type": "POST",
        "url": "https://www.tradingview.com/api/v1/symbols_list/colored/red/replace/?unsafe=true",
        "urlParams": { },
        "body": symbols,
        "headers": {
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "DNT": "1",
            "Cache-Control": "max-age=0",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
            "Accept": "*/*",
            //.header("Accept-Encoding", "gzip, deflate, br")
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.tradingview.com",
            "Origin": "https://www.tradingview.com",
            "content-type": "application/json",
            "Cookie": cookiesHeaderValue
        }
    };

    const onDisconnectListener = (m) => {
        //console.log("Disconnected");
        if (m.error) {
            console.log("Disconnected due to an error:", m.error);
            statusesListeners.onError();
        }
    };

    const onMessageListener = (response) => {
        //console.log('updateRedList http response:', response);
        if (response.errorCode == 200) {
            statusesListeners.onLoad();
        } else {
            console.log('updateRedList http response error: ', response.errorCode);
            console.log('updateRedList http response data: ', response.data);
            statusesListeners.onError();
        }
    };

    let port = browser.runtime.connectNative("cmdrequest");
    //console.log("port", port);
    port.onDisconnect.addListener(onDisconnectListener);
    port.onMessage.addListener(onMessageListener);

    console.log("Sending cmdrequest http request: ", myHttpRequest);
    port.postMessage(myHttpRequest);
}