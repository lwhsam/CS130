/**
 * Your Job:
 * 1. Display all of the matching restaurants to the screen (any way you want).
 * 2. Make the search honor the location.
 * 3. Make the search honor the cuisine chosen.
 */
const searchYelp = ev => {
    // ev.preventDefault();
    const term = document.querySelector('#cuisine').ariaValueMax;
    const term = document.querySelector('#location').ariaValueMax;
    let url = `https://www.apitutor.org/yelp/simple/v3/businesses/search?location=${location},%20IL&term=${cuisine};
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        });
};


document.querySelector('#search').addEventListener('click', showMatchingRestaurants);