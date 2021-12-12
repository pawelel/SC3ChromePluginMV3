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
