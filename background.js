/*jshint esversion: 8 */

const MOCK_ASSET_LIST = `[
    {
        "area": "Montage",
        "place": "Line1",
        "device": "Printer",
        "model": "Canon1",
        "coordinate": "Position1",
        "asset": "Printer123"
    },
    {
        "area": "Paintshop",
        "place": "PaintersTeam1",
        "device": "PC",
        "model": "Tower Dell",
        "coordinate": "Position3",
        "asset": "TowerDell2"
    },
    {
        "area": "Assembly",
        "place": "Finish",
        "device": "HMI",
        "model": "HMI 123",
        "coordinate": "Robotic Station 32",
        "asset": "RS232"
    }
]`;

const MOCK_SITUATION_LIST = `[
    {
        "situationId": 1,
        "name": "Paper Jam",
        "deviceId": 1,
        "deviceName": "Printer"
    },
    {
        "situationId": 2,
        "name": "BSOD",
        "deviceId": 5,
        "deviceName": "PC"
    },
    {
        "situationId": 3,
        "name": "Channel blocked",
        "deviceId": 1,
        "deviceName": "Printer"
    },
    {
        "situationId": 4,
        "name": "Calibration request",
        "deviceId": 1,
        "deviceName": "Printer"
    }
]`;

const ASSET_LIST_ENDPOINT = 'https://localhost:44356/api/areas/GetAreaPlaceDeviceModels';
const SITUATION_LIST_ENDPOINT = 'https://localhost:44356/api/situations';

function fetchAPI(sendResponse, url, mockData) {
    // Send mock data (quick)
    sendResponse(JSON.parse(mockData));
    // Fetch real data (slow)
    fetch(url, { mode: 'cors' })
        .then((response) => (response.ok ? response.json() : Promise.reject(response)))
        .then((data) => sendResponse(data))
        .catch((_) => _);
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === 'fetchAssets') {
        fetchAPI(sendResponse, ASSET_LIST_ENDPOINT, MOCK_ASSET_LIST);
        return true;
    }

    if (message.name === 'fetchSituations') {
        fetchAPI(sendResponse, SITUATION_LIST_ENDPOINT, MOCK_SITUATION_LIST);
        return true;
    }

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            chrome.tabs.executeScript(tabId, { file: 'injector.js' });
        }
    });
});
