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
            // As such, this function should not support user-defined classes.
            if (obj.constructor === Map) {
                return new Map(obj);
            } else if (obj.constructor === Array) {
                return [...obj];
            } else if (obj.constructor === Object) {
                return Object.assign({}, obj); // Only copies enumerable own properties.
            }
            throw "Unsupported prototype.";
        default:
            throw "Unsupported typeof value.";
    }
}

export class DummyPersistentStore {
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

