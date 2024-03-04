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
	// get Calendar Grid
	var CalendarMainView = document.querySelector("[role=main]");
	var CalendarGrid = CalendarMainView.querySelector("[role=grid]");
	// get Date Key from Calendar View
	var DatePresentation = CalendarGrid.childNodes[0];
	var DateKey = DatePresentation.dataset.startDateKey;
	// get visible Events
	var EventPresentation = CalendarGrid.childNodes[1];
	var events = EventPresentation.querySelectorAll("[data-eventchip]");
	// check for changes
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
			if(responseJson["scope"] == 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly')
				return;
	}
	chrome.runtime.sendMessage({type: "getAuthToken"});
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

	// get Calendar Grid
	var CalendarMainView = document.querySelector("[role=main]");
	var CalendarGrid = CalendarMainView.querySelector("[role=grid]");
	// get all Event Elements from HTML
	var EventPresentation = CalendarGrid.childNodes[1];
	var events = EventPresentation.querySelectorAll("[data-eventchip]");

	//check wich calendars need to be fetched
	var calendarsToFetch = [];
	for(let i = 0 ; i < events.length ; i++){
		var EventID = atob(events[i].dataset.eventid);
		var CalID = EventID.split(" ")[1].replace("@g","@group.calendar.google.com").replace("@i","@import.calendar.google.com").replace("@m","@gmail.com").replace("@v","@group.v.calendar.google.com");
		if(!calendarsToFetch.find((element) => element == CalID))
			calendarsToFetch.push(CalID);
	}

	console.log(calendarsToFetch);

	// get range of dates for current view
	// get Calendar Main View
	var CalendarMainView = document.querySelector("[role=main]");
	var CalendarGrid = CalendarMainView.querySelector("[role=grid]");
	// get Date Key from Calendar View
	var DatePresentation = CalendarGrid.childNodes[0];
	var startDateKey = DatePresentation.dataset.startDateKey;
	var endDateKey = DatePresentation.dataset.endDateKey;
	var timeMin = DateKeytoRFC3339(startDateKey);
	var timeMax = DateKeytoRFC3339(endDateKey,1); // offset by one to fully include last day

	console.log(`timeMin: ${startDateKey} ${timeMin} timeMax: ${endDateKey} ${timeMax}`);

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
		let nextPageToken = "dummy"
		while(nextPageToken){
			var response = await fetch( `https://www.googleapis.com/calendar/v3/calendars/${calendarsToFetch[i]}/events?${searchParams.toString()}`, fetch_options);
			var data = await response.json();
			nextPageToken = data['nextPageToken'];
			searchParams.set("pageToken", nextPageToken);
			gCalEvents.push(...data['items']);
		}
		searchParams.delete("pageToken")
	}
	console.log(gCalEvents);

	for(let i = 0 ; i < events.length ; i++){
		let gCalEvent = gCalEvents.find((element) => element['id'] == atob(events[i].dataset.eventid).split(" ")[0]);
		if(gCalEvent['transparency'] == "transparent"){
			// check if transparent
			if(events[i].style.backgroundColor == "white")
				continue;

			// remove blue bar
			var bar = events[i].childNodes[0];
			bar.style.marginLeft = "-4px";
			
			// make outline
			events[i].style.outlineStyle = "dotted";
			events[i].style.outlineColor = events[i].style.backgroundColor;
			events[i].style.outlineOffset = "-3px";
			events[i].style.marginLeft = "4px";
			
			// make transaprent
			events[i].style.backgroundColor = "white";
			
			// change Text Color
			let childs = getChildsRecursively(events[i]);
			for (child of childs){
				if(child.innerText != '')
					child.style.color = "black";
			}
		}
	}
}

function getChildsRecursively(element) {
	let childs = [...element.children];
	for (const child of element.children){
		childs.push(...getChildsRecursively(child));
	}
	return childs;
}