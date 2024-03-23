import * as groupsRepository from './groups_repository.js';
//import * as tradingViewRepository from './tradingview_repository.js';
import * as tradingViewRepository from './tradingview_cmdrequest_repository.js';
//import * as tradingViewRepository from './tradingview_inmemory_repository.js';

const downloadSymbolsStatusesListener = {
    onStart: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "Start download tradingview symbols";
    },
    onLoad: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "Tradingview symbols downloaded successfully";
    },
    onError: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "Error while downloading tradingview symbols";
    }
};

const pushSymbolsStatusesListener = {
    onStart: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "<b>Start</b> pushing symbols to tradingview";
    },
    onLoad: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "Symbols pushed to tradingview <b>successfully</b>";
    },
    onError: () => {
        const statusTextObj = document.getElementById("statusTextId");
        statusTextObj.innerHTML = "<b>Error</b> while pushing tradingview symbols";
    }
};

async function initUiGroupsList() {
    const groupsList = await groupsRepository.findAll();
    if (groupsList.length == 0) {
        console.log("empty groups list");
    }
    //console.log("groups list size: " + groupsList.length, groupsList);
    for (let groupRecord of groupsList) {
        uiAddGroup(groupRecord.groupName, groupRecord);
    }
}

async function saveAsNew() {
    const groupNameRecommendation = await groupsRepository.findFirstVacantGroupName()
    let groupName = prompt("Please enter symbol group name:", groupNameRecommendation);
    if (groupName != null && groupName != "") {
        const exists = await groupsRepository.isGroupNameExists(groupName);
        if (exists) {
            alert("Group name '" + groupName + "' already exists");
            return;
        }

        tradingViewRepository.downloadRedList((response) => {
            const groupRecord = { groupName: groupName, symbols: response.symbols };
            groupsRepository.createGroup(groupRecord);
            uiAddGroup(groupName, groupRecord);
            response.symbols
        }, downloadSymbolsStatusesListener);
    }
}

function uiAddGroup(groupName, groupRecord) {
    const symbolsGroupsDiv = document.getElementById("symbolsGroups");
    const groupButtons = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = "<b>" + groupName + "</b> (" + groupRecord.symbols.length + ")";

    const loadButton = document.createElement("button");
    loadButton.classList.add('loadButton');
    loadButton.textContent = "push to TradingView ";
    loadButton.addEventListener('click', (btn) => {
        pushToTradingView(groupName);
    });

    const onRefreshGroupRecord = (groupRecordToRefresh) => {
        title.innerHTML = "<b>" + groupRecordToRefresh.groupName + "</b> (" + groupRecordToRefresh.symbols.length + ")";
    };

    const overwriteButton = document.createElement("button");
    overwriteButton.classList.add('overwriteButton');
    overwriteButton.textContent = "fetch from TradingView";
    overwriteButton.addEventListener('click', (btn) => {
        fetchFromTradingView(groupName, onRefreshGroupRecord);
    });

    const onRemoveListener = () => {
        groupButtons.remove();
    };

    const delButton = document.createElement("button");
    delButton.classList.add('delButton');
    delButton.textContent = "del";
    delButton.addEventListener('click', () => {
        deleteGroupRecord(groupName, onRemoveListener);
    });


    groupButtons.appendChild(title);
    groupButtons.appendChild(loadButton);
    groupButtons.appendChild(overwriteButton);
    groupButtons.appendChild(delButton);

    symbolsGroupsDiv.appendChild(groupButtons);

}

async function pushToTradingView(groupName) {
    const groupRecord = await (groupsRepository.findSingleRecord(groupName))
    console.log('Push to TradingView button, groupRecord', groupRecord);
    tradingViewRepository.updateRedList(groupRecord.symbols, pushSymbolsStatusesListener);
}

function fetchFromTradingView(groupName, onRefreshGroupRecordListener) {
    const msg = "Do you really want fetch tradingview symbols and overwrite group '" + groupName + "'";
    if (confirm(msg) == true) {
        tradingViewRepository.downloadRedList((response) => {
            const groupRecord = { groupName: groupName, symbols: response.symbols };
            groupsRepository.updateGroup(groupRecord);
            onRefreshGroupRecordListener(groupRecord);
        }, downloadSymbolsStatusesListener);
    }
}

function deleteGroupRecord(groupName, onRemoveListener) {
    const msg = "Do you really want delete group '" + groupName + "'";
    if (confirm(msg) == true) {
        groupsRepository.deleteGroupRecord(groupName);
        onRemoveListener();
    }
}

window.onload = function() {
    initUiGroupsList();

    const button = document.getElementById("saveAsNewButtonId");
    button.addEventListener("click", saveAsNew);

    const exportGroupsListButton = document.getElementById("exportGroupsListButtonId");
    exportGroupsListButton.addEventListener("click", () => {
        browser.tabs.create({url: "/dashboard/export_tab.html"});
    });

    const importGroupsListButton = document.getElementById("importGroupsListButtonId");
    importGroupsListButton.addEventListener("click", () => {
        browser.tabs.create({url: "/dashboard/import_tab.html"});
    });
};
