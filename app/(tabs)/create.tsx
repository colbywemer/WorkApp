import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { Alert, ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";
import { useCallback, useState, useEffect } from "react";
import CustomButton from "../../components/CustomButton";
import { Form, savedItem } from "../../lib/types";
import { createWatchlistItem } from "../../lib/local";
import { Dropdown, MultiSelect } from "react-native-searchable-dropdown-kj";
import CheckBox from "@react-native-community/checkbox";
import { icons } from "../../constants";
import { aisles, bays, sides } from "../../lib/data";
import { styles } from "../../lib/styles";
import { Toast } from "toastify-react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default function App() {
  const [form, setForm] = useState<Form>({
    item: null,
    bays: [],
    aisle: null,
    side: null,
  });

  let { item, itemList } = useLocalSearchParams();
  let parsedItemList: boolean =
    typeof itemList === "string" && itemList ? JSON.parse(itemList) : false;
  let parsedItem: savedItem | undefined;
  if (typeof item === "string") parsedItem = JSON.parse(item) as savedItem;

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (parsedItem) {
        setForm({
          item: parsedItem.item,
          bays: form.bays,
          aisle: parsedItem.aisle,
          side: parsedItem.side,
        });
      }
    }, [item])
  );

  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!form.item || !form.aisle || !form.side) {
      return Toast.warn("Please fill in all the fields", "bottom");
    }
    setUploading(true);
    try {
      await createWatchlistItem({ ...form });
      Toast.success(
        `${
          form.item.length > 18 ? form.item.substring(0, 15) + "..." : form.item
        } added to watchlist`,
        "bottom"
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        item: booleanList[0] ? form.item : null,
        bays: booleanList[1] ? form.bays : [],
        aisle: booleanList[2] ? form.aisle : null,
        side: booleanList[3] ? form.side : null,
      });
      setUploading(false);
      if (item != "null" && item != null) {
        console.log("Item:", item);
        router.setParams({
          item: null,
          itemList: null,
        });
        console.log("Item:", item);
        if (parsedItemList) {
          router.push({
            pathname: "items",
          });
        } else {
          router.push({
            pathname: "scanner",
          });
        }
      }
    }
  };

  const [booleanList, setBooleanList] = useState([false, false, false, false]);

  const toggleBoolean = (index: number) => {
    setBooleanList((prevState) => {
      const updatedList = [...prevState];
      updatedList[index] = !updatedList[index];
      return updatedList;
    });
  };

  return (
    <SafeAreaView className="bg-primary min-h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-3xl text-white font-bold text-center">Add Item To Watchlist</Text>

        <FormField
          title="Item"
          value={form.item!}
          handleChangeText={(i) => setForm({ ...form, item: i })}
          otherStyles="mt-3"
          placeholder="Item You Wish To Add To The List"
          checkboxValue={booleanList[0]}
          checkboxAction={() => toggleBoolean(0)}
        />
        <View className="mt-3 space-y-2">
          <View className="flex flex-row justify-between">
            <Text className="text-base text-gray-100 font-pmedium">Bay</Text>

            <TouchableOpacity
              className="flex flex-row items-center"
              onPress={() => toggleBoolean(1)}
              activeOpacity={1}>
              <CheckBox
                value={booleanList[1]}
                onValueChange={() => toggleBoolean(1)}
                tintColors={{ true: "aqua", false: "white" }}
              />
              <Text className="text-white">Remember?</Text>
            </TouchableOpacity>
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
        <View className=" mt-3 space-y-2">
          <View className="flex flex-row justify-between">
            <Text className="text-base text-gray-100 font-pmedium">Aisle</Text>

            <TouchableOpacity
              className="flex flex-row items-center"
              onPress={() => toggleBoolean(2)}
              activeOpacity={1}>
              <CheckBox
                value={booleanList[2]}
                onValueChange={() => toggleBoolean(2)}
                tintColors={{ true: "aqua", false: "white" }}
              />
              <Text className="text-white">Remember?</Text>
            </TouchableOpacity>
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

            <TouchableOpacity
              className="flex flex-row items-center"
              onPress={() => toggleBoolean(3)}
              activeOpacity={1}>
              <CheckBox
                value={booleanList[3]}
                onValueChange={() => toggleBoolean(3)}
                tintColors={{ true: "aqua", false: "white" }}
              />
              <Text className="text-white">Remember?</Text>
            </TouchableOpacity>
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
        <CustomButton
          title="Add Item To List"
          isLoading={uploading}
          handlePress={submit}
          containerStyles="mt-3"
        />
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
