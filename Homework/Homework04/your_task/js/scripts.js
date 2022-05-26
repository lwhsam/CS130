const baseURL = 'https://www.apitutor.org/spotify/simple/v1/search';

// Note: AudioPlayer is defined in audio-player.js
const audioFile = 'https://p.scdn.co/mp3-preview/bfead324ff26bdd67bb793114f7ad3a7b328a48e?cid=9697a3a271d24deea38f8b7fbfa0e13c';
const audioPlayer = AudioPlayer('.player', audioFile);

const search = (ev) => {
    const term = document.querySelector('#search').value;
    console.log('search for:', term);
    // issue three Spotify queries at once...
    getTracks(term);
    getAlbums(term);
    getArtist(term);
    if (ev) {
        ev.preventDefault();
    }
}

const getTracks = (term) => {
    console.log(`
        get tracks from spotify based on the search term
        "${term}" and load them into the #tracks section 
        of the DOM...`);
    const elem = document.querySelector("#tracks");
    elem.innerHTML = '';
    fetch(baseURL + "?type=track&q=" + term)
    .then((data) => data.json())
    .then((data) => {
        console.log("tracks:", data);
        const firstFive = data.slice(0,5);
        if(data.length>0){
            for (const artistData of firstFive) {
                console.group(artistData);
                elem.innerHTML += getTrackHTML(artistData);
            }
        }
        else {
            elem.innerHTML = "track not found";
        }
    });
};

const getTrackHTML = (data) => {
    return `<button class="track-item preview" data-preview-track=${data.preview_url}" photo=${data.album.image_url} song-name=${data.name} artist-name=${data.artist.name} title='Play track - ${data.name}' onclick='handleTrackClick(event)'>
    <img src=${data.album.image_url} , alt="Photo of ${data.name}">
    <i class="fas play-track fa-play" aria-hidden="true"></i>
    <div class="label">
        <h2>${data.name}</h2>
        <p>
            ${data.artist.name}
        </p>
    </div>
</button>`
}



const getAlbums = (term) => {
    console.log(`
        get albums from spotify based on the search term
        "${term}" and load them into the #albums section 
        of the DOM...`);
        const elem = document.querySelector("#albums");
        elem.innerHTML = '';
        fetch(baseURL + "?type=album&q=" + term)
        .then((data) => data.json())
        .then((data) => {
        if(data.length>0){
            for (const albumData of data) {
                console.log("album:", albumData);
                elem.innerHTML += getAlbumHTML(albumData);
            }
        }
        else {
            elem.innerHTML = "album not found";
        }
    });    
};

const getAlbumHTML = (data) => {
    return `<section class="album-card" id=${data.id}>
    <div>
        <img src=${data.image_url} , alt="Photo of ${data.name}">
        <h2>${data.name}</h2>
        <div class="footer">
            <a href=${data.spotify_url} target="_blank" title="View ${data.name} on Spotify">
                view on spotify
            </a>
        </div>
    </div>
    </section>`
};

const getArtist = (term) => {
    console.log(`
        get artists from spotify based on the search term
        "${term}" and load the first artist into the #artist section 
        of the DOM...`);
        const elem = document.querySelector("#artist");
        elem.innerHTML = '';
        fetch(baseURL + "?type=artist&q=" + term)
        .then((data) => data.json())
        .then((data) => {
            console.log(data);
            if(data.length>0){
                const firstArtist = data[0];
                console.log(firstArtist);
                elem.innerHTML += getArtistHTML(firstArtist);
            }
            else {
                elem.innerHTML = "artist not found";
            }
        });    
};

const getArtistHTML = (data) => {
    return `<section class="artist-card" id=${data.id}>
    <div>
        <img src=${data.image_url} , alt="Photo of ${data.name}">
        <h2>${data.name}</h2>
        <div class="footer">
            <a href=${data.spotify_url} title="View ${data.name} on Spotify">
                view on spotify
            </a>
        </div>
    </div>
    </section>`
}

const handleTrackClick = (ev) => {
    const photo = ev.currentTarget.getAttribute('photo');
    const songName = ev.currentTarget.getAttribute('song-name');
    const artistName = ev.currentTarget.getAttribute('artist-name');
    const previewUrl = ev.currentTarget.getAttribute('data-preview-track');
    console.log(previewUrl); 
    document.querySelector('#track').src = previewUrl
    const audio = document.querySelector('#track');
    audio.load();
    audio.play();
    document.querySelector('#current-track').innerHTML =
    `<img src=${photo}>
    <i class="fas play-track fa-pause" aria-hidden="true"></i>
    <div class="label">
        <h2>${songName}</h2>
        <p>
            ${artistName}
        </p>
    <div/>`
}

document.querySelector('#search').onkeyup = (ev) => {
    // Number 13 is the "Enter" key on the keyboard
    console.log(ev.keyCode);
    if (ev.keyCode === 13) { 
        ev.preventDefault();
        search();
    }
};