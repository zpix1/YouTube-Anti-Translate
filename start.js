// To run in page environment
var s = document.createElement('script');
s.defer = true;
s.src = chrome.extension.getURL('background.js');
document.body.appendChild(s);