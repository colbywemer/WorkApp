import { View, Text, Image } from "react-native";
import { Tabs } from "expo-router";
import { icons } from "../../constants";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { TabIconProps } from "../../lib/types";
import { useEffect } from "react";
import changeNavigationBarColor from "react-native-navigation-bar-color";

setStatusBarBackgroundColor("#161622", false);

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View className="items-center justify-center gap-2">
      <Image source={icon} resizeMode="contain" tintColor={color} className="w-6 h-6" />
      <Text
        className={`${focused ? " font-psemibold" : " font-pregular"}`}
        style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 84,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Watchlist",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.eye} color={color} name="Watchlist" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: "Todo",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.list} color={color} name="Todo" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Add Item",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.plus} color={color} name="Add Item" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: "Scanner",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.barcode} color={color} name="Scanner" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="items"
          options={{
            title: "Items",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.product} color={color} name="Items" focused={focused} />
            ),
          }}
        />
      </Tabs>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabsLayout;
