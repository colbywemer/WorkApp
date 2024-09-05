import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useGesture } from "../app/hooks/useGesture";
import { SharedValue } from "react-native-reanimated";

import { StyleSheet } from "react-native";
import { TListItem } from "../lib/types";
import FastImage from "react-native-fast-image";
import { icons } from "../constants";

const SONG_HEIGHT = 80;
const Color_Pallete = {
  metal_black: "#0E0C0A",
  night_shadow: "#1C1C1C",
  crystal_white: "#FFFFFF",
  silver_storm: "#808080",
};
const styles = StyleSheet.create({
  itemContainer: {
    height: SONG_HEIGHT,
    flexDirection: "row",
    position: "absolute",
  },
  imageContainer: {
    height: SONG_HEIGHT,
    width: "20%",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "3%",
  },
  descriptionContainer: {
    width: "60%",
    justifyContent: "space-evenly",
  },
  description1: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color_Pallete.crystal_white,
  },
  description2: { color: Color_Pallete.silver_storm },
  draggerContainer: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  marginBottom: {
    marginBottom: 5,
  },
  dragger: {
    width: "30%",
    height: 2,
    backgroundColor: Color_Pallete.crystal_white,
  },
  image: {
    height: SONG_HEIGHT - 20,
    width: "97%",
  },
});

export const ListItem = ({
  item,
  isDragging,
  draggedItemId,
  currentSongPositions,
  index,
}: TListItem) => {
  const { animatedStyles, gesture } = useGesture(
    isDragging,
    draggedItemId,
    currentSongPositions,
    index
  );

  return (
    <Animated.View key={item.id} style={[styles.itemContainer, animatedStyles]}>
      <View style={styles.imageContainer}>
        <FastImage source={icons.barcode} style={styles.image} />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description1}>{item.item}</Text>
        <Text style={styles.description2}>{item.side}</Text>
      </View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.draggerContainer}>
          {/* <View style={[styles.dragger, styles.marginBottom]} />
          <View style={[styles.dragger, styles.marginBottom]} />
          <View style={styles.dragger} /> */}
          <TouchableOpacity
            onPress={() => {
              console.log("Camera Pressed");
            }}>
            <FastImage source={icons.camera} className="w-6 h-6" tintColor={"#FF9C01"} />
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
