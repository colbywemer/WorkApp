import { Text, View, Image, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useDatabase from "../../lib/useDatabase";
import { createItem, deleteItem, getAllItems } from "../../lib/local";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../../components/EmptyState";
import { savedItem } from "../../lib/types";
import { icons } from "../../constants";
import { TouchableOpacity } from "react-native";
import { SplashScreen, useFocusEffect, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import FormField from "../../components/FormField";
import { styles, styles2 } from "../../lib/styles";
import { Dropdown } from "react-native-searchable-dropdown-kj";
import { backupItemsFirestore, fetchItemsFromFirestore } from "../../lib/firebase";
import React from "react";
import { calculateTextHeight } from "../../functions/calculateTextHeight";

import BigList from "react-native-big-list";
import { groupAndSortSavedItemDataForBiglist } from "../../functions/groupAndSortData";
import { Swipeable } from "react-native-gesture-handler";

export default function Items() {
  const { data: posts, refetch } = useDatabase(getAllItems);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<savedItem[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [value, setValue] = useState(null);

  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});
  const [items, setItems] = useState<savedItem[][]>([]);
  const [sectionHeaders, setSectionHeaders] = useState<string[]>([]);
  const ref = React.useRef<BigList>(null);

  const jumpToSection = useCallback((index: number) => {
    ref.current?.scrollToSection({ section: index, animated: true });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useEffect(() => {
    if (posts) {
      const { items, sectionHeaders } = groupAndSortSavedItemDataForBiglist(filteredPosts);
      setItems(items);
      setSectionHeaders(sectionHeaders);
      const newHeights: { [key: string]: number } = {};
      items.forEach((section, sectionIndex) => {
        section.forEach((item, itemIndex) => {
          const totalHeight = calculateTextHeight(item, 34);
          newHeights[`${sectionIndex}-${itemIndex}`] = totalHeight;
        });
      });
      setItemHeights(newHeights);
    }
  }, [filteredPosts]);

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);

    const delayHideSplashScreen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100 ms delay
      SplashScreen.hideAsync();
    };

    delayHideSplashScreen();
  }, []);

  useEffect(() => {
    let updatedPosts = posts;
    if (searchQuery !== "") {
      updatedPosts = updatedPosts.filter((post) =>
        post.item!.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredPosts(updatedPosts);
  }, [searchQuery, posts]);

  const sectionOptions = useMemo(
    () => sectionHeaders.map((section, index) => ({ label: section, value: index })),
    [sectionHeaders]
  );

  const MemoizedSectionHeader: React.FC<{ sectionIndex: number }> = React.memo(
    ({ sectionIndex }) => (
      <View className="flex flex-row justify-between items-center px-4 bg-primary">
        <Text className="text-2xl text-white font-bold flex-1 text-center">
          {sectionHeaders[sectionIndex]}
        </Text>
      </View>
    )
  );

  const ItemLeft = () => {
    return (
      <View className="w-full h-full bg-blue-500 flex justify-center items-start">
        <Text className="mx-4">Edit</Text>
      </View>
    );
  };

  const ItemRight = () => {
    return (
      <View className="w-full h-full bg-red flex justify-center items-end">
        <Text className="mx-4">Delete</Text>
      </View>
    );
  };

  const MemoizedItem: React.FC<{
    item: savedItem;
    section?: number;
  }> = React.memo(({ item, section }) => (
    <Swipeable
      activeOffsetX={[-30, 30]}
      failOffsetY={[-30, 30]}
      leftThreshold={Dimensions.get("window").width / 2}
      rightThreshold={Dimensions.get("window").width / 2}
      renderRightActions={() => <ItemRight />}
      renderLeftActions={() => <ItemLeft />}
      onSwipeableOpen={async (direction, swipeable) => {
        switch (direction) {
          case "left":
            router.push({
              pathname: "createItem",
              params: { item: JSON.stringify(item) },
            });
            swipeable.close();
            break;
          case "right":
            await deleteItem(item);
            Toast.error(`${item.item} deleted from upc list`, "bottom");
            await new Promise((resolve) => setTimeout(resolve, 10));
            await refetch();
            swipeable.reset();
            break;
          default:
            break;
        }
      }}>
      <View className="flex justify-between flex-row items-center bg-primary px-7">
        <TouchableOpacity
          className="flex-1"
          onPress={() => {
            router.push({
              pathname: "create",
              params: { item: JSON.stringify(item), itemList: "true" },
            });
          }}>
          <Text
            className={`text-base text-white w-[325px] py-2`}
            style={{
              fontFamily: "monospace",
            }}>
            {item.item}
          </Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  ));

  const handleBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      Toast.warn("Backup Started! Please do not close the app until it is complete.", "bottom");
      await backupItemsFirestore(posts);
      Toast.success("Backup completed", "bottom");
    } catch (error) {
      Toast.error(`Backup failed!`, "bottom");
    } finally {
      setIsBackingUp(false);
    }
  }, [posts]);
  const MemoizedEmptyState: React.FC = React.memo(() => (
    <EmptyState
      title="No items found"
      buttonText="Add UPC Items"
      route="/scanner"
      backup={async () => {
        Toast.warn("Restoring from backup...", "bottom");
        let data: savedItem[] = await fetchItemsFromFirestore();
        for (let item of data) {
          const newItem = await createItem(item);
          console.log(newItem); // Verify each item is being created
        }
        Toast.success("Restored from backup", "bottom");
        await refetch();
      }}
    />
  ));

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="mt-4">
        {posts.length > 0 ? (
          <View className="h-full">
            <View className="flex flex-row mx-5 justify-between">
              <View className="w-[48%]">
                <FormField
                  placeholder="Search Items..."
                  value={searchQuery}
                  handleChangeText={setSearchQuery}
                  otherStyles=" mb-3"
                />
              </View>

              <View className="w-[48%]">
                <Dropdown
                  style={[styles.dropdown]}
                  containerStyle={styles.containerStyles}
                  placeholderStyle={styles2.placeholderStyle}
                  selectedTextStyle={styles2.selectedTextStyle}
                  activeColor="transparent"
                  inputSearchStyle={styles.inputSearchStyle}
                  data={sectionOptions}
                  search
                  renderItem={(item) => (
                    <View style={styles.item}>
                      <Text style={styles2.selectedItem}>{item.label}</Text>
                    </View>
                  )}
                  value={value}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={"Jump To Section"}
                  searchPlaceholder="Search..."
                  onChange={(item) => {
                    jumpToSection(item.value);
                    setValue(item.value);
                    setTimeout(() => {
                      setValue(null);
                    }, 1);
                  }}
                />
              </View>
            </View>

            <BigList
              numColumns={1}
              batchSizeThreshold={15}
              ref={ref}
              sections={items}
              // Item
              itemHeight={(section: number, index: number) => {
                return itemHeights[section + "-" + index] || 0;
              }}
              renderItem={({ item, section }) => <MemoizedItem item={item} section={section} />}
              renderEmpty={() => <MemoizedEmptyState />}
              headerHeight={0}
              renderHeader={() => null}
              footerHeight={0}
              renderFooter={() => null}
              sectionHeaderHeight={32}
              renderSectionHeader={(section: number) => (
                <MemoizedSectionHeader sectionIndex={section} />
              )}
              stickySectionHeadersEnabled={false}
            />

            <View className="flex flex-row justify-center items-center">
              {!isBackingUp ? (
                <TouchableOpacity
                  className="p-2"
                  onLongPress={async () => {
                    handleBackup();
                  }}>
                  <Image source={icons.backup} className="w-6 h-6" tintColor={"#FF9C01"} />
                </TouchableOpacity>
              ) : (
                <View className="p-2">
                  <View className="h-6">
                    <ActivityIndicator size="small" color="#FF9C01" />
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <MemoizedEmptyState />
        )}
      </View>
      <StatusBar backgroundColor="#161622" />
    </SafeAreaView>
  );
}
