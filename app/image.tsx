import { SafeAreaView } from "react-native";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { useEffect } from "react";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import FastImage from "react-native-fast-image";

const image = () => {
  const { item } = useLocalSearchParams();
  let parsedItem: string;
  if (typeof item === "string") parsedItem = JSON.parse(item);
  else parsedItem = "";

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ReactNativeZoomableView maxZoom={30} contentWidth={400} contentHeight={525}>
        <FastImage
          style={{ width: "100%", height: "100%" }}
          source={{ uri: parsedItem, priority: FastImage.priority.high }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </ReactNativeZoomableView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default image;
