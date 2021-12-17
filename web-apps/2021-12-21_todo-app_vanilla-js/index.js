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

    updateTodo(collectionID, todoID, done) {
        const todoData = this._data.get(collectionID).todos.get(todoID);
        todoData.done = done;
    }
}

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

    // "collections_overview"
    renderCollectionsOverview() {
        this._children.body = this._root.appendChild(e("div", {id: "app-body", class: ["collections-overview-body"]}));
        for (const data of this._db.getAllTodoCollections()) {
            this.newCollectionSummaryElement(data.id, data.name);
        }
    }
    newCollectionSummaryElement(collectionID, collectionName) {
        const elem = this._children.body.appendChild(e("div", {class: ["collection-summary-box"]}));
        elem.addEventListener("click", (ev) => this.collectionDetailView(collectionID));

        const nameElem = elem.appendChild(e("span", {class: ["collection-summary-name"]}));
        nameElem.appendChild(txt(collectionName));
    }

    // "collection_detail"
    renderCollectionDetail(collectionID) {
        const collectionData = this._db.getTodoCollection(collectionID);

        const head = this._root.appendChild(e("div", {id: "app-head"}));
        const backButton = head.appendChild(e("div", {id: "head-button-left", class: ["head-button"]}));
        const title = head.appendChild(e("span", {id: "head-title"}));

        backButton.appendChild(txt("Back"));
        backButton.addEventListener("click", (ev) => this.collectionsOverviewView());

        title.appendChild(txt(collectionData.name));

        this._children.body = new CollectionDetailBodyComponent(
            collectionData,
            (...x) => this.onTodoChange(...x),
        );
        this._root.appendChild(this._children.body.root);
    }

    resetUI() {
        this._root.innerHTML = ""; // TODO: Better way to clear this?
        this._children = {};
    }

    // State Transitions
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

