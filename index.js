/**
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import './shim';
import { AppRegistry, Text as NativeText } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { enableAndroidFontFix } from './AndroidFontFix';
import { Text, Input } from "native-base";

enableAndroidFontFix();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Input.defaultProps = Text.defaultProps || {};
Input.defaultProps.allowFontScaling = false;
NativeText.defaultProps = Text.defaultProps || {};
NativeText.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => App);
