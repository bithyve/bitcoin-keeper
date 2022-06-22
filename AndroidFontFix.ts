import React from "react";
import { Platform, StyleSheet } from "react-native";
import { Text } from "native-base";
import { getManufacturerSync } from "react-native-device-info";

export function enableAndroidFontFix() {
  if (Platform.OS !== "android") {
    return;
  }

  let manufacturer = getManufacturerSync();

  let styles;

  switch (manufacturer) {
    case "OnePlus":
      styles = StyleSheet.create({
        androidFontFixFontFamily: {
          fontFamily: "Roboto",
        },
      });
      break;
    default:
      return;
  }

  let __render = Text.render;
  Text.render = function (...args) {
    let origin = __render.call(this, ...args);
    return React.cloneElement(origin, {
      style: [styles.androidFontFixFontFamily, origin.props.style],
    });
  };
}
