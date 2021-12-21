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
    updateTodo(collectionID, todoID, done) {
        const todoData = this._data.get(collectionID).todos.get(todoID);
        todoData.done = done;
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

class TodoBoxComponent {
    constructor(todoID, todoData, onTodoChange) {
        this._root = e("div", {class: ["todo-box"]});

        this._checkbox = this._root.appendChild(e("input", {}));
        this._checkbox.setAttribute("type", "checkbox");
        this._checkbox.checked = todoData.done;
        this._checkbox.addEventListener("change", (event) => {
            onTodoChange(todoID, event.target.checked);
        });

        this._title = this._root.appendChild(txt(todoData.title));
    }
    get root() {
        return this._root;
    }
}

class CollectionDetailBodyComponent {
    constructor(
        collectionData,
        onTodoChange,
        onNewTodoHandler,
    ) {
        this._root = e("div", {id: "app-body", class: ["collection-detail-body"]});
        this._todoBoxes = [];
        this._onTodoChangeHandler = (...x) => onTodoChange(collectionData.id, ...x);

        for (const [todoID, todoData] of collectionData.todos.entries()) {
            const component = new TodoBoxComponent(todoID, todoData, this._onTodoChangeHandler);
            this._todoBoxes.push(component);
            this._root.appendChild(component.root);
        }

        this._root.appendChild(addButtonElement(() => onNewTodoHandler(collectionData.id)));
    }
    get root() {
        return this._root;
    }
}

//
// Collections Overview
//

class CollectionSummaryComponent {
    constructor(
        collectionSummaryData,
        onOpenCollectionHandler,
        onDeleteCollectionHandler,
        onEditCollectionHandler,
    ) {
        this._root = e("div", {class: ["collection-summary-box"]})
        this._root.addEventListener("click", (ev) => onOpenCollectionHandler(collectionSummaryData.id));

        const nameElem = this._root.appendChild(e("span", {class: ["collection-summary-name"]}));
        nameElem.appendChild(txt(collectionSummaryData.name));

        this._root.appendChild(deleteButtonElement(() => onDeleteCollectionHandler(collectionSummaryData.id)));
        this._root.appendChild(editButtonElement(() => {
            const result = window.prompt("Please enter a new title.", collectionSummaryData.name);
            if (result !== null && result != "") {
                onEditCollectionHandler(collectionSummaryData.id, result);
            }
        }));
    }
    get root() {
        return this._root;
    }
}

class CollectionsOverviewComponent {
    constructor(
        collectionsData,
        onOpenCollectionHandler,
        onNewCollectionHandler,
        onDeleteCollectionHandler,
        onEditCollectionHandler,
    ) {
        this._root = e("div", {id: "app-body", class: ["collections-overview-body"]});
        this._onOpenCollection = onOpenCollectionHandler;
        this._onNewCollection = onNewCollectionHandler;
        this._summaries = [];

        for (const data of collectionsData) {
            const summaryComponent = new CollectionSummaryComponent(
                data,
                onOpenCollectionHandler,
                onDeleteCollectionHandler,
                onEditCollectionHandler,
            );
            this._summaries.push(summaryComponent);
            this._root.appendChild(summaryComponent.root);
        }

        this._root.appendChild(addButtonElement(onNewCollectionHandler));
    }
    get root() {
        return this._root;
    }
}

//
// Root
//

class RootComponent {
    constructor(rootSelector) {
        this._db = new DummyDB();
        this._view = "collections_overview"; // "collections_overview" | "collection_detail"
        this._root = document.querySelector(rootSelector);
        this._children = {};

        this.renderCollectionsOverview();
    }

    // TODO: A lot of these methods inefficiently redraws the entire collection detail UI.

    onNewTodo(collectionID) {
        this._db.newTodo(collectionID);
        this.collectionDetailView(collectionID);
    }
    onTodoChange(collectionID, todoID, done) {
        this._db.updateTodo(collectionID, todoID, done);
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
        this._children = {};
    }
    renderCollectionsOverview() {
        this._children.body = new CollectionsOverviewComponent(
            this._db.getAllTodoCollections(),
            (...x) => this.onOpenCollection(...x),
            () => this.onNewCollection(),
            (...x) => this.onDeleteCollection(...x),
            (...x) => this.onEditCollection(...x),
        );
        this._root.appendChild(this._children.body.root);
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

        this._children.body = new CollectionDetailBodyComponent(
            collectionData,
            (...x) => this.onTodoChange(...x),
            (...x) => this.onNewTodo(...x),
        );
        this._root.appendChild(this._children.body.root);
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

