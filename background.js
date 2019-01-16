function makeHttpObject() {
    try {return new XMLHttpRequest();}
    catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP");}
    catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP");}
    catch (error) {}
  
    throw new Error("Could not create HTTP request object.");
}

function get(url, callback) {
    var request = makeHttpObject();
    request.open("GET", url, true);
    request.send(null);
    request.onreadystatechange = function() {
    if (request.readyState == 4)
        callback(request);
    };
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;
    const customPart = 'class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"  rel="nofollow"';

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a ' + customPart + ' href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a ' + customPart + ' href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a ' + customPart + ' href="mailto:$1">$1</a>');

    return replacedText;
}

function untranslateCurrentVideo() {
    let realTitle = document.querySelector(".ytp-title-link").innerText;
    let translatedTitleElement = document.querySelector(".title").children[0];

    if (!realTitle || !translatedTitleElement) {
        // Do noting if video is not loaded yet
        return;
    }
    if (realTitle === translatedTitleElement.innerText) {
        // Do not revert already original videos
        return;
    }
    let realDescription = window["ytInitialPlayerResponse"].videoDetails.shortDescription;
    let translatedDescriptionElement = document.querySelector(".content.style-scope.ytd-video-secondary-info-renderer");
    
    // console.log(translatedDescriptionElement);

    translatedTitleElement.innerText = realTitle;
    translatedDescriptionElement.innerHTML = linkify(realDescription);
}

function untranslateOtherVideos() {
    function untranslateArray(otherVideos) {
        for (let i = 0; i < otherVideos.length; i++) {
            let video = otherVideos[i];
            if (!video.untranslatedByExtension) {
                let href = video.querySelector('a');
                video.untranslatedByExtension = true;
                console.log('req');
                get('https://www.youtube.com/oembed?url=' + href.href, function (response) {
                    const title = JSON.parse(response.responseText).title;

                    // video.querySelector('span').innerText = title;
                    video.querySelector('#video-title').innerText = title;

                });
            }
        }
    }
    let compactVideos = document.getElementsByTagName('ytd-compact-video-renderer');
    let normalVideos = document.getElementsByTagName('ytd-video-renderer');
    let gridVideos = document.getElementsByTagName('ytd-grid-video-renderer');
    
    untranslateArray(compactVideos);
    untranslateArray(normalVideos);
    untranslateArray(gridVideos);
}

function untranslate() {
    untranslateCurrentVideo();
    untranslateOtherVideos();
}

function run() {
    // Change current video title and description
    // Using setInterval couse we can't exactly know the moment when YT js will load video title
    // let x = setInterval(function () {
    //     console.log(x);
    //     if (window["ytInitialPlayerResponse"]) {
    //         untranslateCurrentVideo();
    //         clearInterval(x);
    //     }
    // }, 100);
    let target = document.body;
    let config = { childList: true, subtree: true };
    let observer = new MutationObserver(untranslate);

    observer.observe(target, config); 
}

window.onload = run;