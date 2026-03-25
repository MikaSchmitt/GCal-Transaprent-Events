const ext = typeof browser !== "undefined" ? browser : chrome;

ext.runtime.onMessage.addListener(function (request, sender) {
    // If we get the request from the content script, open auth popup.
    if (request.type === "getAuthToken") {
        ext.windows.create({
            url: "./auth/auth.html",
            width: 454,
            height: 540,
            type: "popup"
        });
    }
});