
function save_options() {
    chrome.storage.sync.get({
        disabled: false
    }, function (items) {
        let disabled = !items.disabled;
        chrome.storage.sync.set({
            disabled: disabled,
        }, function () {
            document.getElementById('disable-button').innerText = disabled ? 'Enable' : 'Disable';
            document.getElementById('disable-button').className = disabled ? 'disabled' : 'enabled';
        });

    });
}

function restore_options() {
    chrome.storage.sync.get({
        disabled: false
    }, function (items) {
        document.getElementById('disable-button').innerText = items.disabled ? 'Enable' : 'Disable';
        document.getElementById('disable-button').className = disabled ? 'disabled' : 'enabled';
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('disable-button').addEventListener('click', save_options);