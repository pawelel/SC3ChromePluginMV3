const assetTable = document.querySelector('#assetTable');
//set locale to Polish
document.getElementById("lang-polish").addEventListener("click", function(){
    table.setLocale("pl-pl");
});

//set default locale
document.getElementById("lang-english").addEventListener("click", function(){
    table.setLocale("en-us");
});
const searchField = document.querySelector('#searchField');
const fillForm = document.querySelector('#fillForm');
fillForm.innerHTML = chrome.i18n.getMessage("fillform");
const outputTitle = document.querySelector('#output-title');
const reportDate = document.querySelector('#report-date');
const reportLabel = document.querySelector('#report-label').innerHTML = chrome.i18n.getMessage("reportlabel");
const outageLabel = document.querySelector('#outage-label').innerHTML = chrome.i18n.getMessage("outagelabel");
const clearFilter = document.querySelector('#filter-clear').innerHTML = chrome.i18n.getMessage("clearfilter");
const outputDescription = document.querySelector('#description');
const situationSelect = document.querySelector('#situation-select');
const outage = document.querySelector('#outage');
//Define variables for input elements
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");
valueEl.placeholder= chrome.i18n.getMessage("filtervalue");
var additional = document.getElementById("additional");
additional.placeholder = chrome.i18n.getMessage("additionaltext");

var table;
var outputLocation = '';
var outageTime = '';
var situationList;
var generalDescription = '';
var reportTime = '';

//Trigger setFilter function with correct parameters
function updateFilter(){
    var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
    var typeVal = typeEl.options[typeEl.selectedIndex].value;
  
    var filter = filterVal == "function" ? customFilter : filterVal;
  
    if(filterVal == "function" ){
      typeEl.disabled = true;
      valueEl.disabled = true;
    }else{
      typeEl.disabled = false;
      valueEl.disabled = false;
    }
  
    if(filterVal){
      table.setFilter(filter,typeVal, valueEl.value);
    }
  }
  
  //Update filters on value change
  document.getElementById("filter-field").addEventListener("change", updateFilter);
  document.getElementById("filter-type").addEventListener("change", updateFilter);
  document.getElementById("filter-value").addEventListener("keyup", updateFilter);
  //Clear filters on "Clear Filters" button click
  document.getElementById("filter-clear").addEventListener("click", function(){
    fieldEl.value = "asset";
    typeEl.value = "like";
    valueEl.value = "";
    
    table.clearFilter();
  });

chrome.runtime.sendMessage({ name: 'fetchAssets' }, (response) => {

    //create Tabulator on DOM element with id "assetTable"
    table = new Tabulator("#assetTable", {
        layout: "fitColumns",
        pagination: "copy",
        selectable: 1,
        locale: "pl-pl",
        paginationSize: 10,
        clipboard: true,
        clipboardCopyRowRange:"visible",
        data: response,
        paginationSizeSelector: [3, 6, 8, 10, 20, 50, 100],
        movableColumns: true,
        langs: {
            "en-us": {
                "pagination": {
                    "page_size": "Page Size",
                    "first": "First",
                    "first_title": "First Page",
                    "last": "Last",
                    "last_title": "Last Page",
                    "prev": "Prev",
                    "prev_title": "Previous Page",
                    "next": "Next",
                    "next_title": "Next Page",
                    "all": "All",
                },
                "columns": {
                    "asset": "Asset",
                    "area": "Area",
                    "place": "Place",
                    "device": "Device",
                    "model": "Model",
                    "coordinate": "Coordinate"
                }
            },
            "pl-pl": {
                "pagination": {
                    "page_size": "Rozmiar strony",
                    "first": "Pierwsza",
                    "first_title": "Pięta strona",
                    "last": "Ostatnia",
                    "last_title": "Osatnia strona",
                    "prev": "Prev",
                    "prev_title": "Poprzednia strona",
                    "next": "Następna",
                    "next_title": "Następna strona",
                    "all": "Wszystkie"
                },
                "columns": {
                    "asset": "Asset",
                    "area": "Obszar",
                    "place": "Miejsce",
                    "device": "Sprzęt",
                    "model": "Model",
                    "coordinate": "Koordynaty"
                }
            }
        },
        columns: [
            { title: "Asset", field: "asset", headerFilter: "input", headerFilterPlaceholder: "assets" },
            { title: "Area", field: "area", headerFilter: "input", headerFilterPlaceholder: "areas", width: 100 },
            { title: "Place", field: "place", headerFilter: "input", headerFilterPlaceholder: "places", width: 100 },
            { title: "Device", field: "device", headerFilter: "input", headerFilterPlaceholder: "devices", width: 100 },
            { title: "Model", field: "model", headerFilter: "input", headerFilterPlaceholder: "models", width: 100 },
            { title: "Coordinate", field: "coordinate", headerFilter: "input", headerFilterPlaceholder: "coordinates", width: 100 }
        ]
    });
               
    var initialOption = document.createElement('option');
    initialOption.value = '';
    initialOption.text = chrome.i18n.getMessage("firstdropdowntext");
    situationSelect.appendChild(initialOption);

    fillForm.addEventListener('click', () => fillFormClickHandler());

    //trigger an alert message when the row is clicked
    table.on("rowClick", function (e, row) {
        var assetRow = row.getData();
        var assetName = assetRow.asset;
        //remove situation options from select
        Array.from(situationSelect.children).forEach((child) => child.remove());

        situationList = filterByValue(response, assetName)[0].situations;
        console.log(situationList);
        generateOptions(situationList).forEach((option) => situationSelect.appendChild(option));
        setSituation(situationList, assetRow);
        situationSelect.addEventListener('change', (changeEvent) => setSituation(situationList, assetRow));
    });
});

