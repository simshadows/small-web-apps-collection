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
                lastUnusedTodoID: 2,
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

    newCollection() {
        this._data.set(this._nextUnusedID, {
            name: "New List",
            todos: new Map(),
            lastUnusedTodoID: 0,
        });
        ++this._nextUnusedID;
    }

    updateTodo(collectionID, todoID, done) {
        const todoData = this._data.get(collectionID).todos.get(todoID);
        todoData.done = done;
    }
}

class AddButtonComponent {
    constructor(onClickHandler) {
        this._root = e("div", {class: ["add-button"]});
        this._root.addEventListener("click", (ev) => onClickHandler());

        this._root.appendChild(txt("+"));
    }
    get root() {
        return this._root;
    }
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
    constructor(collectionData, onTodoChange) {
        this._root = e("div", {id: "app-body", class: ["collection-detail-body"]});
        this._todoBoxes = [];
        this._onTodoChangeHandler = (...x) => onTodoChange(collectionData.id, ...x);

        for (const [todoID, todoData] of collectionData.todos.entries()) {
            const component = new TodoBoxComponent(todoID, todoData, this._onTodoChangeHandler);
            this._todoBoxes.push(component);
            this._root.appendChild(component.root);
        }
    }
    get root() {
        return this._root;
    }
}

//
// Collections Overview
//

class CollectionSummaryComponent {
    constructor(collectionSummaryData, onOpenCollectionHandler) {
        this._root = e("div", {class: ["collection-summary-box"]})
        this._root.addEventListener("click", (ev) => onOpenCollectionHandler(collectionSummaryData.id));

        const nameElem = this._root.appendChild(e("span", {class: ["collection-summary-name"]}));
        nameElem.appendChild(txt(collectionSummaryData.name));
    }
    get root() {
        return this._root;
    }
}

class CollectionsOverviewComponent {
    constructor(collectionsData, onOpenCollectionHandler, onNewCollectionHandler) {
        this._root = e("div", {id: "app-body", class: ["collections-overview-body"]});
        this._onOpenCollection = onOpenCollectionHandler;
        this._onNewCollection = onNewCollectionHandler;
        this._summaries = [];

        for (const data of collectionsData) {
            const summaryComponent = new CollectionSummaryComponent(data, onOpenCollectionHandler);
            this._summaries.push(summaryComponent);
            this._root.appendChild(summaryComponent.root);
        }

        this._addButton = new AddButtonComponent(onNewCollectionHandler);
        this._root.appendChild(this._addButton.root);
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

    onTodoChange(collectionID, todoID, done) {
        // TODO: This inefficiently redraws the entire collection detail UI.
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

    resetUI() {
        this._root.innerHTML = ""; // TODO: Better way to clear this?
        this._children = {};
    }
    renderCollectionsOverview() {
        this._children.body = new CollectionsOverviewComponent(
            this._db.getAllTodoCollections(),
            (...x) => this.onOpenCollection(...x),
            () => this.onNewCollection(),
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

