//console.log("Working")

/*
(async () => {
	const src = "https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js";
	const contentMain = await import(src);
	contentMain.createAuth0Client({
		domain: 'https://accounts.google.com/o/oauth2/v2/auth',
		clientId: '793561486455-oi61g7ie3tipf0fqedtsl97shflup6nr.apps.googleusercontent.com'
	  });
  })();*/

  
/*
async function auth()
{
	let myModule = await import("./cdn.auth0.com_js_auth0-spa-js_2.0_auth0-spa-js.production.js")
	console.log(myModule)
}

auth()
*/

//"resources": ["./cdn.auth0.com_js_auth0-spa-js_2.0_auth0-spa-js.production.js"]

//Authenticate();

function Authenticate() {
	const AuthURL = "https://accounts.google.com/o/oauth2/v2/auth";
	const ClientId = "35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com";
	const RedirectURL = "https://eoioodphacegcnaodjgjmdabhgghfmga.chromiumapp.org";
	const Scope = "https://www.googleapis.com/auth/calendar.events.readonly";

    // Generate a random code verifier and code challenge
    const codeVerifier = generateRandomCodeVerifier();
	//const codeChallenge = generateCodeChallenge(codeVerifier);
	const codeChallenge = "CDqr_qbP7uHb3gOOiP_aAgBlp2fKFIT4nZeRvJVaymQ";
    // Save the code verifier in a secure way, e.g., in a variable or local storage
    localStorage.setItem("codeVerifier", codeVerifier);

    // Construct the Google OAuth authorization URL with PKCE parameters
    const authorizationUrl = `${AuthURL}?client_id=${ClientId}&redirect_uri=${RedirectURL}&response_type=code&scope=${Scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
	
	console.log(codeChallenge);
	console.log(authorizationUrl);
    // Open the authorization URL in a new window or tab
    window.open(authorizationUrl, "_blank");
};

// Function to generate a random code verifier
function generateRandomCodeVerifier() {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const verifierLength = 64;
    let codeVerifier = "";
    for (let i = 0; i < verifierLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        codeVerifier += charset[randomIndex];
    }
    return codeVerifier;
}

// Function to generate a code challenge from the code verifier
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const buffer = await crypto.subtle.digest("SHA-256", data);
	console.log(buffer);
	let uint8arr = new Uint8Array(buffer);
	console.log(uint8arr);
	let base64arr = base64URLEncode(new Uint8Array(buffer));
	console.log(base64arr);
    return base64arr;
}

// Function to URL-safe Base64 encode
function base64URLEncode(data) {
    return btoa(String.fromCharCode.apply(null, data))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

Authenticate();

document.addEventListener('click', function() {
	console.log("click")
	maketransparent()
}, false);
console.log("Added Event Listeners")

function maketransparent(){
	// get all Event Elements
	var arr = document.getElementsByClassName("NlL62b EfQccc elYzab-cXXICe-Hjleke EiZ8Dd afiDFd")

	for(let i = 0 ; i < arr.length ; i++){
		
		// check if transparent
		if(arr[i].style.backgroundColor == "transparent")
			continue
		
		// check if free
		
		
		// remove blue bar
		var bar = arr[i].getElementsByClassName("uXJUmd")
		if (bar.length) bar[0].style.backgroundColor = "transparent"
		
		// make outline
		arr[i].style.outlineStyle = "dotted";
		arr[i].style.outlineColor = arr[i].style.backgroundColor
		arr[i].style.outlineOffset = "-3px"
		
		// make transaprent
		arr[i].style.backgroundColor = "transparent"
		
		// change Text Color
		var name = arr[i].getElementsByClassName("FAxxKc")
		if (name.length) name[0].style.color = "black"
		var details = arr[i].getElementsByClassName("Jmftzc gVNoLb  EiZ8Dd TuM9nf")
		if (details.length) details[0].style.color = "black"
	}
}