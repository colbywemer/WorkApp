import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAppState } from "@react-native-community/hooks";
import { useFocusEffect, useRouter } from "expo-router";
import { getItem } from "../../lib/local";
import { savedItem } from "../../lib/types";
import { Toast } from "toastify-react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default function Scanner() {
  const router = useRouter();
  const device = useCameraDevice("back");
  const { hasPermission } = useCameraPermission();
  if (!hasPermission) return null;
  if (device == null) return null;
  const [focused, setFocused] = useState(false);

  const camera = useRef<Camera>(null);
  const appState = useAppState();
  let isActive = appState === "active" && focused;

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  const [scans, setScans] = useState<string[]>([]);

  const scanAmount = 10;

  const codeScanner = useCodeScanner({
    codeTypes: ["upc-a", "upc-e"],
    onCodeScanned: (codes: Code[]) => {
      if (scans.length < scanAmount) {
        setScans((prevScans) => [...prevScans, codes[0].value || ""]);
      }
    },
  });

  useEffect(() => {
    if (scans.length === scanAmount) {
      const countOccurrences = (arr: string[]) =>
        arr.reduce((acc: Record<string, number>, code: string) => {
          acc[code] = (acc[code] || 0) + 1;
          return acc;
        }, {});

      const occurrences = countOccurrences(scans);
      const mostCommon = Object.keys(occurrences).reduce((a, b) =>
        occurrences[a] > occurrences[b] ? a : b
      );

      async function searchUPC(upc: string) {
        try {
          const item: savedItem | null = await getItem(upc);
          if (item === null) {
            let productInfo = null;
            Toast.warn("Fetching product info...", "bottom");
            try {
              productInfo = await fetchProductInfo(mostCommon);
            } catch (error) {}
            router.push({
              pathname: "createItem",
              params: { upc: upc, itemName: productInfo },
            });
          } else {
            console.log("-----------");
            console.log(item);
            router.push({ pathname: "create", params: { item: JSON.stringify(item) } });
          }
        } catch (error) {}
        setFocused(false);
        setScans([]);
      }
      searchUPC(mostCommon);
    }
  }, [scans]);

  function capitalizeTitle(title: string) {
    return title
      .toLowerCase() // Convert the entire string to lowercase
      .split(" ") // Split the string into an array of words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back into a single string
  }

  const fetchProductInfo = async (upc: string) => {
    try {
      // Making parallel requests using Promise.all()
      const [brandResponse, upcResponse] = await Promise.all([
        fetch(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`),
        fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`),
      ]);

      // Parsing responses
      const brandData = await brandResponse.json();
      const data = await upcResponse.json();
      console.log("-----------------");
      console.log(JSON.stringify(brandData.product, null, 2));

      // Extracting relevant information
      const brand = brandData.status === 1 ? brandData.product.brands : "";
      const brand2 = brandData.status === 1 ? brandData.product.brand_owner : "";
      const title =
        data.code === "OK"
          ? data.items[0]?.title
          : brandData.status === 1
          ? brandData.product.product_name
          : "";
      // Combining brand and title
      return (
        (brand !== "" && brand !== undefined && !title.toLowerCase().includes(brand.toLowerCase())
          ? brand + " "
          : brand2 === "Hy-Vee, Inc."
          ? "Hy-Vee "
          : "") + capitalizeTitle(title)
      );
    } catch (error) {
      // Handle errors appropriately
      return ""; // or handle specific error cases
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View>
        <Camera
          ref={camera}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
          className="w-full h-full mt-8"
        />
      </View>
      <View className="flex items-center justify-center absolute bottom-10 w-full">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "createItem",
            });
          }}
          className="bg-primary/80 p-3 rounded-2xl">
          <Text className="text-white text-center">Enter Manually</Text>
        </TouchableOpacity>
      </View>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
