const MOCK_ASSET_LIST = `[
    {
        "area": "Montage",
        "place": "Line1",
        "device": "Printer",
        "model": "Canon1",
        "coordinate": "Position1",
        "asset": "Printer123",
        "situations": [
            {
                "situationId": "1",
                "name": "Paper Jam",
                "description": [
                    "Paper jam in printer",
                    "Please check the paper"
                ]
            },
            {
                "situationId": "2",
                "name": "Paper Out",
                "description": [
                    "Paper out in printer",
                    "Incorrect paper in printer"
                ]
            },
            {
                "situationId": "3",
                "name": "Channel blocked",
                "description": [
                    "Channel blocked in printer",
                    "It is blocked in the middle of the page"
                ]
            },
            {
                "situationId": "7",
                "name": "Calibration request",
                "description": [
                    "Calibration request in printer",
                    "Please calibrate the printer"
                ]
            }
        ]
    },
    {
        "area": "Paintshop",
        "place": "PaintersTeam1",
        "device": "PC",
        "model": "Tower Dell",
        "coordinate": "Position3",
        "asset": "TowerDell2",
        "situations": [
            {
                "situationId": "4",
                "name": "No power",
                "description": [
                    "No power in PC",
                    "Please check the power"
                ]
            },
            {
                "situationId": "5",
                "name": "No internet",
                "description": [
                    "No internet in PC",
                    "Please check the internet"
                ]
            },
            {
                "situationId": "6",
                "name": "No printer",
                "description": [
                    "No printer in PC",
                    "Please check the printer"
                ]
            }
        ]
    },
    {
        "area": "Assembly",
        "place": "Finish",
        "device": "HMI",
        "model": "HMI 123",
        "coordinate": "Robotic Station 32",
        "asset": "RS232",
        "situations": [
            {
                "situationId": "8",
                "name": "No power",
                "description": [
                    "No power in HMI",
                    "Please check the power"
                ]
            },
            {
                "situationId": "9",
                "name": "No internet",
                "description": [
                    "No internet in HMI",
                    "Please check the internet"
                ]
            }
        ]
    }
]`;


const ASSET_LIST_ENDPOINT = 'https://localhost:44356/api/areas/GetAreaPlaceDeviceModels';

function fetchAPI(sendResponse, url, mockData) {
    // Fetch real data (slow)
    fetch(url, { mode: 'cors' })
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((data) => sendResponse(data))
    .catch((_) => _);
    // Send mock data (if server is offline)
    sendResponse(JSON.parse(mockData));
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === 'fetchAssets') {
        fetchAPI(sendResponse, ASSET_LIST_ENDPOINT, MOCK_ASSET_LIST);
        return true;
    }
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            chrome.tabs.executeScript(tabId, { file: 'injector.js' });
        }
    });
});
