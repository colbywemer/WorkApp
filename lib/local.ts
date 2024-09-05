import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import {
  initDatabase,
  insertWatchlistItem as dbInsertWatchlistItem,
  updateWatchlistItem as dbUpdateWatchlistItem,
  deleteWatchlistItem as dbDeleteWatchlistItem,
  insertTodo as dbInsertTodo,
  deleteTodo as dbDeleteTodo,
  getAllWatchlistItems as dbGetAllWatchlistItems,
  getAllTodos as dbGetAllTodos,
  getItem as dbGetItem,
  getAllItems as dbGetAllItems,
  insertItem as dbInsertItem,
  deleteItem as dbDeleteItem,
  updateItem as dbUpdateItem,
  getWatchlistItemCount
} from "./database";
import { Form, Item2, savedItem, Todo2 } from "./types";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { stat } from "react-native-fs";

initDatabase();

export const createItem = async (item: savedItem): Promise<savedItem> => {
  const newItem: savedItem = {
    upc: item.upc,
    item: item.item!.trim(),
    aisle: item.aisle!,
    side: item.side
  };
  try{
    await dbInsertItem(newItem);
  }catch(error: any){console.log(error);}
  return newItem;
};
export const updateItem = async (item: savedItem): Promise<savedItem> => {
  const newItem: savedItem = {
    upc: item.upc,
    item: item.item!.trim(),
    aisle: item.aisle!,
    side: item.side
  };
  try{
    await dbUpdateItem(newItem);
  }catch(error: any){console.log("Error: " + error);}
  return newItem;
};
export const getItem = async (upc: string): Promise<savedItem | null> => {
  try{
    const newItem = await dbGetItem(upc);
    return newItem;
  }
  catch(error: any){
    console.log(error);
    throw new Error(error);
  }
};

export const createWatchlistItem = async (form: Form): Promise<Item2> => {
  const newItem: Item2 = {
    id: uuidv4(),
    item: form.item!.trim(),
    bays: form.bays!,
    aisle: form.aisle!,
    side: form.side as "Front" || "Back" || "Endcap",
    onTodoList: false,
    order: form.order || await getWatchlistItemCount(form.aisle!, form.side!)
  };
  await dbInsertWatchlistItem(newItem);
  return newItem;
};

export const updateWatchlistItem = async (form: Form, id: string): Promise<Item2> => {
  const updatedItem: Item2 = {
    id,
      item: form.item!.trim(),
    bays: form.bays!,
    aisle: form.aisle!,
    side: form.side as "Front" || "Back" || "Endcap",
    onTodoList: false,
    order: form.order!
  };
  await dbUpdateWatchlistItem(updatedItem);
  return updatedItem;
};
export const updateWatchlistItems = async (items: Item2[]): Promise<void> => {
  const updateItemPromises = items.map(async (item) => dbUpdateWatchlistItem(item));
  await Promise.all(updateItemPromises);
};

export const createTodo = async (item: Item2, photo?: string): Promise<Todo2> => {
  const newTodo: Todo2 = {
    id: uuidv4(),
    item: item,
    photo: photo || ''
  };
  await dbInsertTodo(newTodo);
  item.onTodoList = true;
  await dbUpdateWatchlistItem(item);
  return newTodo;
};

export const deleteWatchlistItem = async (item: Item2): Promise<void> => {
  const todos = await dbGetAllTodos();
  const todoToDelete = todos.find(todo => todo.item.id === item.id);
  if (todoToDelete) {
    await CameraRoll.deletePhotos([`file://${(await stat(todoToDelete.photo!)).originalFilepath}`]);
    await dbDeleteTodo(todoToDelete.id);
  }
  await dbDeleteWatchlistItem(item.id);
};
export const deleteItem = async (item: savedItem): Promise<void> => {
  await dbDeleteItem(item.upc!);
};

export const getAllPosts = async (): Promise<Item2[]> => {
  return await dbGetAllWatchlistItems();
};
export const getAllItems = async (): Promise<savedItem[]> => {
  return await dbGetAllItems();
};

export const getAllTodos = async (): Promise<Todo2[]> => {
  return await dbGetAllTodos();
};

export const deleteTodo = async (todo: Todo2): Promise<void> => {
  await dbDeleteTodo(todo.id);
  todo.item.onTodoList = false;
  try {
    await CameraRoll.deletePhotos([`file://${(await stat(todo.photo!)).originalFilepath}`]);
  } catch (error) {
    console.log(error);
  }
  console.log(todo.item);
  await dbUpdateWatchlistItem(todo.item);
};
