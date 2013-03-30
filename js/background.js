// listen for the access token sender:
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request && 'token' in request && request.token.match(/access_token/)) {
        // set access token for this user:
        InstaAPI.setAccessToken(request.token.replace('#access_token=', ''));

        // now close the window:
        sendResponse({});
    }
});

// check for version updates in case we ever need to clear localstorage, etc
if (!Data.get(Data.StorageKeys.AppVersion) || Data.get(Data.StorageKeys.AppVersion) < 0.5) {
    Data.clear();
    Data.set(Data.StorageKeys.AppVersion, chrome.app.getDetails().version);
}

//TODO: Make this check instagram for a new feed periodically, so new tab shows new pics instantly