import {DummyPersistentStore} from "./persistentStore.js";

const txt = document.createTextNode.bind(document);

function e(tagName, attributes) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) elem.classList.add(...attributes.class);
    return elem;
}

function addButtonElement(onClickHandler) {
    const root = e("div", {class: ["add-button"]});
    root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onClickHandler();
    });
    root.appendChild(txt("+"));
    return root;
}

function deleteButtonElement(onClickHandler) {
    const root = e("div", {class: ["delete-button"]});
    root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onClickHandler();
    });
    root.appendChild(txt("X"));
    return root;
}

function editButtonElement(onClickHandler) {
    const root = e("div", {class: ["edit-button"]});
    root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onClickHandler();
    });
    root.appendChild(txt("E"));
    return root;
}

// Collection Detail

function todoBoxElement(collectionID, todoID, todoData) {
    const elem = e("div", {class: ["todo-box"]});

    const checkbox = elem.appendChild(e("input", {}));
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = todoData.done;
    checkbox.addEventListener("change", (event) => {
        editTodo(collectionID, todoID, event.target.checked, null);
        saveAndRender();
    });

    const title = elem.appendChild(e("span", {class: ["todo-title"]}));
    title.appendChild(txt(todoData.title));

    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", todoData.title);
        if (result !== null && result != "") {
            editTodo(collectionID, todoID, null, result);
            saveAndRender();
        }
    }));
    elem.appendChild(deleteButtonElement(() => {
        deleteTodo(collectionID, todoID);
        saveAndRender();
    }));

    return elem;
}

function collectionDetailBodyElement(collectionData) {
    const elem = e("div", {id: "app-body", class: ["collection-detail-body"]});
    for (const [todoID, todoData] of collectionData.todos.entries()) {
        elem.appendChild(todoBoxElement(
            collectionData.id,
            todoID,
            todoData,
        ));
    }
    elem.appendChild(addButtonElement(() => {
        newTodo(collectionData.id);
        saveAndRender();
    }));
    return elem;
}

//
// Collections Overview
//

function collectionSummaryElement(collectionSummaryData) {
    const elem = e("div", {class: ["collection-summary-box"]})
    elem.addEventListener("click", (ev) => {
        openCollection(collectionSummaryData.id);
        saveAndRender();
    });

    const nameElem = elem.appendChild(e("span", {class: ["collection-summary-name"]}));
    nameElem.appendChild(txt(collectionSummaryData.name));

    elem.appendChild(deleteButtonElement(() => {
        deleteCollection(collectionSummaryData.id);
        saveAndRender();
    }));
    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", collectionSummaryData.name);
        if (result !== null && result != "") {
            editCollection(collectionSummaryData.id, result);
            saveAndRender();
        }
    }));

    return elem;
}

function collectionsOverviewElement(collectionsData) {
    const elem = e("div", {id: "app-body", class: ["collections-overview-body"]});
    for (const data of collectionsData) {
        elem.appendChild(collectionSummaryElement(
            data,
        ));
    }
    elem.appendChild(addButtonElement(() => {
        newCollection();
        saveAndRender();
    }));
    return elem;
}

function renderCollectionsOverview() {
    rootElement.appendChild(collectionsOverviewElement(
        getAllTodoCollections(),
    ));
}

function renderCollectionDetail() {
    const collectionData = getTodoCollection(state.openCollectionID);

    const head = rootElement.appendChild(e("div", {id: "app-head"}));
    const backButton = head.appendChild(e("div", {id: "head-button-left", class: ["head-button"]}));
    const title = head.appendChild(e("span", {id: "head-title"}));

    backButton.appendChild(txt("Back"));
    backButton.addEventListener("click", (ev) => {
        openOverview();
        saveAndRender();
    });

    const titleText = title.appendChild(e("b", {}));
    titleText.appendChild(txt(collectionData.name));

    rootElement.appendChild(collectionDetailBodyElement(collectionData));
}

function render() {
    rootElement.innerHTML = "";
    switch (state.view) {
        case "collections_overview":
            return renderCollectionsOverview();
        case "collection_detail":
            return renderCollectionDetail();
        default:
            throw "Invalid State";
    }
}

function saveAndRender() {
    render();
    persistentStore.write(data);
}

/*** Data/State Mutators ***/

function openCollection(collectionID) {
    state.view = "collection_detail";
    state.openCollectionID = collectionID;
}
function openOverview() {
    state.view = "collections_overview";
}

function newCollection() {
    data.collections.set(this._nextUnusedID, {
        name: "New List",
        todos: new Map(),
        lastUnusedTodoID: 0,
    });
    ++data.nextUnusedID;
}
function deleteCollection(collectionID) {
    data.collections.delete(collectionID);
}
function editCollection(collectionID, newTitle) {
    const collectionData = data.collections.get(collectionID);
    collectionData.name = newTitle;
}

function newTodo(collectionID) {
    const collectionData = data.collections.get(collectionID)
    collectionData.todos.set(collectionData.lastUnusedTodoID, {
        done: false,
        title: "New Item",
    });
    ++collectionData.lastUnusedTodoID;
}
function deleteTodo(collectionID, todoID) {
    data.collections.get(collectionID).todos.delete(todoID);
}
function editTodo(collectionID, todoID, done, title) {
    const todoData = data.collections.get(collectionID).todos.get(todoID);
    if (done !== null) todoData.done = done;
    if (title !== null) todoData.title = title;
}

/*** Data Read ***/

function getAllTodoCollections() {
    const ret = [];
    for (const [id, collectionData] of data.collections.entries()) {
        ret.push({
            id: id,
            name: collectionData.name,
        });
    }
    return ret;
}

function getTodoCollection(collectionID) {
    const result = data.collections.get(collectionID);
    if (result) {
        return {
            id: collectionID,
            name: result.name,
            todos: result.todos, // This must not be modified by the function user
        };
    }
    return undefined;
}

/*** Globals ***/

const rootElement = document.querySelector("#app");

const persistentStore = new DummyPersistentStore();
const state = {
    view: "collections_overview", // "collections_overview" | "collection_detail"
    openCollectionID: null,
};

let data = persistentStore.read(); // {collections, nextUnusedID}
                                   // SEE persistentStore.js for an example of this data structure.

render();

