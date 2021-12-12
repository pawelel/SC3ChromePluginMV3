// This file can be imported inside the service worker,
// which means all of its functions and variables will be accessible
// inside the service worker.
// The importation is done in the file `service-worker.js`.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    //query api with multiple parameters
    const tableurl = "https://localhost:44356/api/areas/GetAreaPlaceDeviceModels";
    const dropdownurl = "https://localhost:44356/api/situations";
    if (message.name === "fetchAssets") {
        fetch(tableurl, { mode: 'cors' }).then(async function (response) {
            if (response.ok) {
                return await response.json();
            } else {
                return Promise.reject(response);
            }
        })
            .then(data => sendResponse(data))
            // .catch(error => alert("Something went wrong!!" + error));
        return true;
    }
    if (message.name === "fetchSituations"){
        fetch(dropdownurl, { mode: 'cors' }).then(async function (response) {
            if (response.ok) {
                return await response.json();
            } else {
                return Promise.reject(response);
            }
        })
            .then(data => sendResponse(data))
            // .catch(error => alert("Something went wrong!!" + error));
        return true;
    }
});
console.log("External file is also loaded!")
