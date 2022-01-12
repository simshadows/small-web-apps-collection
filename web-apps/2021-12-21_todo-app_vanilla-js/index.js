import {
    // Data Mutators
    newCollection,
    deleteCollection,
    editCollection,
    newTodo,
    deleteTodo,
    editTodo,

    // Data Read
    getAllTodoCollections,
    getTodoCollection,
} from "./data.js";
import {
    decomposeNumericTimeDelta,
} from "./utils.js";

const txt = document.createTextNode.bind(document);

function e(tagName, attributes) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) elem.classList.add(...attributes.class);
    return elem;
}

function simpleButtonElement(htmlClass, text, onClickHandler) {
    const root = e("div", {class: [htmlClass]});
    root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onClickHandler();
    });
    root.appendChild(txt(text));
    return root;
}
function addButtonElement(onClickHandler) {
    return simpleButtonElement("add-button", "+", onClickHandler);
}
function deleteButtonElement(onClickHandler) {
    return simpleButtonElement("delete-button", "X", onClickHandler);
}
function editButtonElement(onClickHandler) {
    return simpleButtonElement("edit-button", "E", onClickHandler);
}

function timeDueElement(numericTimeDue, numericTimeNow) {
    const decomposed = decomposeNumericTimeDelta(numericTimeDue - numericTimeNow);
    const overdue = (decomposed.sign < 0);

    const tooltipText = "Due on " + (new Date(numericTimeDue)).toString();
    const elementText = (()=>{
        return (overdue ? "Overdue " : "Due in ") + (()=>{
            if (decomposed.days > 0) {
                return decomposed.days.toString() + " days";
            } else if (decomposed.hours > 0) {
                return decomposed.hours.toString() + " hours";
            } else if (decomposed.minutes > 0) {
                return decomposed.minutes.toString() + " minutes";
            } else {
                return decomposed.seconds.toString() + " seconds";
            }
        })();
    })();

    const elem = e("span", {class: ["todo-time-due"]});
    if (overdue) elem.classList.add("todo-time-due-overdue");
    elem.setAttribute("title", tooltipText);
    elem.appendChild(txt(elementText));
    return elem;
}

// Collection Detail

function todoBoxElement(collectionID, todoID, todoData) {
    const elem = e("div", {class: ["todo-box"]});

    const checkbox = elem.appendChild(e("input", {}));
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = todoData.done;
    checkbox.addEventListener("change", (event) => {
        editTodo(collectionID, todoID, event.target.checked, null);
        render();
    });

    const title = elem.appendChild(e("span", {class: ["todo-title"]}));
    title.appendChild(txt(todoData.title));

    elem.appendChild(timeDueElement(todoData.timeDue, Date.now()));

    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", todoData.title);
        if (result !== null && result != "") {
            editTodo(collectionID, todoID, null, result);
            render();
        }
    }));
    elem.appendChild(deleteButtonElement(() => {
        deleteTodo(collectionID, todoID);
        render();
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
        render();
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
        render();
    });

    const nameElem = elem.appendChild(e("span", {class: ["collection-summary-name"]}));
    nameElem.appendChild(txt(collectionSummaryData.name));

    elem.appendChild(deleteButtonElement(() => {
        deleteCollection(collectionSummaryData.id);
        render();
    }));
    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", collectionSummaryData.name);
        if (result !== null && result != "") {
            editCollection(collectionSummaryData.id, result);
            render();
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
        render();
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
        render();
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

/*** State Mutators ***/

export function openCollection(collectionID) {
    state.view = "collection_detail";
    state.openCollectionID = collectionID;
}
export function openOverview() {
    state.view = "collections_overview";
}

/*** Globals ***/

const state = {
    view: "collections_overview", // "collections_overview" | "collection_detail"
    openCollectionID: null,
};

const rootElement = document.querySelector("#app");

render();

