console.log("Working")
document.addEventListener('readystatechange', event => { 
    // When window loaded ( external resources are loaded too- `css`,`src`, etc...) 
    if (event.target.readyState === "complete") {
        console.log("complete");
		maketransparent()
    }
});

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