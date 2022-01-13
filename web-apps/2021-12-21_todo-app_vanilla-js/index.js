import {
    // Data Mutators
    resetAppData,
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
    decomposedDeltaToString,
} from "./utils.js";

const txt = document.createTextNode.bind(document);

function e(tagName, attributes) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) {
        console.assert(attributes.class instanceof Array, "Class must be an array.");
        elem.classList.add(...attributes.class);
    }
    return elem;
}

// Basically used as a cheat so functions that are expected to return an element
// can return some form of "null".
function nullElement() {
    const elem = e("div", {});
    elem.style.display = "none";
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
    if (numericTimeDue === null) return nullElement();

    const decomposed = decomposeNumericTimeDelta(numericTimeDue - numericTimeNow);
    const overdue = (decomposed.sign < 0);

    const tooltipText = "Due on " + (new Date(numericTimeDue)).toString();
    const elementText = decomposedDeltaToString(decomposed);

    const elem = e("span", {class: ["todo-time-due"]});
    if (overdue) elem.classList.add("todo-time-due-overdue");
    elem.setAttribute("title", tooltipText);
    elem.appendChild(txt(elementText));
    return elem;
}

/*** Render Collection Detail ***/

function todoBoxTitleElement(collectionID, todoID, done, titleText) {
    const elem = e("span", {class: ["todo-title"]});
    if (state.expandedTodoID === todoID) {
        const textbox = elem.appendChild(e("input", {class: ["todo-title-textbox"]}));
        textbox.setAttribute("type", "text");
        textbox.setAttribute("value", titleText);
        textbox.addEventListener("change", (ev) => {
            const newTitle = ev.target.value;
            console.assert(typeof newTitle === "string");
            editTodo(collectionID, todoID, undefined, newTitle, undefined, undefined);
            render();
        });
    } else {
        elem.appendChild(txt(titleText));
        if (done) elem.classList.add("todo-title-done");
    }
    return elem;
}

function todoBoxDueDateInputElement(collectionID, todoID, numericalDueDate) {
    const isoStringDueDate = (numericalDueDate === null) ? "" : (new Date(numericalDueDate)).toISOString().slice(0, 16);

    const elem = e("input", {});
    elem.setAttribute("type", "datetime-local");
    elem.value = isoStringDueDate;
    elem.addEventListener("change", (ev) => {
        const value = ev.target.value;
        console.assert(typeof value === "string");
        const newDueDate = (value === "") ? null : (new Date(value)).getTime();
        editTodo(collectionID, todoID, undefined, undefined, newDueDate, undefined);
        render();
    });
    return elem;
}

function todoBoxInnerUpperElement(collectionID, todoID, todoData) {
    const elem = e("div", {class: ["todo-box-inner-upper"]});

    const checkbox = elem.appendChild(e("input", {}));
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = todoData.done;
    checkbox.addEventListener("change", (ev) => {
        editTodo(collectionID, todoID, ev.target.checked, undefined, undefined, undefined);
        render();
    });
    checkbox.addEventListener("click", (ev) => {
        ev.stopPropagation();
    });

    elem.appendChild(todoBoxTitleElement(collectionID, todoID, todoData.done, todoData.title));

    elem.appendChild(timeDueElement(todoData.timeDue, Date.now()));

    elem.appendChild(editButtonElement(() => {
        toggleExpandedTodo(todoID);
        render();
    }));
    elem.appendChild(deleteButtonElement(() => {
        deleteTodo(collectionID, todoID);
        render();
    }));

    return elem;
}

function todoBoxInnerLowerElement(collectionID, todoID, todoData) {
    const elem = e("div", {class: ["todo-box-inner-lower"]});

    const notesHeader = elem.appendChild(e("span", {class: ["todo-header"]}));
    notesHeader.appendChild(txt("Notes:"));

    const notesBox = elem.appendChild(e("textarea", {class: ["todo-notes"]}));
    notesBox.appendChild(txt(todoData.notes));
    notesBox.addEventListener("change", (ev) => {
        const newText = ev.target.value;
        console.assert(typeof newText === "string");
        editTodo(collectionID, todoID, undefined, undefined, undefined, newText);
        render();
    });

    const dueDateInputHeader = elem.appendChild(e("span", {class: ["todo-header"]}));
    dueDateInputHeader.appendChild(txt("Due Date:"));

    elem.appendChild(todoBoxDueDateInputElement(collectionID, todoID, todoData.timeDue));

    return elem;
}

