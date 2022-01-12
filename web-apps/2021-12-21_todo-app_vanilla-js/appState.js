function deepcopy(obj) {
    if (obj === null) return null;
    switch (typeof obj) {
        case "undefined":
        case "boolean":
        case "number":
        case "bigint":
        case "string":
            return obj;
        case "object":
            // Hyperspecific type checking to avoid unintended behaviour.
            // This function should not support user-defined classes.
            if (obj.constructor === Map) {
                const newMap = new Map();
                for (const [k, v] of obj.entries()) {
                    newMap.set(deepcopy(k), deepcopy(v));
                }
                return newMap;
            } else if (obj.constructor === Array) {
                return obj.map(deepcopy);
            } else if (obj.constructor === Object) {
                const newObj = {};
                // Only copies enumerable own properties.
                for (const [k, v] of Object.entries(obj)) {
                    newObj[deepcopy(k)] = deepcopy(v); // Doesn't handle symbol keys yet
                }
                return newObj;
            }
            throw "Unsupported prototype.";
        default:
            throw "Unsupported typeof value.";
    }
}

class DummyPersistentStore {
    constructor() {
        this._collections = new Map([
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
    
    read() {
        console.log("dummy store read");
        return {
            collections: deepcopy(this._collections),
            nextUnusedID: this._nextUnusedID,
        };
    }
    write(obj) {
        console.log("dummy store write");
        this._collections = deepcopy(obj.collections);
        this._nextUnusedID = obj.nextUnusedID;
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

export function newCollection() {
    data.collections.set(this._nextUnusedID, {
        name: "New List",
        todos: new Map(),
        lastUnusedTodoID: 0,
    });
    ++data.nextUnusedID;
    persistentStore.write(data);
}
export function deleteCollection(collectionID) {
    data.collections.delete(collectionID);
    persistentStore.write(data);
}
export function editCollection(collectionID, newTitle) {
    const collectionData = data.collections.get(collectionID);
    collectionData.name = newTitle;
    persistentStore.write(data);
}

export function newTodo(collectionID) {
    const collectionData = data.collections.get(collectionID)
    collectionData.todos.set(collectionData.lastUnusedTodoID, {
        done: false,
        title: "New Item",
    });
    ++collectionData.lastUnusedTodoID;
    persistentStore.write(data);
}
export function deleteTodo(collectionID, todoID) {
    data.collections.get(collectionID).todos.delete(todoID);
    persistentStore.write(data);
}
export function editTodo(collectionID, todoID, done, title) {
    const todoData = data.collections.get(collectionID).todos.get(todoID);
    if (done !== null) todoData.done = done;
    if (title !== null) todoData.title = title;
    persistentStore.write(data);
}

/*** State Read ***/

export function getView() {
    return state.view;
}

export function getOpenCollectionID() {
    return state.openCollectionID;
}

export function getAllTodoCollections() {
    const ret = [];
    for (const [id, collectionData] of data.collections.entries()) {
        ret.push({
            id: id,
            name: collectionData.name,
        });
    }
    return ret;
}

export function getTodoCollection(collectionID) {
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

const persistentStore = new DummyPersistentStore();
const state = {
    view: "collections_overview", // "collections_overview" | "collection_detail"
    openCollectionID: null,
};

let data = persistentStore.read(); // {collections, nextUnusedID}
                                   // SEE persistentStore.js for an example of this data structure.

