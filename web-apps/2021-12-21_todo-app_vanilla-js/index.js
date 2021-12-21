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

function todoBoxElement(todoID, todoData, onDeleteTodoHandler, onEditTodoHandler) {
    const elem = e("div", {class: ["todo-box"]});

    const checkbox = elem.appendChild(e("input", {}));
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = todoData.done;
    checkbox.addEventListener("change", (event) => {
        onEditTodoHandler(todoID, event.target.checked, null);
    });

    const title = elem.appendChild(e("span", {class: ["todo-title"]}));
    title.appendChild(txt(todoData.title));

    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", todoData.title);
        if (result !== null && result != "") {
            onEditTodoHandler(todoID, null, result);
        }
    }));
    elem.appendChild(deleteButtonElement(() => onDeleteTodoHandler(todoID)));

    return elem;
}

function collectionDetailBodyElement(
    collectionData,
    onNewTodoHandler,
    onDeleteTodoHandler,
    onEditTodoHandler,
) {
    elem = e("div", {id: "app-body", class: ["collection-detail-body"]});
    for (const [todoID, todoData] of collectionData.todos.entries()) {
        elem.appendChild(todoBoxElement(
            todoID,
            todoData,
            (...x) => onDeleteTodoHandler(collectionData.id, ...x),
            (...x) => onEditTodoHandler(collectionData.id, ...x),
        ));
    }
    elem.appendChild(addButtonElement(() => onNewTodoHandler(collectionData.id)));
    return elem;
}

//
// Collections Overview
//

function collectionSummaryElement(
    collectionSummaryData,
    onOpenCollectionHandler,
    onDeleteCollectionHandler,
    onEditCollectionHandler,
) {
    const elem = e("div", {class: ["collection-summary-box"]})
    elem.addEventListener("click", (ev) => onOpenCollectionHandler(collectionSummaryData.id));

    const nameElem = elem.appendChild(e("span", {class: ["collection-summary-name"]}));
    nameElem.appendChild(txt(collectionSummaryData.name));

    elem.appendChild(deleteButtonElement(() => onDeleteCollectionHandler(collectionSummaryData.id)));
    elem.appendChild(editButtonElement(() => {
        const result = window.prompt("Please enter a new title.", collectionSummaryData.name);
        if (result !== null && result != "") {
            onEditCollectionHandler(collectionSummaryData.id, result);
        }
    }));

    return elem;
}

function collectionsOverviewElement(
    collectionsData,
    onOpenCollectionHandler,
    onNewCollectionHandler,
    onDeleteCollectionHandler,
    onEditCollectionHandler,
) {
    const elem = e("div", {id: "app-body", class: ["collections-overview-body"]});
    for (const data of collectionsData) {
        elem.appendChild(collectionSummaryElement(
            data,
            onOpenCollectionHandler,
            onDeleteCollectionHandler,
            onEditCollectionHandler,
        ));
    }
    elem.appendChild(addButtonElement(onNewCollectionHandler));
    return elem;
}

//
// Root
//

class RootComponent {
    constructor(rootSelector) {
        this._db = new DummyDB();
        this._view = "collections_overview"; // "collections_overview" | "collection_detail"
        this._root = document.querySelector(rootSelector);

        this.renderCollectionsOverview();
    }

    // TODO: A lot of these methods inefficiently redraws the entire collection detail UI.

    onNewTodo(collectionID) {
        this._db.newTodo(collectionID);
        this.collectionDetailView(collectionID);
    }
    onDeleteTodo(collectionID, todoID) {
        this._db.deleteTodo(collectionID, todoID);
        this.collectionDetailView(collectionID);
    }
    onEditTodo(collectionID, todoID, done, title) {
        this._db.updateTodo(collectionID, todoID, done, title);
        this.collectionDetailView(collectionID);
    }

    onOpenCollection(collectionID) {
        this.collectionDetailView(collectionID);
    }
    onNewCollection() {
        this._db.newCollection();
        this.collectionsOverviewView();
    }
    onDeleteCollection(collectionID) {
        this._db.deleteCollection(collectionID);
        this.collectionsOverviewView();
    }
    onEditCollection(collectionID, newTitle) {
        this._db.editCollection(collectionID, newTitle);
        this.collectionsOverviewView();
    }

    resetUI() {
        this._root.innerHTML = ""; // TODO: Better way to clear this?
    }
    renderCollectionsOverview() {
        this._root.appendChild(collectionsOverviewElement(
            this._db.getAllTodoCollections(),
            (...x) => this.onOpenCollection(...x),
            () => this.onNewCollection(),
            (...x) => this.onDeleteCollection(...x),
            (...x) => this.onEditCollection(...x),
        ));
    }
    renderCollectionDetail(collectionID) {
        const collectionData = this._db.getTodoCollection(collectionID);

        const head = this._root.appendChild(e("div", {id: "app-head"}));
        const backButton = head.appendChild(e("div", {id: "head-button-left", class: ["head-button"]}));
        const title = head.appendChild(e("span", {id: "head-title"}));

        backButton.appendChild(txt("Back"));
        backButton.addEventListener("click", (ev) => this.collectionsOverviewView());

        const titleText = title.appendChild(e("b", {}));
        titleText.appendChild(txt(collectionData.name));

        this._root.appendChild(collectionDetailBodyElement(
            collectionData,
            (...x) => this.onNewTodo(...x),
            (...x) => this.onDeleteTodo(...x),
            (...x) => this.onEditTodo(...x),
        ));
    }

    // Shortcuts to change view
    collectionsOverviewView() {
        this.resetUI();
        this.renderCollectionsOverview();
    }
    collectionDetailView(collectionID) {
        this.resetUI();
        this.renderCollectionDetail(collectionID);
    }
}

let root = new RootComponent("#app");

