import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import { savedItem } from "../lib/types";
import { createItem, createWatchlistItem, updateItem } from "../lib/local";

import { Dropdown, MultiSelect } from "react-native-searchable-dropdown-kj";

import { aisles, bays, sides } from "../lib/data";
import { styles } from "../lib/styles";
import ToastManager, { Toast } from "toastify-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CheckBox from "@react-native-community/checkbox";
import { icons } from "../constants";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default function App() {
  const router = useRouter();
  const { upc, item, itemName } = useLocalSearchParams();
  const parsedUPC = typeof upc === "string" ? upc : null;
  const parsedItemName = typeof itemName === "string" ? itemName : null;
  let parsedItem: savedItem | undefined;
  if (typeof item === "string") parsedItem = JSON.parse(item) as savedItem;

  const [form, setForm] = useState<savedItem>({
    upc: parsedItem?.upc || parsedUPC,
    item: parsedItem?.item || parsedItemName || null,
    aisle: parsedItem?.aisle || null,
    side: parsedItem?.side || null,
  });
  const [watchlistBays, setWatchlistBays] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [watchlist, setWatchlist] = useState(false);

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  const submit = async () => {
    if (!form.item || !form.aisle || !form.side) {
      return Toast.warn("Please fill in all the fields", "bottom");
    }
    setUploading(true);
    try {
      if (!parsedItem) {
        await createItem({ ...form });
        if (watchlist) {
          createWatchlistItem({ ...form, bays: watchlistBays });
          Toast.success(`${form.item} added to watchlist`, "bottom");
        } else {
          Toast.success(`${form.item} added`, "bottom");
        }
        router.back();
      } else {
        updateItem({ ...form });
        Toast.success(`${form.item} updated`, "bottom");
        router.back();
      }
    } catch (error: any) {
      Toast.error("Error", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary min-h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-3xl text-white font-bold text-center">{`${
          parsedItem ? "Edit" : "Create"
        } UPC Item`}</Text>

        <FormField
          title="UPC"
          value={form.upc!}
          handleChangeText={(u) => setForm({ ...form, upc: u })}
          otherStyles="mt-3"
          placeholder="UPC for the item"
          editable={parsedItem ? false : true}
        />
        <FormField
          title="Item"
          value={form.item!}
          handleChangeText={(i) => setForm({ ...form, item: i })}
          otherStyles="mt-3"
          placeholder="Item You Wish To Add To The List"
        />
        <View className=" mt-3 space-y-2">
          <View className="flex flex-row justify-between">
            <Text className="text-base text-gray-100 font-pmedium">Aisle</Text>
          </View>
          <Dropdown
            style={[styles.dropdown]}
            containerStyle={styles.containerStyles}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            activeColor="transparent"
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={aisles}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={"Select Aisle"}
            searchPlaceholder="Search..."
            value={form.aisle}
            renderItem={(item) => (
              <View style={styles.item}>
                <Text style={item.value === form.aisle ? styles.selectedItem : styles.textItem}>
                  {item.label}
                </Text>
              </View>
            )}
            onChange={(item) => {
              setForm({ ...form, aisle: item.value });
            }}
          />
        </View>
        <View className=" mt-3 space-y-2">
          <View className="flex flex-row justify-between">
            <Text className="text-base text-gray-100 font-pmedium">Side</Text>
          </View>
          <Dropdown
            style={[styles.dropdown]}
            containerStyle={styles.containerStyles}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            activeColor="transparent"
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={sides}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={"Select Side Of Aisle"}
            searchPlaceholder="Search..."
            value={form.side}
            renderItem={(item) => (
              <View style={styles.item}>
                <Text style={item.value === form.side ? styles.selectedItem : styles.textItem}>
                  {item.label}
                </Text>
              </View>
            )}
            onChange={(item) => {
              setForm({ ...form, side: item.value });
            }}
          />
        </View>
        {!parsedItem && (
          <TouchableOpacity
            className="flex flex-row items-center mt-3"
            onPress={() => setWatchlist(!watchlist)}
            activeOpacity={1}>
            <CheckBox
              value={watchlist}
              onValueChange={() => setWatchlist(!watchlist)}
              tintColors={{ true: "aqua", false: "white" }}
            />
            <Text className="text-white">Add To Watchlist?</Text>
          </TouchableOpacity>
        )}
        {watchlist && (
          <View className="mt-3 space-y-2">
            <View className="flex flex-row justify-between">
              <Text className="text-base text-gray-100 font-pmedium">Bay</Text>
            </View>
            <MultiSelect
              style={[styles.dropdown]}
              containerStyle={styles.containerStyles}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor="transparent"
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={bays}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Location Of Item In Backroom"}
              searchPlaceholder="Search..."
              value={watchlistBays}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                  <View style={styles.selectedStyle}>
                    <Text className="text-white text-base">{item.label} </Text>
                    <Image
                      source={icons.trash}
                      resizeMode="contain"
                      tintColor={"red"}
                      className="w-5 h-5"
                    />
                  </View>
                </TouchableOpacity>
              )}
              renderItem={(item) => (
                <View style={styles.item}>
                  <Text
                    style={
                      watchlistBays?.includes(item.value) ? styles.selectedItem : styles.textItem
                    }>
                    {item.label}
                  </Text>
                </View>
              )}
              onChange={(item) => {
                setWatchlistBays(item);
              }}
            />
          </View>
        )}
        <CustomButton
          title={`${parsedItem ? "Update" : "Add"} UPC Item`}
          isLoading={uploading}
          handlePress={submit}
          containerStyles="mt-3"
        />
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
