import * as groupsRepository from './groups_repository.js';

async function importAction() {
    const textArea = document.getElementById("groupsRecordsJsonContent");
    let groupsList;
    try {
        groupsList = JSON.parse(textArea.value);
    } catch (e) {
        console.log('error', e);
        alert('Invalid format');
        return;
    }

    if (!groupsRepository.isValidFormat(groupsList)) {
        alert('Invalid format');
        return;
    }

    for (let groupRecord of groupsList) {
        if (await groupsRepository.isGroupNameExists(groupRecord.groupName)) {
            alert('Group name "' + groupRecord.groupName + '" already exists');
            return;
        }
        groupsRepository.createGroup(groupRecord);
    }
    alert('Import complete');
}

function initContent() {
    const importButton = document.getElementById("groupsImportButtonId");
    importButton.addEventListener("click", importAction);
}

window.onload = function() {
    initContent();
};
