const apiKey = 'AIzaSyANzLPw4qL2dfeWmWlMsgjt8maovtsQ-Ak';
const videoId = localStorage.getItem('videoId');
const videoHttp = "https://www.googleapis.com/youtube/v3/videos?";
const commentsHttp = "https://www.googleapis.com/youtube/v3/commentThreads?";
const repliesHttp = "https://www.googleapis.com/youtube/v3/comments?";

const videoCardContainer = document.querySelector('.video-container-side');

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

const fetchVideoDetails = async () => {
    try {
        const res = await fetch(videoHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet,statistics',
            id: videoId
        }));
        const data = await res.json();
        const video = data.items[0];
        // console.log(video);
       
        document.getElementById('video-player').src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        document.getElementById('video-title').textContent = video.snippet.title;
        document.getElementById('channel-name').textContent = video.snippet.channelTitle;
        document.getElementById('video-stats').textContent = `
            ${formatNumber(video.statistics.viewCount)} Views •
            ${timeSince(video.snippet.publishedAt)} •
            ${formatNumber(video.statistics.likeCount)} Likes`;
        const desc = document.getElementById('description-container').textContent = video.snippet.description;   
        console.log(desc);
        document.getElementById('comment-count').innerHTML = `<h2>${formatNumber(video.statistics.commentCount)} Comments</h2>`;  
    } catch (err) {
        console.error('Error fetching video details:', err);
    }
};

const fetchComments = async () => {
    try {
        const res = await fetch(commentsHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet',
            videoId: videoId,
            maxResults: 10
        }));
        const data = await res.json();
        // console.log(data);
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';  
        data.items.forEach(comment => {
            const commentHtml = `
            <div class="comment">
                <p><b>${comment.snippet.topLevelComment.snippet.authorDisplayName}:</b> ${comment.snippet.topLevelComment.snippet.textDisplay}</p>
                <button class="show-replies" onclick="fetchReplies('${comment.id}')"> ⬇️ Replies</button>
                <div class="replies-container" id="replies-${comment.id}"></div>
            </div>`;
            commentsContainer.innerHTML += commentHtml;
        });
    } catch (err) {
        console.error('Error fetching comments:', err);
    }
};

const fetchReplies = async (commentId) => {
    try {
        const res = await fetch(repliesHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet',
            parentId: commentId,
            maxResults: 10
        }));
        const data = await res.json();
        // console.log(data);
        const repliesContainer = document.getElementById(`replies-${commentId}`);
        repliesContainer.innerHTML = '';  
        data.items.forEach(reply => {
            const replyHtml = `
            <div class="reply">
                <p><strong>${reply.snippet.authorDisplayName}:</strong> ${reply.snippet.textDisplay}</p>
            </div>`;
            repliesContainer.innerHTML += replyHtml;
        });
    } catch (err) {
        console.error('Error fetching replies:', err);
    }
};


fetchVideoDetails();
fetchComments();

const fetchVideos = async () => {
    try {
        const res = await fetch(videoHttp + new URLSearchParams({
            key: apiKey,
            part: 'snippet,statistics',
            chart: 'mostPopular',
            maxResults: 15,
            regionCode: 'IN'
        }));
        const data = await res.json();
        // console.log(data);
        data.items.forEach(item => makeVideoCard(item));
    } catch (err) {
        console.error('Error fetching videos:', err);
    }
};
const makeVideoCard = (data) => {
    videoCardContainer.innerHTML += `
    <div class="video-side" onclick="navigateToVideoDetails('${data.id}')">
             <img src="${data.snippet.thumbnails.high.url}" class="thumbnail-side" alt="">
             <div class="content-side"> 
                 <div class="info-side">
                     <h4 class="title-side">${data.snippet.title}</h4>
                     <p class="channel-name-side">${data.snippet.channelTitle}</p>
                     <p class="stats-side">${formatNumber(data.statistics.viewCount)} views • ${timeSince(data.snippet.publishedAt)}</p>
                 </div>
             </div>
         </div>
    `;
}
fetchVideos();

const navigateToVideoDetails = (videoId) => {
    localStorage.setItem('videoId', videoId);
    window.location.href = 'videoDetails.html';
};



