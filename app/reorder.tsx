import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Item2 } from "../lib/types";
import { updateWatchlistItems } from "../lib/local";

export default function App() {
  const { items } = useLocalSearchParams();
  let parsedItems: Item2[] | [] = [];
  if (typeof items === "string") parsedItems = JSON.parse(items) as Item2[];
  const [itemData, setItemData] = useState(parsedItems);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Item2>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          className={`px-7 ${isActive ? "bg-red" : ""}`}>
          <Text
            className="text-white text-base py-2"
            style={{
              fontFamily: "monospace",
            }}>
            {item.item}
          </Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      data={itemData}
      onDragEnd={async ({ data }) => {
        // Create a deep copy of the data to avoid modifying objects directly
        let copy = data.map((item, index) => ({
          ...item,
          order: index, // Update the order
        }));

        // Update the state and the Firestore database
        setItemData(copy);
        await updateWatchlistItems(copy);
        console.log("Updated order");
      }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}
