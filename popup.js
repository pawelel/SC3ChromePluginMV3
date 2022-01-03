const assetTable = document.querySelector('#assetTable');
const searchField = document.querySelector('#searchField');
const fillForm = document.querySelector('#fillForm');
const outputTitle = document.querySelector('#output-title');
const reportDate = document.querySelector('#report-date');
const outputDescription = document.querySelector('#description');
const situationSelect = document.querySelector('#situation-select');
const outage = document.querySelector('#outage');
const first = document.querySelector('.first');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const last = document.querySelector('.last');
var page = 0;
var outputLocation = '';
var outageTime = '';
var situationList;
var assetList;
var assetSource;
var generalDescription = '';
var reportTime = '';

setOutage();
setDate();



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
function setOutage() {
    var form = document.getElementById('outage-period');
    var date = new Date();
    if (outage.checked) {
        var outageFrom = document.createElement("input");
        outageFrom.id = 'outage-from';
        outageFrom.type = 'time';
        outageFrom.value = date.toISOString().slice(11, 16);
        form.appendChild(outageFrom);
        var outageTo = document.createElement("input");
        outageTo.id = 'outage-to';
        outageTo.type = 'time';
        outageTo.value = date.toISOString().slice(11, 16);
        form.appendChild(outageTo);
        outageFrom.addEventListener('change', (changeEvent) => {
            outageTime = `Outage: ${changeEvent.target.value} - ${outageTo.value}\n`;
            outputDescription.value = reportTime + outageTime + generalDescription;
        });
        outageTo.addEventListener('change', (changeEvent) => {
            outageTime = `Outage: ${outageFrom.value} - ${changeEvent.target.value} \n`;
            outputDescription.value = reportTime + outageTime + generalDescription;
        });
        outageTime = "Outage: " + outageFrom.value + ' - ' + outageTo.value + '\n';
        outputDescription.value = reportTime + outageTime + generalDescription;
    } else {
        while (form.lastChild) {
            form.removeChild(form.lastChild);
            outageTime = '';
            outputDescription.value = reportTime + outageTime + generalDescription;
        }
    }
}

function setDate() {
    if (reportDate.value === '') {
        reportDate.value = new Date().toISOString().slice(0, 16);
        reportTime = "Report time: " + (reportDate.value).replace('T', ' ') + '\n';
        outputDescription.value = reportTime + outageTime + generalDescription;
    } else {
        reportDate.addEventListener('change', (changeEvent) => {
            reportTime = "Report time: " + (changeEvent.target.value).replace('T', ' ') + '\n';
            outputDescription.value = reportTime + outageTime + generalDescription;
        });
    }
}

function setSituation(columnMap) {
    outputTitle.value = '';
    const situationName = situationSelect?.options[situationSelect?.selectedIndex]?.text;
    if (situationName && columnMap('asset')) {
        outputTitle.value = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}] [${columnMap('model')}] [${columnMap('asset')}] [${situationName}]`;
        outputLocation = `[${columnMap('area')}] [${columnMap('place')}] [${columnMap('coordinate')}]`;
        generalDescription = situationList.find((situation) => situation.name === situationName).description.join('\n');
        outputDescription.value = reportTime + outageTime + generalDescription;
    }
}

let oldListener = null;
function rowClickHandler(selectedRow, columnMap, tableRows) {
    tableRows.forEach((row) => row.classList.remove('selected'));
    selectedRow.classList.add('selected');

    if (oldListener) {
        situationSelect.removeEventListener('change', oldListener);
    }

    Array.from(situationSelect.children).forEach((child) => child.remove());
    situationList = assetSource.find((asset) => asset.asset === columnMap('asset')).situations;
    generateOptions(situationList).forEach((option) => situationSelect.appendChild(option));
    setSituation(columnMap);
    oldListener = (event) => setSituation(columnMap);
    situationSelect.addEventListener('change', oldListener);
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
outage.addEventListener('change', (event) => setOutage());
reportDate.addEventListener('change', (event) => setDate());
chrome.runtime.sendMessage({ name: 'fetchAssets' }, (response) => {
    assetSource = response;
    

    assetList = response.map(function (asset) {
        return {
            area: asset.area,
            place: asset.place,
            coordinate: asset.coordinate,
            device: asset.device,
            model: asset.model,
            asset: asset.asset
        };
    });
    const assetKeys = Object.keys(assetList[0]);

    generateTableHead(assetTable, assetKeys);
    generateTableBody(assetTable, assetList);

    const columnMap = (row) => (name) => row.cells[assetKeys.indexOf(name)].innerText;

    const tableRows = assetTable.querySelectorAll('tbody tr');
    tableRows.forEach((row) => row.addEventListener('click', (clickEvent) => rowClickHandler(row, columnMap(row), tableRows)));
    searchField.addEventListener('keyup', (keyEvent) => filterTable(tableRows, searchField.value));
    fillForm.addEventListener('click', (clickEvent) => fillFormClickHandler());

});
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
    page = 0;
    let tbody = tableElement.createTBody();
    for (let i = 0; i < page +10; i++) {
        let row = tbody.insertRow();
        for (var key in bodyData[i]) {
            let cell = row.insertCell();
            let text = document.createTextNode(bodyData[i][key]);
            cell.appendChild(text);
        }        
    }
    next.addEventListener('click', () => {
       page = (page == bodyData.length - 10) ? 0 : (page += 10);
        tbody.innerHTML = '';
        for (let i = page; i < page + 10; i++) {
            let row = tbody.insertRow();
            for (var key in bodyData[i]) {
                let cell = row.insertCell();
                let text = document.createTextNode(bodyData[i][key]);
                cell.appendChild(text);
            }
        }
    });
   prev.addEventListener('click', () => {
      page = (page == 0) ? bodyData.length - 10 : (page -= 10);
         tbody.innerHTML = '';
            for (let i = page; i < page + 10; i++) {
                let row = tbody.insertRow();
                for (var key in bodyData[i]) {
                    let cell = row.insertCell();
                    let text = document.createTextNode(bodyData[i][key]);
                    cell.appendChild(text);
                }
            }
    });
    first.addEventListener('click', () => {
        page = 0;
        tbody.innerHTML = '';
        for (let i = page; i < page + 10; i++) {
            let row = tbody.insertRow();
            for (var key in bodyData[i]) {
                let cell = row.insertCell();
                let text = document.createTextNode(bodyData[i][key]);
                cell.appendChild(text);
            }
        }
    });
    last.addEventListener('click', () => {
        page = bodyData.length - 10;
        tbody.innerHTML = '';
        for (let i = page; i < page + 10; i++) {
            let row = tbody.insertRow();
            for (var key in bodyData[i]) {
                let cell = row.insertCell();
                let text = document.createTextNode(bodyData[i][key]);
                cell.appendChild(text);
            }
        }
    });
}

function filterTable(tableRows, filter) {
    tableRows.forEach((row) => (row.innerText.toUpperCase().includes(filter.toUpperCase()) ? (row.style.display = '') : (row.style.display = 'none')));
}
