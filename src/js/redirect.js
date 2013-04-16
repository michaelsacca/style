/*This handles when the user is redirected to our fake URL*/
// send a request to our background.js to set the access token
chrome.extension.sendRequest({type:'auth', token:window.location.hash}, function (response) {
    window.open('', '_self', '');
    window.close();
});