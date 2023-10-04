// init
console.log("authenticating...")
authenticate()


/*
document.addEventListener('click', function() {
	console.log("click")
	setTimeout(function(){
		maketransparent()
	},200)
}, false);
console.log("Added Event Listeners")
*/

// when the searchbar exists it can be assumed that the window has loaded fully
const initInterval = setInterval(() => {
	const meetingWithSearchBox = document.querySelectorAll("[role=search]");
	if (meetingWithSearchBox.length) {
	  setInterval(checkForChanges, 500);
	  clearInterval(initInterval);
	}
  }, 500);

// check every .5 seconds if number of events has changed or another week is displayed
var prevEvents = 0;
var prevDateKey = 0;
function checkForChanges(){
	var events = document.querySelectorAll("[data-eventchip]");
	var collums = document.getElementsByClassName("YvjgZe");
	var DateKey = collums[0].dataset.datekey;
	if((events.length != prevEvents) || (prevDateKey != DateKey)){
		prevEvents = events.length;
		prevDateKey = DateKey;
		maketransparent();
	}
}

async function authenticate(){
	var items = await chrome.storage.local.get("authToken");
	if(items){
		var authToken = items.authToken;
		var response = await fetch( `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authToken}`,{})
		var responseJson = await response.json();
		if(responseJson["issued_to"] == '35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com')
			if(responseJson["scope"] == 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly')
				return;
	}
	chrome.runtime.sendMessage("auth");
}

function DateKeytoRFC3339(datekey, offset = 0)
{
	if(datekey == "null")
		return null;
	var year = Math.trunc(datekey / 512) + 1970;
	var month = Math.trunc(datekey % 512 / 32);
	var day = datekey % 32;
	var date = new Date(year, month-1, day, 0, 0, 0, 0);
	date.setDate(date.getDate() + offset)
	return date.toISOString()
}

async function maketransparent(){
	var items = await chrome.storage.local.get("authToken");
	var authToken = items.authToken;

	// get all Event Elements from HTML
	var events = document.querySelectorAll("[data-eventchip]");

	//check wich calendars need to be fetched
	var calendarsToFetch = [];
	for(let i = 0 ; i < events.length ; i++){
		var EventID = atob(events[i].dataset.eventid);
		var CalID = EventID.split(" ")[1].replace("@g","@group.calendar.google.com").replace("@i","@import.calendar.google.com").replace("@m","@gmail.com");
		if(!calendarsToFetch.find((element) => element == CalID))
			calendarsToFetch.push(CalID);
	}

	console.log(calendarsToFetch);

	// get range of dates for current view
	var collums = document.getElementsByClassName("YvjgZe");
	var firstDateKey = collums[0].dataset.datekey;
	var lastDateKey = collums[6].dataset.datekey;
	var timeMin = DateKeytoRFC3339(firstDateKey);
	var timeMax = DateKeytoRFC3339(lastDateKey,1);

	console.log(`timeMin: ${firstDateKey} ${timeMin} timeMax: ${lastDateKey} ${timeMax}`);

	var gCalEvents = [];
	// fetch all relevant events from gcal
	let fetch_options = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${authToken}`,
			'Content-Type': 'application/json',
		}
	};
	let searchParams = new URLSearchParams({ 
		orderBy: 'startTime',
		singleEvents: true,
		timeMin: timeMin,
		timeMax: timeMax
	})
	for(let i = 0 ; i < calendarsToFetch.length ; i++){
		var response = await fetch( `https://www.googleapis.com/calendar/v3/calendars/${calendarsToFetch[i]}/events?${searchParams.toString()}`, fetch_options);
		var data = await response.json();
		for(let x = 0; x < data['items']['length']; x++)
			gCalEvents.push(data['items'][x])
	}
	console.log(gCalEvents);

	for(let i = 0 ; i < events.length ; i++){
		let gCalEvent = gCalEvents.find((element) => element['id'] == atob(events[i].dataset.eventid).split(" ")[0]);
		if(gCalEvent['transparency'] == "transparent"){
			// check if transparent
			if(events[i].style.backgroundColor == "white")
				continue;

			// remove blue bar
			var bar = events[i].getElementsByClassName("uXJUmd")
			if(bar.length) bar[0].style.backgroundColor = "transparent"
			
			// make outline
			events[i].style.outlineStyle = "dotted";
			events[i].style.outlineColor = events[i].style.backgroundColor
			events[i].style.outlineOffset = "-3px"
			
			// make transaprent
			events[i].style.backgroundColor = "white"
			
			// change Text Color
			var name = events[i].getElementsByClassName("FAxxKc")
			if (name.length) name[0].style.color = "black"
			var details = events[i].getElementsByClassName("Jmftzc gVNoLb  EiZ8Dd")
			if (details.length) details[0].style.color = "black"
			var details = events[i].getElementsByClassName("Jmftzc K9QN7e  EiZ8Dd TuM9nf")
			if (details.length) details[0].style.color = "black"

		}
	}
}