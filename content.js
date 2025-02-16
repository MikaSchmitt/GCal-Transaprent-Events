// init
console.log("authenticating...")
authenticate()

//add CSS element into head
const style = document.createElement("style");
style.setAttribute("custom-css", "");
document.head.appendChild(style);

// TODO: make customizable by user
style.innerHTML = `
[transparent] {
	background-color: rgba(var(--gm3-sys-color-surface), 255) !important;
	backdrop-filter: blur(2px);
  	outline-style: dashed;
	outline-offset: -3px;
}
[transparent] * {
	color:var(--gm3-sys-color-on-surface) !important;
}
[transparent][style*="background-color: rgb(213, 0, 0)"] {
    outline-color: rgb(213, 0, 0)!important;
}
[transparent][style*="background-color: rgb(230, 124, 115)"] {
    outline-color: rgb(230, 124, 115)!important;
}
[transparent][style*="background-color: rgb(244, 81, 30)"] {
    outline-color: rgb(244, 81, 30)!important;
}
[transparent][style*="background-color: rgb(246, 191, 38)"] {
    outline-color: rgb(246, 191, 38)!important;
}
[transparent][style*="background-color: rgb(51, 182, 121)"] {
    outline-color: rgb(51, 182, 121)!important;
}
[transparent][style*="background-color: rgb(11, 128, 67)"] {
    outline-color: rgb(11, 128, 67)!important;
}
[transparent][style*="background-color: rgb(3, 155, 229)"] {
    outline-color: rgb(3, 155, 229)!important;
}
[transparent][style*="background-color: rgb(63, 81, 181)"] {
    outline-color: rgb(63, 81, 181)!important;
}
[transparent][style*="background-color: rgb(121, 134, 203)"] {
    outline-color: rgb(121, 134, 203)!important;
}
[transparent][style*="background-color: rgb(142, 36, 170)"] {
    outline-color: rgb(142, 36, 170)!important;
}
[transparent][style*="background-color: rgb(97, 97, 97)"] {
    outline-color: rgb(97, 97, 97)!important;
}
[transparent][style*="background-color: rgb(218, 82, 52)"] {
    outline-color: rgb(218, 82, 52)!important;
}
[transparent][style*="background-color: rgb(214, 131, 122)"] {
    outline-color: rgb(214, 131, 122)!important;
}
[transparent][style*="background-color: rgb(227, 104, 62)"] {
    outline-color: rgb(227, 104, 62)!important;
}
[transparent][style*="background-color: rgb(231, 186, 81)"] {
    outline-color: rgb(231, 186, 81)!important;
}
[transparent][style*="background-color: rgb(85, 176, 128)"] {
    outline-color: rgb(85, 176, 128)!important;
}
[transparent][style*="background-color: rgb(72, 145, 96)"] {
    outline-color: rgb(72, 145, 96)!important;
}
[transparent][style*="background-color: rgb(75, 153, 210)"] {
    outline-color: rgb(75, 153, 210)!important;
}
[transparent][style*="background-color: rgb(110, 114, 195)"] {
    outline-color: rgb(110, 114, 195)!important;
}
[transparent][style*="background-color: rgb(130, 139, 194)"] {
    outline-color: rgb(130, 139, 194)!important;
}
[transparent][style*="background-color: rgb(167, 90, 186)"] {
    outline-color: rgb(167, 90, 186)!important;
}
[transparent][style*="background-color: rgb(124, 124, 124)"] {
    outline-color: rgb(124, 124, 124)!important;
}
`

// Callback function that is executed when mutations are observed
const callback = (mutationList, observer) => {
	let buttonDetected = false;
	for (const mutation of mutationList) {
	  	// Check if the mutation affects child elements (added or removed)
	  	if (mutation.type === "childList") {
			// Iterate over added nodes
			for (const node of mutation.addedNodes){
				if (node.nodeType === 1 && node.hasAttribute("data-eventchip")) {
				  	buttonDetected = true;
					break;
				}
			}
		}
  	}
	// If any button was detected, trigger the debounced handler
	if (buttonDetected) {
		performance.mark("buttonDetected");
		maketransparent();

		performance.measure('Time_to_Calender', 'buttonDetected', 'got Calendars to fetch');
		performance.measure('Time_to_Events', 'buttonDetected', 'got Events');
		performance.measure('Time_Transparent', "got Events", 'set transparency');
	}
}
  
// Create a new MutationObserver linked to the callback function
const observer = new MutationObserver(callback);
  
// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };
  
// Select the node to observe (e.g., the document body or a specific container)
const targetNode = document.body;
  
// Start observing the target node with the specified configuration
observer.observe(targetNode, config);

async function authenticate() {
	var items = await chrome.storage.local.get("authToken");
	if (items) {
		var authToken = items.authToken;
		var response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${authToken}`, {}) //https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=
		var responseJson = await response.json();
		if (responseJson["issued_to"] == '35905430505-4t6dea16au28vjtu3lac1dtj906kna5g.apps.googleusercontent.com')
			if (responseJson["scope"] == 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly')
				return;
	}
	chrome.runtime.sendMessage({ type: "getAuthToken" });
}

async function maketransparent() {
	let CalendarGrid = getCalendarGrid();
	const gCalEvents = await getEventsFromGCal(CalendarGrid);
	performance.mark("got Events");
	CalendarGrid = getCalendarGrid(); // refresh CalendarGrid in case it was updated
	const events = getEvents(CalendarGrid);
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

		if (gCalEvent == null) continue;
		if (gCalEvent['transparency'] != "transparent") continue;

		// set html atrribute transparent
		events[i].setAttribute("transparent","");
	}
	performance.mark("set transparency");
}

async function getEventsFromGCal(CalendarGrid) {
	const authToken = await getAuthToken();
	//const events = getEvents(CalendarGrid);
	const calendarsToFetch = await getCalendarIDs();
	performance.mark("got Calendars to fetch");
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
			const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarsToFetch[i])}/events?${searchParams.toString()}`, fetch_options);
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

function waitForCalendars() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            let Calendars = document.querySelectorAll("[role=listitem]");
            if (Calendars.length > 0) {
                clearInterval(interval);
                resolve(Calendars);
            }
        }, 100); // check every 100ms
    });
}

async function getCalendarIDs() {
    // Wait for the calendars to exist
    let Calendars = await waitForCalendars(); // list might not exist yet

    let CalendarsToFetch = Array.from(Calendars).filter((element) => 
        element.querySelector("[type=checkbox]").checked == true
    );
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