setOutage();
setDate();

function filterByValue(array, value) {
    return array.filter((data) => JSON.stringify(data).toLowerCase().indexOf(value.toLowerCase()) !== -1);
}


function generateOptions(situationList) {
    const options = [];
    var initialOption = document.createElement('option');
    initialOption.value = '';
    initialOption.text = chrome.i18n.getMessage("seconddropdowntext");
    options.push(initialOption);
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
var assetDate = new Date().toISOString().slice(0, 10);
//trigger download of data.xlsx file
document.getElementById("download-xlsx").addEventListener("click", function(){
    table.download("xlsx", "AssetList"+assetDate+".xlsx", {sheetName:"My Data"});
});

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

function setSituation(situationList, assetRow) {
    outputTitle.value = '';
    const situationName = situationSelect?.options[situationSelect?.selectedIndex]?.text;
    if (situationName&&situationName!=chrome.i18n.getMessage("seconddropdowntext")&&situationName!=chrome.i18n.getMessage("firstdropdowntext") && assetRow.asset) {
        outputTitle.value = `[${assetRow.area}] [${assetRow.place}] [${assetRow.coordinate}] [${assetRow.device}] [${assetRow.asset}] [${situationName}]`;
        outputLocation = `[${assetRow.area}] [${assetRow.place}] [${assetRow.coordinate}]`;
        if(situationSelect?.options[situationSelect?.selectedIndex]?.value>0){
        generalDescription = situationList.find((situation) => situation.name === situationName).description.join('\n');
        }
        outputDescription.value = reportTime + outageTime + generalDescription;
    }else{
        outputTitle.value = '';
        outputLocation = '';
        generalDescription = '';
        outputDescription.value = reportTime + outageTime + generalDescription;
    }
}

async function getCurrentTabId() {
    const queryOptions = { active: true, currentWindow: true };
    const [currentTab] = await chrome.tabs.query(queryOptions);
    return currentTab.id;
}

async function fillFormClickHandler() {
    additional = document.getElementById("additional");
if(additional.value!=""){
    chrome.storage.sync.set({ outputTitle: outputTitle.value, outputDescription: outputDescription.value+'\n'+additional.value, outputLocation: outputLocation });
}else{
    chrome.storage.sync.set({ outputTitle: outputTitle.value, outputDescription: outputDescription.value, outputLocation: outputLocation });
}
    chrome.scripting.executeScript({
        target: { tabId: await getCurrentTabId() },
        files: ['injector.js'],
    },
        function (injectionResults) { }
    );
}
outage.addEventListener('change', (event) => setOutage());
reportDate.addEventListener('change', (event) => setDate());