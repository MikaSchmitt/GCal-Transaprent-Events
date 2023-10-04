var auth_url = 'https://accounts.google.com/o/oauth2/auth?';
var client_id = '35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com';
var redirect_url = chrome.identity.getRedirectURL();

var auth_params = {
    client_id: client_id,
    redirect_uri: redirect_url,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly'
};

const url = new URLSearchParams(Object.entries(auth_params));
url.toString();
auth_url += url;

chrome.identity.launchWebAuthFlow({url: auth_url, interactive: true}, function(responseUrl) { 
    console.log(responseUrl);
    var url;
    try {
        url = new URL(responseUrl);
    } catch (error) {
        console.error(error);
    }         
    var token = new URLSearchParams(url.hash.substring(1)).get('access_token');
    chrome.storage.local.set({ "authToken": token }, function(){
        console.log(`aquired and stored token`);
    });
});