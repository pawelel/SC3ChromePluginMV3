const assetTable = document.querySelector('#assetTable');
const searchField = document.querySelector('#searchField');
const fillForm = document.querySelector('#fillForm');
const outputTitle = document.querySelector('#output-title');
var outputLocation = '';
const outputDescription = document.querySelector('#description');
const situationSelect = document.querySelector('#situation-select');
var situationList;
var assetData;
var assetSource;

function generateTableHead(tableElement, headData) {
    let thead = tableElement.createTHead();
    let row = thead.insertRow();
    for (let key of headData) {
        let th = document.createElement('th');
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTableBody(tableElement, bodyData) {
    let tbody = tableElement.createTBody();
    for (var i = 0; i < bodyData.length; i++) {
        let row = tbody.insertRow();
        for (var key in bodyData[i]) {
            let cell = row.insertCell();
            let text = document.createTextNode(bodyData[i][key]);
            cell.appendChild(text);
        }
    }
}

function filterTable(tableRows, filter) {
    tableRows.forEach((row) => (row.innerText.toUpperCase().includes(filter.toUpperCase()) ? (row.style.display = '') : (row.style.display = 'none')));
}

function generateOptions(situationList) {
    const options = [];
    for (const situation of situationList) {
            const option = document.createElement('option');
            option.value = situation.situationId;
            option.innerHTML = situation.name;
            options.push(option);
    }
    return options;
}

function setSituation(columnMap) {
    outputTitle.value = '';
    const situationName = situationSelect?.options[situationSelect?.selectedIndex]?.text;
    if (situationName && columnMap('asset')) {
        outputTitle.value = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}] [${columnMap('model')}] [${columnMap('asset')}] [${situationName}]`;
        outputLocation = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}]`;
        outputDescription.value = situationList.find((situation) => situation.name === situationName).description.join('\n');
    }
}

function rowClickHandler(selectedRow, columnMap, tableRows) {
    tableRows.forEach((row) => row.classList.remove('selected'));
    selectedRow.classList.add('selected');

    Array.from(situationSelect.children).forEach((child) => child.remove());
    situationList = assetSource.find((asset) => asset.asset === columnMap('asset')).situations;
    generateOptions(situationList).forEach((option) => situationSelect.appendChild(option));
    situationSelect.addEventListener('change', (event) => setSituation(columnMap));
    setSituation(columnMap);
   
}

async function getCurrentTabId() {
    const queryOptions = { active: true, currentWindow: true };
    const [currentTab] = await chrome.tabs.query(queryOptions);
    return currentTab.id;
}

async function fillFormClickHandler() {
    chrome.storage.sync.set({ outputTitle: outputTitle.value, outputDescription: outputDescription.value, outputLocation: outputLocation });
    chrome.scripting.executeScript(
        {
            target: { tabId: await getCurrentTabId() },
            files: ['injector.js'],
        },
        function (injectionResults) { }
    );
}

chrome.runtime.sendMessage({ name: 'fetchAssets' }, (assetList) => {
    assetSource = assetList;
    assetData = assetList.map(function (asset) {
        return {
            area: asset.area,
            place: asset.place,
            coordinate: asset.coordinate,
            device: asset.device,
            model: asset.model,
            asset: asset.asset
        };
    });
    const assetKeys = Object.keys(assetData[0]);

    generateTableHead(assetTable, assetKeys);
    generateTableBody(assetTable, assetData);

    const columnMap = (row) => (name) => row.cells[assetKeys.indexOf(name)].innerText;

    const tableRows = assetTable.querySelectorAll('tbody tr');
    tableRows.forEach((row) => row.addEventListener('click', (clickEvent) => rowClickHandler(row, columnMap(row), tableRows)));
    searchField.addEventListener('keyup', (keyEvent) => filterTable(tableRows, searchField.value));
    fillForm.addEventListener('click', (clickEvent) => fillFormClickHandler());
});

