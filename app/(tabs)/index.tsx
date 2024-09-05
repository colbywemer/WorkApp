import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import BigList, { BigListRenderItemInfo } from "react-native-big-list";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import { Form, Item2 } from "../../lib/types";
import { Todo2 } from "../../lib/types";
import useDatabase from "../../lib/useDatabase";
import {
  createWatchlistItem,
  deleteWatchlistItem,
  getAllPosts,
  updateWatchlistItems,
} from "../../lib/local";
import { SplashScreen, useFocusEffect, useRouter } from "expo-router";
import FastImage from "react-native-fast-image";
import { icons } from "../../constants";
import EmptyState from "../../components/EmptyState";
import { Toast } from "toastify-react-native";
import {
  backupWatchlistItemsFirestore,
  fetchWatchlistItemsFromFirestore,
} from "../../lib/firebase";
import { Dropdown } from "react-native-searchable-dropdown-kj";
import { styles, styles2 } from "../../lib/styles";
import { sortData } from "../../lib/data";
import { calculateTextHeight } from "../../functions/calculateTextHeight";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { groupAndSortDataForBiglist } from "../../functions/groupAndSortData";

export default function SectionList() {
  const { data: posts, refetch } = useDatabase(getAllPosts);
  const [items, setItems] = useState<Item2[][]>([]);
  const [sectionHeaders, setSectionHeaders] = useState<string[]>([]);
  const [clickedItems, setClickedItems] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [value, setValue] = useState(null);
  const [sort, setSort] = useState("aisle");
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (posts) {
      const { items, sectionHeaders } = groupAndSortDataForBiglist(posts, sort);
      setItems(items);
      setSectionHeaders(sectionHeaders);
      const newHeights: { [key: string]: number } = {};
      items.forEach((section, sectionIndex) => {
        section.forEach((item, itemIndex) => {
          const totalHeight = calculateTextHeight(item, 25);
          newHeights[`${sectionIndex}-${itemIndex}`] = totalHeight;
        });
      });

      setItemHeights(newHeights);
    }
  }, [posts, sort]);

  const handleBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      Toast.warn("Backup Started! Please do not close the app until it is complete.", "bottom");
      await backupWatchlistItemsFirestore(posts);
      Toast.success("Backup completed", "bottom");
    } catch (error) {
      Toast.error("Backup failed!", "bottom");
    } finally {
      setIsBackingUp(false);
    }
  }, [posts]);

  const ref = React.useRef<BigList>(null);
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
  const MemoizedItem = React.memo(({ item, section }: { item: Item2; section?: number }) => {
    return (
      <Swipeable
        activeOffsetX={[-30, 30]}
        failOffsetY={[-30, 30]}
        leftThreshold={Dimensions.get("window").width / 2}
        rightThreshold={Dimensions.get("window").width / 2}
        renderLeftActions={() => <ItemLeft />}
        renderRightActions={() => <ItemRight />}
        onSwipeableOpen={async (direction, swipeable) => {
          setIsUpdating(true);
          switch (direction) {
            case "left":
              router.push({ pathname: "edit", params: { item: JSON.stringify(item) } });
              swipeable.close();
              break;
            case "right":
              await deleteWatchlistItem(item);
              let updateOrder = items[section!]
                .filter((i) => i.id !== item.id)
                .map((i, index) => ({
                  ...i,
                  order: index, // Update the order based on the new index
                }));
              await updateWatchlistItems(updateOrder);
              Toast.error(
                `${
                  item.item.length > 10 ? item.item.substring(0, 7) + "..." : item.item
                } deleted from watchlist`,
                "bottom"
              );
              await new Promise((resolve) => setTimeout(resolve, 10));
              await refetch();
              swipeable.reset();
              break;
            default:
              break;
          }
          setIsUpdating(false);
        }}>
        <View className="px-7 flex flex-row justify-between items-center h-full bg-primary">
          <View className="w-[90%]">
            <TouchableOpacity activeOpacity={1} onPress={() => toggleClickedItem(item.id)}>
              <Text
                className={`${
                  clickedItems.includes(item.id) ? "text-gray-500" : "text-white"
                } text-base py-2`}
                style={{
                  fontFamily: "monospace",
                }}>
                {item.item} {item.bays.length !== 0 && `- ( ${item.bays.join(", ")} )`}
              </Text>
            </TouchableOpacity>
          </View>
          {!item.onTodoList && (
            <TouchableOpacity
              onPress={async () => {
                toggleClickedItem(item.id);
                router.push({ pathname: "camera", params: { item: JSON.stringify(item) } });
              }}>
              <FastImage
                source={icons.camera}
                resizeMode={FastImage.resizeMode.contain}
                tintColor={"#CDCDE0"}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          )}
        </View>
      </Swipeable>
    );
  });

  const MemoizedSectionHeader: React.FC<{ sectionIndex: number }> = React.memo(
    ({ sectionIndex }) => (
      <View className="flex flex-row justify-between items-center px-4 bg-primary">
        <Text className="text-2xl text-white font-bold flex-1 text-center">
          {sectionHeaders[sectionIndex]}
        </Text>
        <TouchableOpacity>
          <Text
            className="text-white font-bold"
            onPress={() =>
              router.push({
                pathname: "reorder",
                params: { items: JSON.stringify(items[sectionIndex]) },
              })
            }>
            Reorder
          </Text>
        </TouchableOpacity>
      </View>
    )
  );

  const MemoizedEmptyState: React.FC = React.memo(() => (
    <EmptyState
      title="No items found in watchlist"
      buttonText="Add Item"
      route="/create"
      backup={async () => {
        Toast.warn("Restoring from backup...", "bottom");
        let data: Item2[] = await fetchWatchlistItemsFromFirestore();
        for (let item of data) {
          const insertItem: Form = {
            item: item.item,
            bays: item.bays,
            aisle: item.aisle,
            side: item.side,
            order: item.order,
          };
          await createWatchlistItem(insertItem);
        }
        Toast.success("Restored from backup", "bottom");
        refetch();
      }}
    />
  ));

  const toggleClickedItem = useCallback((itemId: string) => {
    setClickedItems((prevItems) =>
      prevItems.includes(itemId) ? prevItems.filter((id) => id !== itemId) : [...prevItems, itemId]
    );
  }, []);

  const jumpToSection = useCallback((index: number) => {
    ref.current?.scrollToSection({ section: index, animated: true });
  }, []);

  const sectionOptions = useMemo(
    () => sectionHeaders.map((section, index) => ({ label: section, value: index })),
    [sectionHeaders]
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-2 mx-5">
        <View className="flex flex-row">
          <View className="w-1/2">
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
          <View className="w-[23%] flex items-center justify-center">
            <Text className="text-white text-base text-center">Sort By</Text>
          </View>
          <View className="w-[27%]">
            <Dropdown
              style={[styles.dropdown]}
              containerStyle={styles.containerStyles}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor="transparent"
              inputSearchStyle={styles.inputSearchStyle}
              data={sortData}
              renderItem={(item) => (
                <View style={styles.item}>
                  <Text style={item.value === sort ? styles.selectedItem : styles.textItem}>
                    {item.label}
                  </Text>
                </View>
              )}
              value={sort}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Sort By"}
              onChange={(item) => {
                setSort(item.value); // Update sort state with selected value
              }}
            />
          </View>
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
        renderSectionHeader={(section: number) => <MemoizedSectionHeader sectionIndex={section} />}
        stickySectionHeadersEnabled={false}
      />
      {posts.length > 0 && (
        <View className="flex flex-row justify-center items-center">
          {!isBackingUp ? (
            <TouchableOpacity
              className="p-2"
              onLongPress={async () => {
                await handleBackup();
              }}>
              <FastImage source={icons.backup} className="w-6 h-6" tintColor={"#FF9C01"} />
            </TouchableOpacity>
          ) : (
            <View className="p-2">
              <View className="h-6">
                <ActivityIndicator size="small" color="#FF9C01" />
              </View>
            </View>
          )}
        </View>
      )}
      <StatusBar backgroundColor="#161622" />
    </SafeAreaView>
  );
}
