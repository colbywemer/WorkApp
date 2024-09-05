import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { images } from "../constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

type EmptyStateProps = {
  title: string;
  buttonText: string;
  route: string;
  backup?: () => void;
};

const EmptyState = ({ title, buttonText, route, backup }: EmptyStateProps) => {
  return (
    <View className="px-4 items-center justify-center">
      <Image source={images.empty} className="w-[270px] h-[215px]" resizeMode="contain" />
      <Text className="text-xl font-psemibold text-white text-center">{title}</Text>
      <CustomButton
        title={buttonText}
        handlePress={() => {
          router.push(route);
        }}
        containerStyles="w-full my-5"
      />

      {backup && (
        <TouchableOpacity className="p-3 border border-secondary rounded-xl" onPress={backup}>
          <Text className="text-base text-secondary">Restore From Backup</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;
