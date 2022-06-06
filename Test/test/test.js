const changeIndex = (ev) => {
	const elem = ev.currentTarget.getAttribute("id");
	currentIndex = Number(ev.currentTarget.getAttribute("data-index"));
    document.querySelector("#a-button").innerHTML = "two-button";
    if (currentIndex === 0) {
        currentIndex = 1
    }
	console.log(elem, currentIndex);
}

const showImage = (ev) => {
	document.querySelector('#show-image').setAttribute('href', "../image/Snapchat-212131.jpg");
}