import { SplashScreen, Stack, useNavigationContainerRef } from "expo-router";
import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { useCameraPermission } from "react-native-vision-camera";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import ToastManager from "toastify-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
Sentry.init({
  dsn: "https://e38e2c16df6a3fbdd66dee54dd92ef7d@o4507530408689664.ingest.us.sentry.io/4507530414391296",
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      // ...
    }),
  ],
});

SplashScreen.preventAutoHideAsync();
export default Sentry.wrap(function Layout() {
  const ref = useNavigationContainerRef();
  useEffect(() => {
    setStatusBarBackgroundColor("#161622", false);
    changeNavigationBarColor("#161622", false);
  }, []);

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);
  return (
    <GestureHandlerRootView>
      <StatusBar backgroundColor="#161622" />
      <ToastManager
        textStyle={{ fontSize: 15, width: 170 }}
        positionValue={120}
        animationIn={"fadeIn"}
        animationOut={"fadeOut"}
      />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#161622" },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="camera"
          options={{
            headerTitle: "",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#161622" },
          }}
        />
        <Stack.Screen
          name="image"
          options={{
            headerTitle: "",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#161622" },
          }}
        />
        <Stack.Screen
          name="edit"
          options={{
            headerTitle: "",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#161622" },
          }}
        />
        <Stack.Screen
          name="createItem"
          options={{
            headerTitle: "",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#161622" },
          }}
        />
        <Stack.Screen
          name="reorder"
          options={{
            headerTitle: "",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#161622" },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
});
