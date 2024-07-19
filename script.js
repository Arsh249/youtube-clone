const videoCardContainer = document.querySelector('.video-container');

const apiKey = 'AIzaSyANzLPw4qL2dfeWmWlMsgjt8maovtsQ-Ak';
let videoHttp = "https://www.googleapis.com/youtube/v3/videos?";
let channelHttp = "https://www.googleapis.com/youtube/v3/channels?";

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'; // For millions
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'; // For thousands
    } else {
        return num.toString(); // No conversion needed
    }
}

function timeSince(isoDateString) {
    const pastDate = new Date(isoDateString);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - pastDate;

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const millisecondsPerHour = 60 * 60 * 1000;
    const daysInMonth = 30.44;

    const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsPerDay);

   if (differenceInDays > 30) {
        const differenceInMonths = differenceInDays / daysInMonth;
        return `${differenceInMonths} months ago`;
    } else if (differenceInDays >= 1) {
        return `${differenceInDays} days ago`;
    } else {
        const differenceInHours = Math.floor(differenceInMilliseconds / millisecondsPerHour);
        return `${differenceInHours} hours ago`;
    }
}

const fetchVideos = async () => {
    try {
        const res = await fetch(videoHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet, statistics',
            chart: 'mostPopular',
            maxResults: 20,
            regionCode: 'IN'
        }));
        const data = await res.json();
        console.log(data);
        data.items.forEach(item => getChannelIcon(item));
    } catch (err) {
        console.error('Error fetching videos:', err);
    }
};

const getChannelIcon = async (video_data) => {
    try {
        const res = await fetch(channelHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet',
            id: video_data.snippet.channelId
        }));
        const data = await res.json();
        video_data.channelThumbnail = data.items[0].snippet.thumbnails.default.url;
        makeVideoCard(video_data);
    } catch (err) {
        console.error('Error fetching channel icon:', err);
    }
};

const makeVideoCard = (data) => {
    videoCardContainer.innerHTML += `
    <div class="video" onclick="navigateToVideoDetails('${data.id}')">
        <img src="${data.snippet.thumbnails.high.url}" class="thumbnail" alt="">
        <div class="content">
            <img src="${data.channelThumbnail}" class="channel-icon" alt="">
            <div class="info">
                <h4 class="title">${data.snippet.title}</h4>
                <p class="channel-name">${data.snippet.channelTitle}</p>
                <p class="channel-name">${formatNumber(data.statistics.viewCount)} views • ${timeSince(data.snippet.publishedAt)}</p>
            </div>
        </div>
    </div>
    `;
}
fetchVideos();

const searchInput = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const searchLink = "https://www.googleapis.com/youtube/v3/search?";

searchBtn.addEventListener('click', () => {
    if (searchInput.value.length) {
        fetchSearchResults(searchInput.value);
    }
});

const fetchSearchResults = async (query) => {
    try {
        const res = await fetch(searchLink + new URLSearchParams({
            key: apiKey,
            part: 'snippet',
            q: query,
            maxResults: 20,
            type: 'video'
        }));
        const data = await res.json();
        videoCardContainer.innerHTML = '';  
        data.items.forEach(item => {
            const videoData = {
                ...item,
                id: item.id.videoId 
            };
            getChannelIcon(videoData);
        });
    } catch (err) {
        console.error('Error fetching search results:', err);
    }
};

const navigateToVideoDetails = (videoId) => {
    localStorage.setItem('videoId', videoId);
    window.location.href = 'videoDetails.html';
};

