import { SafeAreaView, TouchableOpacity, View, Animated, Text, Image } from "react-native";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useAppState } from "@react-native-community/hooks";
import { Item2 } from "../lib/types";
import { createTodo } from "../lib/local";
import { Toast } from "toastify-react-native";
import { icons } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { cameraStyles } from "../lib/styles";
import changeNavigationBarColor from "react-native-navigation-bar-color";
const FLASH_MODE_KEY = "FLASH_MODE";
const CameraScreen = () => {
  const device = useCameraDevice("back");
  const { hasPermission } = useCameraPermission();
  if (!hasPermission) return null;
  if (device == null) return null;
  const camera = useRef<Camera>(null);
  const appState = useAppState();
  const isActive = appState === "active";
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const [flashAnim] = useState(new Animated.Value(0));
  const [flashMode, setFlashMode] = useState<"auto" | "on" | "off">("auto");
  const [zoom, setZoom] = useState(device.neutralZoom);

  let parsedItem: Item2 | undefined;
  if (typeof item === "string") parsedItem = JSON.parse(item) as Item2;

  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleFlashToggle = () => {
    if (flashMode === "auto") setFlashMode("on");
    else if (flashMode === "on") setFlashMode("off");
    else setFlashMode("auto");
  };

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  useEffect(() => {
    const loadFlashMode = async () => {
      try {
        const savedFlashMode = await AsyncStorage.getItem(FLASH_MODE_KEY);
        if (savedFlashMode) {
          setFlashMode(savedFlashMode as "auto" | "on" | "off");
        }
      } catch (error) {
        console.error("Failed to load flash mode", error);
      }
    };

    loadFlashMode();
  }, []);

  useEffect(() => {
    const saveFlashMode = async () => {
      try {
        await AsyncStorage.setItem(FLASH_MODE_KEY, flashMode);
      } catch (error) {
        console.error("Failed to save flash mode", error);
      }
    };

    saveFlashMode();
  }, [flashMode]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <Camera
        photo={true}
        ref={camera}
        device={device}
        isActive={isActive}
        enableZoomGesture={true}
        zoom={zoom}
        onShutter={() => {
          triggerFlash();
        }}
        className="w-full h-full"
      />
      <TouchableOpacity
        className="absolute bottom-32 w-24 h-24 bg-white/70 rounded-full items-center self-center z-50"
        onPress={async () => {
          const file = await camera.current?.takePhoto({
            enableShutterSound: false,
            flash: flashMode,
          });
          const result = await CameraRoll.saveAsset(`file://${file?.path}`, { type: "photo" });
          if (parsedItem) {
            try {
              await createTodo(parsedItem, result["node"].image.uri);
              router.back();
              Toast.success(
                `${
                  parsedItem.item.length > 18
                    ? parsedItem.item.substring(0, 15) + "..."
                    : parsedItem.item
                } added to todo list`,
                "bottom"
              );
            } catch (error) {
              Toast.error("Something went wrong", "bottom");
            }
          } else {
            Toast.error("Item data not found", "bottom");
          }
        }}
      />
      <TouchableOpacity
        className="absolute top-6 right-6 w-6 h-6 rounded-full items-center justify-center z-50 p-4"
        onPress={handleFlashToggle}>
        {flashMode === "auto" ? (
          <Image source={icons.flashAuto} className="w-6 h-6 z-50" tintColor={"#FF9C01"} />
        ) : flashMode === "on" ? (
          <Image source={icons.flashOn} className="w-6 h-6 z-50" tintColor={"#FF9C01"} />
        ) : (
          <Image source={icons.flashOff} className="w-6 h-6 z-50" tintColor={"#FF9C01"} />
        )}
      </TouchableOpacity>
      <View className="absolute bottom-20 left-0 right-0 flex-row justify-center">
        <View className="bg-black/50 rounded-full w-12 items-center z-50">
          <Text className="text-secondary text-base">{zoom.toFixed(1)}</Text>
        </View>
      </View>
      <View className="absolute bottom-12 w-full items-center z-50">
        <Slider
          style={cameraStyles.slider}
          minimumValue={device.minZoom}
          maximumValue={device.maxZoom}
          value={zoom}
          onValueChange={setZoom}
          minimumTrackTintColor="#FF9C01"
          maximumTrackTintColor="white"
          thumbTintColor="#FF9C01"
          step={0.1}
        />
      </View>
      <Animated.View style={[cameraStyles.flash, { opacity: flashAnim }]} />
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default CameraScreen;
