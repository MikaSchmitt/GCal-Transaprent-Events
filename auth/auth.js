const ext = typeof browser !== "undefined" ? browser : chrome;

var auth_url = 'https://accounts.google.com/o/oauth2/auth?';
var client_id = '35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com';
var redirect_url = ext.identity.getRedirectURL();

console.log('OAuth redirect URI:', redirect_url);

var auth_params = {
    client_id: client_id,
    redirect_uri: redirect_url,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly'
};

const url = new URLSearchParams(Object.entries(auth_params));
url.toString();
auth_url += url;

function launchWebAuthFlow(details) {
    try {
        const maybePromise = ext.identity.launchWebAuthFlow(details);
        if (maybePromise && typeof maybePromise.then === "function") {
            return maybePromise;
        }
    } catch (error) {
        // Fall through to callback mode below.
    }

    return new Promise((resolve, reject) => {
        ext.identity.launchWebAuthFlow(details, (responseUrl) => {
            const runtimeError = ext.runtime && ext.runtime.lastError;
            if (runtimeError) {
                reject(new Error(runtimeError.message));
                return;
            }
            resolve(responseUrl);
        });
    });
}

function storageSet(values) {
    try {
        const maybePromise = ext.storage.local.set(values);
        if (maybePromise && typeof maybePromise.then === "function") {
            return maybePromise;
        }
    } catch (error) {
        // Fall through to callback mode below.
    }

    return new Promise((resolve, reject) => {
        ext.storage.local.set(values, () => {
            const runtimeError = ext.runtime && ext.runtime.lastError;
            if (runtimeError) {
                reject(new Error(runtimeError.message));
                return;
            }
            resolve();
        });
    });
}

async function authenticate() {
    try {
        const responseUrl = await launchWebAuthFlow({ url: auth_url, interactive: true });
        console.log(responseUrl);

        const parsedUrl = new URL(responseUrl);
        const token = new URLSearchParams(parsedUrl.hash.substring(1)).get('access_token');
        await storageSet({ authToken: token });
        close();
    } catch (error) {
        console.error(error);
        const msg = String(error && error.message ? error.message : error);
        if (msg.includes('redirect_uri_mismatch') || msg.includes('Error 400')) {
            alert(
                'OAuth redirect_uri_mismatch. Add this URI to Google Cloud -> OAuth client -> Authorized redirect URIs:\n\n' +
                redirect_url
            );
        }
    }
}

authenticate();