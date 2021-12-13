/*jshint esversion: 6 */

const assetTable = document.querySelector('#assetTable');
const searchField = document.querySelector('#searchField');
const fillForm = document.querySelector('#fillForm');
const outputTitle = document.querySelector('#output-title');
const situationSelect = document.querySelector('#situation-select');

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
    for (let rowData of bodyData) {
        let row = tbody.insertRow();
        row.classList.add('selectme');
        for (let key in rowData) {
            let cell = row.insertCell();
            let text = document.createTextNode(rowData[key]);
            cell.appendChild(text);
        }
    }
}

function filterTable(tableRows, filter) {
    tableRows.forEach((row) => (row.innerText.toUpperCase().includes(filter.toUpperCase()) ? (row.style.display = '') : (row.style.display = 'none')));
}

function generateOptions(situationList, selectedDevice) {
    const options = [];
    for (const situation of situationList) {
        if (selectedDevice === situation.deviceName) {
            const option = document.createElement('option');
            option.value = situation.situationId;
            option.innerHTML = situation.name;
            options.push(option);
        }
    }
    return options;
}

function setSituation(columnMap) {
    outputTitle.value = '';
    const situationName = situationSelect?.options[situationSelect?.selectedIndex]?.text;
    if (situationName && columnMap('device')) {
        outputTitle.value = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}] [${columnMap('model')}] [${columnMap('asset')}] [${situationName}]`;
    }
}

function rowClickHandler(selectedRow, columnMap, tableRows) {
    tableRows.forEach((row) => row.classList.remove('selected'));
    selectedRow.classList.add('selected');

    // TODO: This should really be done with the asset fetching one time if the filter isn't sent.
    chrome.runtime.sendMessage({ name: 'fetchSituations' }, (situationList) => {
        Array.from(situationSelect.children).forEach((child) => child.remove());
        generateOptions(situationList, columnMap('device')).forEach((option) => situationSelect.appendChild(option));
        situationSelect.addEventListener('change', (event) => setSituation(columnMap));
        setSituation(columnMap);
    });
}

async function getCurrentTabId() {
    const queryOptions = { active: true, currentWindow: true };
    const [currentTab] = await chrome.tabs.query(queryOptions);
    return currentTab.id;
}

async function fillFormClickHandler() {
    chrome.storage.sync.set({ outputTitle: outputTitle.value });
    chrome.scripting.executeScript(
        {
            target: { tabId: await getCurrentTabId() },
            files: ['injector.js'],
        },
        function (injectionResults) {}
    );
}

chrome.runtime.sendMessage({ name: 'fetchAssets' }, (assetList) => {
    const assetKeys = Object.keys(assetList[0]);

    generateTableHead(assetTable, assetKeys);
    generateTableBody(assetTable, assetList);

    const columnMap = (row) => (name) => row.cells[assetKeys.indexOf(name)].innerText;

    const tableRows = assetTable.querySelectorAll('.selectme');
    tableRows.forEach((row) => row.addEventListener('click', (clickEvent) => rowClickHandler(row, columnMap(row), tableRows)));
    searchField.addEventListener('keyup', (keyEvent) => filterTable(tableRows, searchField.value));
    fillForm.addEventListener('click', (clickEvent) => fillFormClickHandler());
});
