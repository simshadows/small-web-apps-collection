import {
    millisecondsInADay,
    deepcopy,
} from "./utils.js";

class DummyPersistentStore {
    constructor() {
        const now = Date.now();

        this._collections = new Map([
            [0, {
                name: "My awesome list!",
                todos: new Map([
                    [0, {
                        done: false,
                        title: "Foo",
                        timeDue: now + millisecondsInADay,
                    }],
                    [1, {
                        done: true,
                        title: "Bar",
                        timeDue: now + (2 * millisecondsInADay),
                    }],
                    [2, {
                        done: false,
                        title: "Baz",
                        timeDue: now - (2 * millisecondsInADay),
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

/*** Data Mutators ***/

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
    const todoID = collectionData.lastUnusedTodoID;
    collectionData.todos.set(todoID, {
        done: false,
        title: "New Item",
        timeDue: Date.now() + millisecondsInADay,
    });
    ++collectionData.lastUnusedTodoID;
    persistentStore.write(data);
    return todoID;
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

/*** Data Read ***/

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
    if (!result) return undefined;
    return {
        id: collectionID,
        name: result.name,
        todos: deepcopy(result.todos),
    };
}

/*** Globals ***/

const persistentStore = new DummyPersistentStore();
let data = persistentStore.read(); // {collections, nextUnusedID}
                                   // SEE persistentStore.js for an example of this data structure.
