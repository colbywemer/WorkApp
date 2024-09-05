import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { Alert, ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import { Form, Item2 } from "../lib/types";
import { updateWatchlistItem } from "../lib/local";
import { Toast } from "toastify-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dropdown } from "react-native-searchable-dropdown-kj";
import { MultiSelect } from "react-native-searchable-dropdown-kj";
import { icons } from "../constants";
import { aisles, bays, sides } from "../lib/data";
import { styles } from "../lib/styles";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default function App() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  let parsedItem: Item2 | undefined;
  if (typeof item === "string") parsedItem = JSON.parse(item) as Item2;

  const [form, setForm] = useState<Form>({
    item: parsedItem?.item || null,
    bays: parsedItem?.bays || [],
    aisle: parsedItem?.aisle || 2,
    side: parsedItem?.side || null,
    order: parsedItem?.order || null,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  const submit = async () => {
    if (!form.item) {
      return Toast.warn("Please fill in all the fields", "bottom");
    }
    setUploading(true);
    try {
      await updateWatchlistItem({ ...form }, parsedItem!.id);
      Toast.success(
        `${form.item.length > 26 ? form.item.substring(0, 23) + "..." : form.item} updated`,
        "bottom"
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
      router.back();
    }
  };

  return (
    <SafeAreaView className="bg-primary min-h-full">
      <ScrollView className="px-4 mb-6">
        <Text className="text-3xl text-white font-bold text-center">Edit Item</Text>
        <FormField
          title="Item"
          value={form.item!}
          handleChangeText={(i) => setForm({ ...form, item: i })}
          otherStyles="mt-5"
          placeholder="Item You Wish To Add To The List"
        />
        <View className="mt-5 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Bay</Text>

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
            value={form.bays}
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
                  style={form.bays?.includes(item.value) ? styles.selectedItem : styles.textItem}>
                  {item.label}
                </Text>
              </View>
            )}
            onChange={(item) => {
              setForm({ ...form, bays: item });
            }}
          />
        </View>
        <View className=" mt-5 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Aisle</Text>
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
        <View className=" mt-5 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Side</Text>
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
        <CustomButton
          title="Update Item"
          isLoading={uploading}
          handlePress={submit}
          containerStyles="mt-5"
        />
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
