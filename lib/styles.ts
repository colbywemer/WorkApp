import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    dropdown: {
      height: 64,
      borderColor: "#FF9C01",
      borderWidth: 2,
      borderRadius: 16,
      paddingHorizontal: 16,
      marginVertical: 8,
    },
    placeholderStyle: {
      fontSize: 16,
      color: "#7b7b8b",
    },
    selectedTextStyle: {
      fontSize: 16,
      color: "white",
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      color: "white",
      borderRadius: 16,
      borderColor: "#FF9C01",
      borderEndWidth: 2,
      borderStartWidth: 2,
      borderTopWidth: 2,
      borderBottomWidth: 2,
      margin: 16,
    },
    containerStyles: {
      backgroundColor: "#161622",
      borderRadius: 16,
      borderColor: "#FF9C01",
      borderWidth: 2,
    },
    selectedStyle: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      borderColor: "#FF9C01",
      borderWidth: 2,
      marginTop: 8,
      marginRight: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    textItem: {
      flex: 1,
      fontSize: 16,
      color: "white",
    },
    item: {
      padding: 17,
    },
    selectedItem: {
      flex: 1,
      fontSize: 16,
      color: "#FF9C01",
    },
  });

  export const styles2 = StyleSheet.create({
    placeholderStyle: {
      fontSize: 14,
      color: "#7b7b8b",
      textAlign: "center",
    },
    selectedTextStyle: {
      fontSize: 15,
      color: "transparent",
    },
    selectedItem: {
      flex: 1,
      fontSize: 16,
      color: "white",
    },
  });

  export const cameraStyles = StyleSheet.create({
    flash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "black",
    },
    slider: {
      width: "80%",
      height: 40,
    },
  });