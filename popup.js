const assetTable = document.querySelector('#assetTable');
const searchField = document.querySelector('#searchField');
const fillForm = document.querySelector('#fillForm');
const outputTitle = document.querySelector('#output-title');
var outputLocation ='';
const outputDescription = document.querySelector('#description');
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
        outputLocation = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}]`;
    }
}

function setDescription(columnMap) {
    outputDescription.value = '';
    const situationName = situationSelect?.options[situationSelect?.selectedIndex]?.text;
    if (situationName && columnMap('asset')) {
        console.log(situationName);
    }
}
function find_in_object(data, query) {
    return data.filter(function(record) { 
      for(var i in record) {
        if(query[i] && query[i].indexOf(record[i]) !== -1) {
          return false;
        }
      }
      return true;
    });
  }

function rowClickHandler(selectedRow, columnMap, tableRows) {
    tableRows.forEach((row) => row.classList.remove('selected'));
    selectedRow.classList.add('selected');

    // TODO: This should really be done with the asset fetching one time if the filter isn't sent.
    const situationList = find_in_object(situationData, { deviceName: columnMap('device') });
        Array.from(situationSelect.children).forEach((child) => child.remove());
        generateOptions(situationList, columnMap('device')).forEach((option) => situationSelect.appendChild(option));
        situationSelect.addEventListener('change', (event) => setSituation(columnMap));
        situationSelect.addEventListener('change', (event) => setDescription(columnMap));
        setSituation(columnMap);
        setDescription(columnMap);
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
    const assetData = assetList.map(function (asset) {
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
    
console.log(assetData);
    generateTableHead(assetTable, assetKeys);
    generateTableBody(assetTable, assetData);

    const columnMap = (row) => (name) => row.cells[assetKeys.indexOf(name)].innerText;

    const tableRows = assetTable.querySelectorAll('tbody tr');
    tableRows.forEach((row) => row.addEventListener('click', (clickEvent) => rowClickHandler(row, columnMap(row), tableRows)));
    searchField.addEventListener('keyup', (keyEvent) => filterTable(tableRows, searchField.value));
    fillForm.addEventListener('click', (clickEvent) => fillFormClickHandler());
});

