const txt = document.createTextNode.bind(document);

function e(tagName, attributes) {
    const elem = document.createElement(tagName);
    if ("id" in attributes) elem.setAttribute("id", attributes.id);
    if ("class" in attributes) elem.classList.add(...attributes.class);
    return elem;
}

class DummyDB {
    constructor() {
        this._data = new Map([
            [0, {
                name: "My awesome list!",
                todos: new Map([
                    [0, {
                        done: false,
                        title: "Foo",
                    }],
                    [1, {
                        done: true,
                        title: "Bar",
                    }],
                    [2, {
                        done: false,
                        title: "Baz",
                    }],
                ]),
                lastUnusedTodoID: 3,
            }],
            [1, {
                name: "Empty List",
                todos: new Map(), // Empty
                lastUnusedTodoID: 0,
            }],
        ]);
        this._nextUnusedID = 3;
    }
    getAllTodoCollections() {
        const ret = [];
        for (const [id, data] of this._data.entries()) {
            ret.push({
                id: id,
                name: data.name,
            });
        }
        return ret;
    }
    getTodoCollection(collectionID) {
        const result = this._data.get(collectionID);
        if (result) {
            return {
                id: collectionID,
                name: result.name,
                todos: result.todos, // This must not be modified by the function user
            };
        } else {
            return undefined;
        }
    }

    newTodo(collectionID) {
        const collectionData = this._data.get(collectionID)
        collectionData.todos.set(collectionData.lastUnusedTodoID, {
            done: false,
            title: "New Item",
        });
        ++collectionData.lastUnusedTodoID;
    }
    updateTodo(collectionID, todoID, done, title) {
        const todoData = this._data.get(collectionID).todos.get(todoID);
        if (done !== null) {
            todoData.done = done;
        }
        if (title !== null) {
            todoData.title = title;
        }
    }
    deleteTodo(collectionID, todoID) {
        this._data.get(collectionID).todos.delete(todoID);
    }

    newCollection() {
        this._data.set(this._nextUnusedID, {
            name: "New List",
            todos: new Map(),
            lastUnusedTodoID: 0,
        });
        ++this._nextUnusedID;
    }
    deleteCollection(collectionID) {
        this._data.delete(collectionID);
    }
    editCollection(collectionID, newTitle) {
        const collectionData = this._data.get(collectionID);
        collectionData.name = newTitle;
    }
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
        render();
    });

    const title = elem.appendChild(e("span", {class: ["todo-title"]}));
    title.appendChild(txt(todoData.title));

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
    elem = e("div", {id: "app-body", class: ["collection-detail-body"]});
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
        db.getAllTodoCollections(),
    ));
}

function renderCollectionDetail() {
    const collectionData = db.getTodoCollection(state.openCollectionID);

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

function openCollection(collectionID) {
    state.view = "collection_detail";
    state.openCollectionID = collectionID;
}
function openOverview() {
    state.view = "collections_overview";
}

function newCollection() {
    db.newCollection();
}
function deleteCollection(collectionID) {
    db.deleteCollection(collectionID);
}
function editCollection(collectionID, newTitle) {
    db.editCollection(collectionID, newTitle);
}

function newTodo(collectionID) {
    db.newTodo(collectionID);
}
function deleteTodo(collectionID, todoID) {
    db.deleteTodo(collectionID, todoID);
}
function editTodo(collectionID, todoID, done, title) {
    db.updateTodo(collectionID, todoID, done, title);
}

/*** Globals ***/

const rootElement = document.querySelector("#app");

const db = new DummyDB();
const state = {
    view: "collections_overview", // "collections_overview" | "collection_detail"
    openCollectionID: null,
};

render();

