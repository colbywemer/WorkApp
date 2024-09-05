import SQLite, { SQLError, SQLiteDatabase } from "react-native-sqlite-storage";
import {  Item2, savedItem, Todo2 } from "./types";
import RNFS from "react-native-fs";
import { Platform } from "react-native";

const database_name = "workapp.db";

let db: SQLiteDatabase;

const databaseLocation = Platform.select({
  ios: `${RNFS.DocumentDirectoryPath}/${database_name}`,
  android: `${RNFS.ExternalDirectoryPath}/${database_name}`,
}) || database_name;


const openDatabase = () => {
  db = SQLite.openDatabase(
    {
      name: databaseLocation,
      location: "default"
    },
    () => {},
    (error: SQLError) => console.log("ERROR: " + error)
  );
};

openDatabase();


export const initDatabase = () => {
  db.transaction((tx) => {

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,
        item TEXT,
        aisle INTEGER,
        side TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS watchlistItems (
        id TEXT PRIMARY KEY NOT NULL,
        item TEXT,
        bays TEXT,
        aisle INTEGER,
        side TEXT,
        onTodoList INTEGER,
        itemOrder INTEGER
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY NOT NULL,
        item_id TEXT,
        photo TEXT,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`
    );
  });
};

export const insertItem = (item: savedItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO items (id, item, aisle, side) VALUES (?, ?, ?, ?)",
        [item.upc, item.item, item.aisle, item.side],
        () => resolve(),
        (tx, error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  });
};
export const updateItem = (item: savedItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE items SET item = ?, aisle = ?, side = ? WHERE id = ?",
        [item.item, item.aisle, item.side, item.upc],
        () => resolve(),
        (tx, error) => {
          reject(error)}
      );
    });
  });
};

export const deleteItem = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM items WHERE id = ?",
        [id],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};
export const getItem = (id: string): Promise<savedItem | null> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM items WHERE id = ?",
        [id],
        (tx, result) => {
          if (result.rows.length > 0) {
            const item: savedItem = {
              upc: result.rows.item(0).id,
              item: result.rows.item(0).item,
              aisle: result.rows.item(0).aisle,
              side: result.rows.item(0).side
            };
            resolve(item);
          } else {
            resolve(null); // No item found with the given id
          }
        },
        (tx, error) => {
          reject(new Error(error.message));
        }
      );
    });
  });
};


export const insertWatchlistItem = (item: Item2): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO watchlistItems (id, item, bays, aisle, side, onTodoList, itemOrder) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.item, item.bays.join(','), item.aisle, item.side, item.onTodoList ? 1 : 0, item.order || 0],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};

export const updateWatchlistItem = (item: Item2): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE watchlistItems SET item = ?, bays = ?, aisle = ?, side = ?, onTodoList = ?, itemOrder = ? WHERE id = ?",
        [item.item, item.bays.join(','), item.aisle, item.side, item.onTodoList ? 1 : 0, item.order || 0, item.id],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};

export const deleteWatchlistItem = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM watchlistItems WHERE id = ?",
        [id],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};

export const insertTodo = (todo: Todo2): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO todos (id, item_id, photo) VALUES (?, ?, ?)",
        [todo.id, todo.item.id, todo.photo],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};

export const deleteTodo = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM todos WHERE id = ?",
        [id],
        () => resolve(),
        (tx, error) => reject(error)
      );
    });
  });
};

export const getAllWatchlistItems = (): Promise<Item2[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM watchlistItems ORDER BY itemOrder ASC",
        [],
        (tx, results) => {
          const items: Item2[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            items.push({
              id: row.id,
              item: row.item,
              bays: row.bays ? row.bays.split(',') : [],
              aisle: row.aisle,
              side: row.side,
              onTodoList: row.onTodoList === 1,
              order: row.itemOrder
            });
          }
          resolve(items);
        },
        (tx, error) => reject(error)
      );
    });
  });
};


export const getAllItems = (): Promise<savedItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM items",
        [],
        (tx, results) => {
          const items: savedItem[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            items.push({
              upc: row.id,
              item: row.item,
              aisle: row.aisle,
              side: row.side,
            });
          }
          resolve(items);
        },
        (tx, error) => reject(error)
      );
    });
  });
};

export const getAllTodos = (): Promise<Todo2[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT todos.id as todo_id, todos.photo, watchlistItems.id as item_id, watchlistItems.item, watchlistItems.bays, watchlistItems.aisle, watchlistItems.side, watchlistItems.onTodoList, watchlistItems.itemOrder
         FROM todos
         JOIN watchlistItems ON todos.item_id = watchlistItems.id`,
        [],
        (tx, results) => {
          const todos: Todo2[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            todos.push({
              id: row.todo_id,
              photo: row.photo,
              item: {
                id: row.item_id,
                item: row.item,
                bays: row.bays ? row.bays.split(',') : [],
                aisle: row.aisle,
                side: row.side,
                onTodoList: row.onTodoList === 1,
                order: row.itemOrder
              }
            });
          }
          resolve(todos);
        },
        (tx, error) => reject(error)
      );
    });
  });
};


export const getWatchlistItemCount = (aisle: number, side: string): Promise<number> => {

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT COUNT(*) as count FROM watchlistItems WHERE aisle = ? AND side = ?",
        [ aisle, side ],
        (tx, results) => {
          resolve(results.rows.item(0).count);
        },
        (tx, error) => reject(error)
      );
    });
  });
}