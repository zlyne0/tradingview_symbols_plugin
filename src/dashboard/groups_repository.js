import { openDB } from './idb.js';

const GROUPS_STORE_NAME = 'symbolsGroupsObjectStore';

async function findFirstVacantGroupName() {
    const groupsList = await findAll();
    var i = 1;
    var groupName = "";
    do {
        groupName = "group " + i;
        i++;
    } while (isGroupNameExistsOnList(groupsList, groupName));
    return groupName;
}

async function isGroupNameExists(groupName) {
    const groupsList = await findAll();
    return isGroupNameExistsOnList(groupsList, groupName);
}

function isGroupNameExistsOnList(groupsList, groupName) {
    for (let groupRecord of groupsList) {
        if (groupRecord.groupName === groupName) {
            return true;
        }
    }
    return false;
}

async function initRepository() {
    const dbPromise = await openDB('symbolsGroupsDataBase', 4, {
        upgrade(db) {
            console.log("init repository update");
            if (!db.objectStoreNames.contains(GROUPS_STORE_NAME)) {
                console.log('not contains')
                let store = db.createObjectStore(GROUPS_STORE_NAME, {
                    keyPath: 'groupName',
//                    autoIncrement: true
                });
                store.createIndex('groupNameIdx', 'groupName', { unique: true });
            }
        }
    });
    return dbPromise
}

async function createGroup(groupRecord) {
    const db = await initRepository();
    const tx = db.transaction(GROUPS_STORE_NAME, 'readwrite');

    await Promise.all([
        tx.store.add(groupRecord),
        tx.done
    ])
}

async function findAll() {
    const db = await initRepository();
    const allValues = await db.getAll(GROUPS_STORE_NAME);
    return allValues;
}

async function findSingleRecord(groupName) {
    const db = await initRepository();
    const value = await db.get(GROUPS_STORE_NAME, groupName);
    return value;
}

async function deleteGroupRecord(groupName) {
    const db = await initRepository();
    await db.delete(GROUPS_STORE_NAME, groupName);
}

async function updateGroup(groupRecord) {
    const db = await initRepository();
    db.put(GROUPS_STORE_NAME, groupRecord);
}

function isValidFormat(groupsList) {
    if (!Array.isArray(groupsList)) {
        return false;
    }
    if (groupsList.length == 0) {
        return false;
    }
    for (let groupRecord of groupsList) {
        if (!isString(groupRecord.groupName)) {
            return false;
        }
        if (groupRecord.symbols === undefined) {
            return false;
        }
        if (!Array.isArray(groupRecord.symbols)) {
            return false;
        }
        for (let symbol of groupRecord.symbols) {
            if (!isString(symbol)) {
                return false;
            }
        }
    }
    return true;
}

function isString(obj) {
    return typeof obj === 'string' || obj instanceof String || obj != null;
}

export {
    createGroup,
    updateGroup,
    findAll,
    findSingleRecord,
    isGroupNameExists,
    findFirstVacantGroupName,
    deleteGroupRecord,
    isValidFormat
};
