import { Item2, savedItem } from "./types";
import firebase from "firebase/compat/app"
import "firebase/compat/firestore"
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5f_VBmAoMk1cmoQT9EIUY6WR03jzLpfU",
    authDomain: "stocker-677b0.firebaseapp.com",
    projectId: "stocker-677b0",
    storageBucket: "stocker-677b0.appspot.com",
    messagingSenderId: "197529871522",
    appId: "1:197529871522:web:a13d1928e3e04bee9863fb",
    measurementId: "G-GVDWD78R36"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export const backupItemsFirestore = async (items: savedItem[]) => {
    await deleteAllItemsFromFirestore();
    const batch = db.batch();
    items.forEach(item => {
      const itemRef = db.collection('items').doc(item.upc!);
      batch.set(itemRef, item);
    });
    await batch.commit();
    console.log('Items backed up successfully');
  };

  const deleteAllItemsFromFirestore = async () => {
    const itemsSnapshot = await db.collection('items').get();
    const batch = db.batch();
    itemsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('All items deleted from Firestore');
  };

  const deleteAllWatchlistItemsFromFirestore = async () => {
    const watchlistItemsSnapshot = await db.collection('watchlist').get();
    const batch = db.batch();
    watchlistItemsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('All watchlist items deleted from Firestore');
  };

  export const backupWatchlistItemsFirestore = async (watchlistItems: Item2[]) => {
    await deleteAllWatchlistItemsFromFirestore();
    const batch = db.batch();
    watchlistItems.forEach(item => {
      const itemRef = db.collection('watchlist').doc(item.id);
      batch.set(itemRef, item);
    });
    await batch.commit();
  };

  export const fetchItemsFromFirestore = async (): Promise<savedItem[]> => {
    const items: savedItem[] = [];
    const snapshot = await db.collection('items').get();
    snapshot.forEach((doc: firebase.firestore.DocumentSnapshot) => {
      items.push(doc.data() as savedItem);
    });
    return items;
  };

  export const fetchWatchlistItemsFromFirestore = async (): Promise<Item2[]> => {
    const watchlistItems: Item2[] = [];
    const snapshot = await db.collection('watchlist').get();
    snapshot.forEach((doc: firebase.firestore.DocumentSnapshot) => {
      watchlistItems.push(doc.data() as Item2);
    });
    return watchlistItems;
  };
