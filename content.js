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
var prevDate = 0;
function checkForChanges() {
	const CalendarGrid = getCalendarGrid();
	const { startDate, endDate } = getDateRange(CalendarGrid);
	const events = getEvents(CalendarGrid);
	// check for changes
	if ((events.length != prevEvents) || (prevDate != startDate)) {
		prevEvents = events.length;
		prevDate = startDate;
		maketransparent();
	}
}

async function authenticate() {
	var items = await chrome.storage.local.get("authToken");
	if (items) {
		var authToken = items.authToken;
		var response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authToken}`, {})
		var responseJson = await response.json();
		if (responseJson["issued_to"] == '35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com')
			if (responseJson["scope"] == 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly')
				return;
	}
	chrome.runtime.sendMessage({ type: "getAuthToken" });
}

async function maketransparent() {
	const CalendarGrid = getCalendarGrid();
	const events = getEvents(CalendarGrid);
	const gCalEvents = await getEventsFromGCal(CalendarGrid);
	makeEventsTransparent(events, gCalEvents);
}

function getCalendarGrid() {
	const CalendarMainView = document.querySelector("[role=main]");
	const CalendarGrid = CalendarMainView.querySelector("[role=grid]");
	return CalendarGrid
}

function makeEventsTransparent(events, gCalEvents) {
	for (let i = 0; i < events.length; i++) {
		const gCalEvent = gCalEvents.find((element) => element['id'] == atob(events[i].dataset.eventid).split(" ")[0]);

		if (gCalEvent['transparency'] != "transparent") continue;

		// check if transparent
		if (events[i].style.backgroundColor == "white") continue;

		// adjust
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
		const childs = getChildsRecursively(events[i]);
		for (const child of childs) {
			if (child.innerText != '')
				child.style.color = "black";
		}
	}
}

async function getEventsFromGCal(CalendarGrid) {
	const authToken = await getAuthToken();
	const events = getEvents(CalendarGrid);
	const calendarsToFetch = getCalendarIDs();
	console.log(calendarsToFetch);

	const { startDate, endDate } = getDateRange(CalendarGrid);

	const gCalEvents = [];
	// fetch all relevant events from gcal
	const fetch_options = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${authToken}`,
			'Content-Type': 'application/json',
		}
	};
	const searchParams = new URLSearchParams({
		orderBy: 'startTime',
		singleEvents: true,
		timeMin: startDate,
		timeMax: endDate,
		maxResults: 250
	});
	for (let i = 0; i < calendarsToFetch.length; i++) {
		let nextPageToken = null;
		do {
			const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarsToFetch[i].replace('#','%23')}/events?${searchParams.toString()}`, fetch_options);
			const data = await response.json();
			nextPageToken = data['nextPageToken'];
			searchParams.set("pageToken", nextPageToken);
			gCalEvents.push(...data['items']);
		} while (nextPageToken != null) 
		searchParams.delete("pageToken");
	}
	return gCalEvents;
}

async function getAuthToken() {
	const items = await chrome.storage.local.get("authToken");
	const authToken = items.authToken;
	return authToken;
}

function getEvents(CalendarGrid) {
	const EventPresentation = CalendarGrid.childNodes[1];
	const events = EventPresentation.querySelectorAll("[data-eventchip]");
	return events;
}

function getCalendarIDs() {
	let CalendarList = document.querySelectorAll("[role=complementary]")[0];
	let Calendars = Array.from(document.querySelectorAll("[role=listitem"));
	let CalendarsToFetch = Calendars.filter((element) => element.querySelector("[type=checkbox]").checked == true);
	let CalendarIDs = CalendarsToFetch.map((calendar) => atob(calendar.children[0].dataset.id));
	return CalendarIDs;
}

function getDateRange(CalendarGrid) {
	const DatePresentation = CalendarGrid.childNodes[0];
	const startDateKey = DatePresentation.dataset.startDateKey;
	const endDateKey = DatePresentation.dataset.endDateKey;
	const startDate = DateKeytoRFC3339(startDateKey);
	const endDate = DateKeytoRFC3339(endDateKey, 1); // offset by one to fully include last day
	return { startDate, endDate };
}

function DateKeytoRFC3339(datekey, offset = 0) {
	if (datekey == "null")
		return null;
	const year = Math.trunc(datekey / 512) + 1970;
	const month = Math.trunc(datekey % 512 / 32);
	const day = datekey % 32;
	var date = new Date(year, month - 1, day, 0, 0, 0, 0);
	date.setDate(date.getDate() + offset)
	return date.toISOString()
}

function getChildsRecursively(element) {
	let childs = [...element.children];
	for (const child of element.children) {
		childs.push(...getChildsRecursively(child));
	}
	return childs;
}