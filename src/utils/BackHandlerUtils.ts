import { BackHandler } from "react-native";

export default function BackHandlerUtils() {
  const backAction = () => true;
  const backHandler = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );
  return () => backHandler.remove();
}
