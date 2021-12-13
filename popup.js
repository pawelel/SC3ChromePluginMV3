/*jshint esversion: 6 */
var device;
chrome.runtime.sendMessage({ name: 'fetchAssets' }, (assetList) => {
  function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement('th');
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      row.classList.add('selectme');
      for (let key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
var situationId;
var area;
var place;
var coordinate;
var model;
var asset;
  let table = document.querySelector('#assetTable');
let title = document.querySelector('#output-title');
  let data = Object.keys(assetList[0]);
  generateTableHead(table, data);
  generateTable(table, assetList);
  function filterTable() {
    var input, filter, table, tr, td, i;
    table = document.querySelector('#assetTable');
    input = document.getElementById('searchField');
    filter = input.value.toUpperCase();
    var rows = table.getElementsByTagName('tr');
    for (i = 1; i < rows.length; i++) {
      var cells = rows[i].getElementsByTagName('td');
      var j;
      var rowContainsFilter = false;
      for (j = 0; j < cells.length; j++) {
        if (cells[j]) {
          if (cells[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
            rowContainsFilter = true;
            continue;
          }
        }
      }

      if (!rowContainsFilter) {
        rows[i].style.display = 'none';
      } else {
        rows[i].style.display = '';
      }
    }
  }
  $('.selectme').on('click', function () {
    $(this).addClass('selected').siblings().removeClass('selected');
    device = $(this).find('td:nth-child(4)').text();
     area = $(this).find('td:first-child').text();
     place = $(this).find('td:nth-child(2)').text();
     coordinate = $(this).find('td:nth-child(3)').text();
     model = $(this).find('td:nth-child(5)').text();
     asset = $(this).find('td:nth-child(6)').text();
title.value='';
    chrome.runtime.sendMessage({ name: 'fetchSituations' }, (situationList) => {
      console.log(situationList);
      function generateOptions() {
        let select = document.getElementById('situation-select');
        // clear the options
    while (select.firstChild) {
      select.removeChild(select.firstChild);
  }
  let start = document.createElement('option');
          start.value = '';
          start.text = 'Select a situation';
          select.add(start);
        for (let situation of situationList) {
          if (situation.deviceName === device) {
            let option = document.createElement('option');
            option.text = situation.name;
            option.value = situation.situationId;
            select.add(option);
          }
        }
      }
      generateOptions();
      document
        .querySelector('.selected')
        .addEventListener('change', generateOptions);
    });
    $('#situation-select').on('change', function () {
      situationId = $(this).val();
      let situationName = $(this).find(':selected').text();
      if(device!=null){
  title.value = "[" + area + "] " +"["+ place +"] "+ " [" + coordinate + "] " +"["+ model +"] "+ " [" + asset + "] " + " [" + situationName + "]";
      }
    });
  });
 
//hello
 
  document.querySelector('#searchField').addEventListener('keyup', filterTable);
});
 //when i click on my button
 document.getElementById('fillForm').addEventListener('click', function () {
  
  let outputTitle = document.getElementById('output-title').value;

  chrome.scripting.executeScript({
      //send the value to be used by script
           
  }, function () {
      //run the script in the file injector.js
      chrome.scripting.executeScript({
          files: ['injector.js']
      });
  });
  console.log(outputTitle);
});

// chrome.runtime.sendMessage({ name: 'fetchTable' }, (response) => {
//   async function loadIntoTable(response, table) {
//     const tableHead = table.querySelector('thead')
//     const tableBody = table.querySelector('tbody')

//     //clear the table
//     tableHead.innerHTML =
//       '<tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr>'
//     tableBody.innerHTML = ''
//     //add the headers
//   for(let i = 0; i < 6; i++) {
//     tableHead.querySelector('tr').innerHTML += `<th>${response[0]}</th>`
//   }
// }

//   loadIntoTable(response, document.querySelector('table'))
// });

////button click
//document.getElementById('fillForm').addEventListener('click', function () {
//    //take text from fields
//    var titleValue = document.getElementById('titlevalue').value;
//    var descriptionValue = document.getElementById('descriptionvalue').value;
//    chrome.tabs.executeScript({
//        //send variables to script
//        code: `var titleValue = ${titleValue};
//               var descriptionValue = ${descriptionValue};`
//    }, function () {
//        //run the script in the file injector.js
//        chrome.tabs.executeScript({
//            file: 'background.js'
//        });
//    });
//});

//let fillData = document.getElementById('fillData');

//fillData.onclick = function (element) {
//    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//        chrome.tabs.executeScript(
//            tabs[0].id,
//            { file: 'inject-scripts.js' });
//    });
//};

//chrome.commands.onCommand.addListener(function (command) {
//    console.log(command);
//    if (command == 'fill_form') {
//        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//            chrome.tabs.executeScript(
//                tabs[0].id,
//                { file: 'inject-scripts.js' });
//        });
//    }
//});

//multiple options for select
//function displayUsers(users){
//   var sel = document.querySelector('.select-text');
//   users.forEach( function(user){

//     let opt = document.createElement('option');
//     opt.value=users.id;
//     opt.innerHTML += user.name
//     sel.appendChild(opt);
//   });
//};
