import * as groupsRepository from './groups_repository.js';

async function initContent() {
    const textArea = document.getElementById("groupsRecordsJsonContent");
    const groupsList = await groupsRepository.findAll();
    textArea.value = JSON.stringify(groupsList, null, 2);
}

window.onload = function() {
    initContent();
};
