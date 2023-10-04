chrome.runtime.onMessage.addListener(
	function (request, sender){
		// If we get the request from the Background script
		if (request == 'auth'){
            chrome.windows.create({
                'url': './auth/auth.html',
                'width': 454,
                'height': 540,
                'type': 'popup'
            });
        }
});