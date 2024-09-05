import { View, Text, TextInput, TouchableOpacity, KeyboardTypeOptions } from "react-native";
import React from "react";
import CheckBox from "@react-native-community/checkbox";

type FormFieldProps = {
  title?: string;
  value: string;
  placeholder?: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  keyboardType?: KeyboardTypeOptions;
  checkboxValue?: boolean;
  checkboxAction?: () => void;
  editable?: boolean;
};

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  keyboardType,
  checkboxValue,
  checkboxAction,
  editable = true,
  ...props
}: FormFieldProps) => {
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="flex flex-row justify-between">
        {title && <Text className="text-base text-gray-100 font-pmedium">{title}</Text>}

        {checkboxValue !== undefined && (
          <TouchableOpacity
            className="flex flex-row items-center"
            onPress={checkboxAction}
            activeOpacity={1}>
            <CheckBox
              value={checkboxValue}
              onValueChange={checkboxAction}
              tintColors={{ true: "aqua", false: "white" }}
            />
            <Text className="text-white">Remember?</Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl items-center border-2 border-secondary flex-row">
        <TextInput
          editable={editable}
          className=" flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#7b7b8b"
          autoCapitalize="words"
          {...props}
        />
      </View>
    </View>
  );
};

export default FormField;
