import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useDatabase from "../../lib/useDatabase";
import { deleteTodo, getAllTodos } from "../../lib/local";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import EmptyState from "../../components/EmptyState";
import { Todo2 } from "../../lib/types";
import { icons } from "../../constants";
import { useFocusEffect, useRouter } from "expo-router";
import CheckBox from "@react-native-community/checkbox";
import { Toast } from "toastify-react-native";
import { Dropdown } from "react-native-searchable-dropdown-kj";
import { styles, styles2 } from "../../lib/styles";
import { sortData } from "../../lib/data";
import React from "react";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import FastImage from "react-native-fast-image";
import { calculateTextHeight } from "../../functions/calculateTextHeight";
import { groupAndSortDataForBiglist } from "../../functions/groupAndSortData";
import BigList from "react-native-big-list";
import { Swipeable } from "react-native-gesture-handler";

export default function Home() {
  const { data: posts, refetch } = useDatabase(getAllTodos);
  const [deleting, setDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Todo2[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [displayMode, setDisplayMode] = useState<"text" | "image">("image");
  const [items, setItems] = useState<Todo2[][]>([]);
  const [sectionHeaders, setSectionHeaders] = useState<string[]>([]);
  const router = useRouter();
  const sectionListRef = useRef<BigList>(null);
  const [value, setValue] = useState(null);
  const [sort, setSort] = useState("aisle");
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  useEffect(() => {
    if (posts) {
      const { items, sectionHeaders } = groupAndSortDataForBiglist(posts, sort);
      setItems(items);
      setSectionHeaders(sectionHeaders);
      const images = posts.map((post) => ({ uri: post.photo }));
      FastImage.preload(images);
      const newHeights: { [key: string]: number } = {};
      items.forEach((section, sectionIndex) => {
        section.forEach((todo, itemIndex) => {
          const totalHeight = calculateTextHeight(todo.item, 34);
          newHeights[`${sectionIndex}-${itemIndex}`] = totalHeight;
        });
      });

      setItemHeights(newHeights);
    }
  }, [posts]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      setSelectAll(false);
      setSelectedItems([]);
    }, [])
  );

  const handleLongPress = (todo: Todo2) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(todo)) {
        return prevSelected.filter((item) => item !== todo);
      } else {
        return [...prevSelected, todo];
      }
    });
  };

  const handleSelectAll = () => {
    if (deleting) return;
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(posts);
    }
    setSelectAll(!selectAll);
  };

  const toggleDisplayMode = () => {
    setDisplayMode((prevMode) => (prevMode === "text" ? "image" : "text"));
  };

  const jumpToSection = useCallback((index: number) => {
    sectionListRef.current?.scrollToSection({ section: index, animated: true });
  }, []);

  const sectionOptions = useMemo(
    () => sectionHeaders.map((section, index) => ({ label: section, value: index })),
    [sectionHeaders]
  );

  const handleDelete = async (itemsToDelete: Todo2[]) => {
    setDeleting(true);
    try {
      const deleteTodoPromises = itemsToDelete.map(async (item) => deleteTodo(item));
      await Promise.all(deleteTodoPromises);
      Toast.error(`${itemsToDelete.length} items removed from todo list`, "bottom");
    } catch (error) {
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    await refetch();
    setSelectedItems([]);
    setDeleting(false);
    setSelectAll(false);
  };

  const handleDeleteSingle = async (item: Todo2) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== item.id));
    setDeleting(true);
    try {
      await deleteTodo(item);
      Toast.error(
        `${
          item.item.item.length > 10 ? item.item.item.substring(0, 7) + "..." : item.item.item
        } removed from todo list`,
        "bottom"
      );
    } catch (error) {
      console.error(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    await refetch();
    setSelectedItems([]);
    setDeleting(false);
  };

  const MemoizedSectionHeader: React.FC<{ sectionIndex: number }> = React.memo(
    ({ sectionIndex }) => (
      <View className="bg-primary z-50">
        <Text className="text-2xl text-white text-center font-bold">
          {sectionHeaders[sectionIndex]}
        </Text>
      </View>
    )
  );

  const ItemRight = () => {
    return (
      <View className="w-full h-full bg-red flex justify-center items-end">
        <Text className="mx-4">Delete</Text>
      </View>
    );
  };

  const MemoizedItem: React.FC<{
    item: Todo2;
    refetch: () => Promise<void>;
    router: {
      push: (route: { pathname: string; params: { item: string } }) => void;
    };
  }> = React.memo(({ item, router }) => (
    <Swipeable
      activeOffsetX={[-30, 30]}
      failOffsetY={[-30, 30]}
      leftThreshold={Dimensions.get("window").width / 2}
      rightThreshold={Dimensions.get("window").width / 2}
      renderRightActions={() => <ItemRight />}
      onSwipeableOpen={async () => await handleDeleteSingle(item)}>
      <View className={`${displayMode === "text" ? "" : "flex items-center"} bg-primary`}>
        {displayMode === "text" ? (
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={() => handleLongPress(item)}
            onPress={() =>
              router.push({
                pathname: "image",
                params: { item: JSON.stringify(item.photo) },
              })
            }
            className="flex justify-between flex-row items-center mx-5 my-2 px-1">
            <Text
              className={`text-base w-[335px] ${
                selectedItems.includes(item) ? "text-yellow-500" : "text-white"
              }`}
              style={{
                fontFamily: "monospace",
              }}>
              {item.item.item} {item.item.bays.length != 0 && `- ( ${item.item.bays.join(", ")} )`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={() => handleLongPress(item)}
            onPress={() =>
              router.push({
                pathname: "image",
                params: { item: JSON.stringify(item.photo) },
              })
            }
            className="relative w-[225px] h-[300px] overflow-hidden mx-5 my-2">
            <FastImage source={{ uri: item.photo }} className="w-full h-full" />

            {selectedItems.includes(item) &&
              (!deleting ? (
                <View className="absolute top-0 right-0 p-1">
                  <FastImage source={icons.checkmark} className="w-6 h-6 z-50" />
                </View>
              ) : (
                <View className="absolute top-0 right-0 p-1 z-50">
                  <ActivityIndicator size="small" color="#FF9C01" />
                </View>
              ))}

            <View className="absolute top-1 left-0 p-1 m-1 bg-primary/30 rounded-xl">
              <Text
                className="text-base text-white"
                style={{
                  fontFamily: "monospace",
                }}>
                {item.item.item}{" "}
                {item.item.bays.length != 0 && `- ( ${item.item.bays.join(", ")} )`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Swipeable>
  ));

  const MemoizedEmptyState: React.FC = React.memo(() => (
    <EmptyState title="No items found in todo" buttonText="Add Items" route="/" />
  ));

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-2 mx-5">
        {sectionHeaders.length > 0 ? (
          <>
            <View className="justify-between flex flex-row items-center mb-5">
              <TouchableOpacity
                activeOpacity={1}
                className="text-center items-center"
                onPress={handleSelectAll}>
                <CheckBox
                  value={selectAll}
                  disabled={deleting}
                  onValueChange={handleSelectAll}
                  tintColors={{ true: "aqua", false: "white" }}
                />
                <Text className="text-white">Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDisplayMode}>
                <Text className="text-white">
                  {displayMode === "text" ? "Show Images" : "Show Text"}
                </Text>
              </TouchableOpacity>
              {!deleting ? (
                <TouchableOpacity
                  disabled={selectedItems.length === 0}
                  onPress={async () => {
                    if (selectedItems.length > 0) {
                      await handleDelete(selectedItems);
                    }
                  }}>
                  <FastImage
                    source={icons.trash}
                    tintColor={selectedItems.length > 0 ? "red" : "rgba(255, 0, 0, 0.5)"}
                    className="w-6 h-6"
                  />
                </TouchableOpacity>
              ) : (
                <ActivityIndicator size="small" color="#FF9C01" />
              )}
            </View>
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
                    setSort(item.value);
                  }}
                />
              </View>
            </View>
          </>
        ) : null}
      </View>
      <BigList
        sections={items}
        ref={sectionListRef}
        renderItem={({ item }: { item: Todo2 }) => (
          <MemoizedItem item={item} refetch={refetch} router={router} />
        )}
        itemHeight={(section: number, index: number) => {
          if (displayMode === "image") return 316;
          return itemHeights[section + "-" + index] || 0;
        }}
        renderEmpty={() => <MemoizedEmptyState />}
        headerHeight={0}
        renderHeader={() => null}
        footerHeight={0}
        renderFooter={() => null}
        sectionHeaderHeight={32}
        stickySectionHeadersEnabled={false}
        batchSizeThreshold={15}
        removeClippedSubviews
        renderSectionHeader={(section: number) => <MemoizedSectionHeader sectionIndex={section} />}
      />
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
