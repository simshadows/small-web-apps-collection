/*
 * Filename: data.js
 * Author:   simshadows <contact@simshadows.com>
 * License:  GNU Affero General Public License v3 (AGPL-3.0)
 */

import {
    millisecondsInADay,
    deepcopy,
    decomposeNumericTimeDelta,
    storageAvailable,
} from "./utils.js";

const sampleData = {
    collections: (()=>{
        const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        const loremIpsumShorter = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        const now = Date.now();

        return new Map([
            [0, {
                name: "My awesome list!",
                todos: new Map([
                    [0, {
                        done: false,
                        title: "Foo",
                        timeDue: now + millisecondsInADay,
                        notes: loremIpsum,
                    }],
                    [1, {
                        done: true,
                        title: loremIpsumShorter,
                        timeDue: now + (42 * millisecondsInADay),
                        notes: "", // Intentionally empty
                    }],
                    [2, {
                        done: true,
                        title: "<b>testing for xss</b>",
                        timeDue: null,
                        notes: "<b>The quick brown fox jumped over the lazy dog.</b>",
                    }],
                    [3, {
                        done: false,
                        title: "<script>alert(1)</script>",
                        timeDue: now - (2 * millisecondsInADay),
                        notes: "<script>alert(1)</script>",
                    }],
                ]),
                lastUnusedTodoID: 4,
            }],
            [1, {
                name: "Empty List",
                todos: new Map(), // Empty
                lastUnusedTodoID: 0,
            }],
        ]);
    })(),
    nextUnusedID: 2,
};


class DummyPersistentStore {
    constructor() {
        this._data = deepcopy(sampleData);
    }
    
    read() {
        console.log("dummy store read");
        return deepcopy(this._data);
    }
    write(obj) {
        console.log("dummy store write");
        this._data = deepcopy(obj);
    }
}

class LocalStoragePersistentStore {
    _serialize(obj) {
        return JSON.stringify(obj, (k, v) => {
            if (typeof v === "object" && v !== null && v.constructor === Map) return Object.fromEntries(v);
            return v;
        });
    }
    _deserialize(s) {
        const obj = JSON.parse(s);
        const collectionsMap = new Map(Object.entries(obj.collections));
        for (const [k, v] of collectionsMap.entries()) {
            v.todos = new Map(Object.entries(v.todos));
        }
        obj.collections = collectionsMap;
        return obj;
    }

    read() {
        console.log("localStorage store read");
        let dat = localStorage["todo-app"];
        if (!dat) dat = this._serialize(sampleData);
        return this._deserialize(dat);
    }

    write(obj) {
        console.log("localStorage store write");
        localStorage["todo-app"] = this._serialize(obj);
    }
}

/*** Data Mutators ***/

export function resetAppData() {
    persistentStore.write(sampleData);
    data = persistentStore.read();
}

export function newCollection() {
    data.collections.set(data.nextUnusedID, {
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
        timeDue: Date.now() + millisecondsInADay, // Set it so it's due on midnight local time?
        notes: "",
    });
    ++collectionData.lastUnusedTodoID;
    persistentStore.write(data);
    return todoID;
}
export function deleteTodo(collectionID, todoID) {
    data.collections.get(collectionID).todos.delete(todoID);
    persistentStore.write(data);
}
export function editTodo(collectionID, todoID, done, title, numericalDueDate, notes) {
    const todoData = data.collections.get(collectionID).todos.get(todoID);
    if (done !== undefined) todoData.done = done;
    if (title !== undefined) todoData.title = title;
    if (numericalDueDate !== undefined) {
        console.assert(numericalDueDate === null || typeof numericalDueDate === "number");
        //const delta = decomposeNumericTimeDelta(numericalDueDate - Date.now());
        //if (delta.days > 999999999) throw "???"; // TODO: Handle unexpectedly huge deltas?
        todoData.timeDue = numericalDueDate;
    }
    if (notes !== undefined) todoData.notes = notes;
    persistentStore.write(data);
}

/*** Data Read ***/

export function getAllTodoCollections() {
    const ret = [];
    for (const [id, collectionData] of data.collections.entries()) {
        let notYetDone = 0;
        let soonestDueDate = undefined;
        for (const [id, todoData] of collectionData.todos.entries()) {
            if (!todoData.done) ++notYetDone;
            const updateDueDate = (todoData.timeDue !== null)
                                  && (!todoData.done)
                                  && ((soonestDueDate === undefined) || (soonestDueDate > todoData.timeDue))
            if (updateDueDate) soonestDueDate = todoData.timeDue;
        }

        ret.push({
            id: id,
            name: collectionData.name,

            totalTodos: collectionData.todos.size,
            totalNotYetDone: notYetDone,
            soonestDueDate: soonestDueDate,
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

let persistentStore = (storageAvailable("localStorage"))
                      ? new LocalStoragePersistentStore()
                      : new DummyPersistentStore();
let data = persistentStore.read(); // {collections, nextUnusedID}
                                   // SEE persistentStore.js for an example of this data structure.