function todoBoxElement(collectionID, todoID, todoData) {
    const elem = e("div", {class: ["todo-box"]});
    elem.appendChild(todoBoxInnerUpperElement(collectionID, todoID, todoData));
    if (state.expandedTodoID == todoID) {
        elem.appendChild(todoBoxInnerLowerElement(collectionID, todoID, todoData));
        elem.addEventListener("click", (ev) => {
            ev.stopPropagation();
        });
    } else {
        elem.addEventListener("click", (ev) => {
            ev.stopPropagation();
            toggleExpandedTodo(todoID);
            render();
        });
    }
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
        toggleExpandedTodo(newTodo(collectionData.id));
        render();
    }));
    elem.addEventListener("click", (ev) => {
        toggleExpandedTodo(null);
        render();
    });
    return elem;
}

function renderCollectionDetail() {
    const collectionData = getTodoCollection(state.openCollectionID);

    const head = rootElement.appendChild(e("div", {id: "app-head"}));
    const backButton = head.appendChild(e("div", {class: ["head-button"]}));
    const title = head.appendChild(e("span", {id: "head-title"}));
    const editButton = head.appendChild(e("div", {class: ["head-button"]}));

    backButton.appendChild(txt("Back"));
    backButton.addEventListener("click", (ev) => {
        openOverview();
        render();
    });

    const titleText = title.appendChild(e("b", {}));
    titleText.appendChild(txt(collectionData.name));

    editButton.appendChild(txt("Edit Title"));
    editButton.addEventListener("click", (ev) => {
        handleEditTitleEvent(collectionData.id, collectionData.name);
        render();
    });

    rootElement.appendChild(collectionDetailBodyElement(collectionData));
}

/*** Render Collections Overview ***/

function collectionSummaryInnerUpperElement(collectionSummaryData) {
    const elem = e("div", {class: ["collection-summary-box-inner-upper"]});

    const nameElem = elem.appendChild(e("span", {class: ["collection-summary-name"]}));
    nameElem.appendChild(txt(collectionSummaryData.name));

    elem.appendChild(editButtonElement(() => handleEditTitleEvent(collectionSummaryData.id, collectionSummaryData.name)));
    elem.appendChild(deleteButtonElement(() => {
        deleteCollection(collectionSummaryData.id);
        render();
    }));
    return elem;
}

function collectionSummaryInnerLowerElement(collectionSummaryData) {
    const elem = e("div", {class: ["collection-summary-box-inner-lower"]});

    const doneStats = elem.appendChild(e("span", {}));

    const doneStatsText = (collectionSummaryData.totalNotYetDone == 0)
                          ? "All tasks done!"
                          : collectionSummaryData.totalNotYetDone.toString() + " more tasks to do.";
    doneStats.appendChild(txt(doneStatsText));

    if (collectionSummaryData.totalNotYetDone != 0) {
        const soonestDueDateStat = elem.appendChild(e("span", {}));
        const soonestDueDateStatText = (()=>{
            if (collectionSummaryData.soonestDueDate === undefined) return "No tasks due.";

            const now = Date.now();
            const delta = decomposeNumericTimeDelta(collectionSummaryData.soonestDueDate - now);
            if (delta.sign < 0) {
                delta.sign = 1; // Overwrite
                return "Next task is overdue by " + decomposedDeltaToString(delta, "long") + ".";
            } else {
                return "Next task is due in " + decomposedDeltaToString(delta, "long") + ".";
            }
        })();
        soonestDueDateStat.appendChild(txt(soonestDueDateStatText));
    }

    return elem;
}

function collectionSummaryElement(collectionSummaryData) {
    const elem = e("div", {class: ["collection-summary-box"]});
    elem.addEventListener("click", (ev) => {
        openCollection(collectionSummaryData.id);
        render();
    });

    elem.appendChild(collectionSummaryInnerUpperElement(collectionSummaryData));
    elem.appendChild(collectionSummaryInnerLowerElement(collectionSummaryData));
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

/*** Render Root ***/

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

function openCollection(collectionID) {
    state.view = "collection_detail";
    state.openCollectionID = collectionID;
    state.expandedTodoID = null;
}
function openOverview() {
    state.view = "collections_overview";
}

function toggleExpandedTodo(todoID) {
    state.expandedTodoID = (state.expandedTodoID === todoID) ? null : todoID;
}

/*** Other ***/

function handleEditTitleEvent(collectionID, oldCollectionName) {
    const result = window.prompt("Please enter a new title.", oldCollectionName);
    if (result !== null && result != "") {
        editCollection(collectionID, result);
        render();
    }
}

/*** Globals ***/

const state = {
    view: "collections_overview", // "collections_overview" | "collection_detail"
    openCollectionID: null,
    expandedTodoID: null,
};

const rootElement = document.querySelector("#app");

document.querySelector("#app-reset-button").addEventListener("click", (ev) => {
    if (window.confirm("Are you sure you want to wipe all user data?")) {
        resetAppData();
        render();
    }
});

render();

