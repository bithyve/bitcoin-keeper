/**
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import './shim';
import { AppRegistry, Text as NativeText } from 'react-native';
import 'react-native-get-random-values';
import { Text, Input } from 'native-base';
import App from './App';
import { name as appName } from './app.json';
import { enableAndroidFontFix } from './AndroidFontFix';
import { initSentrySDK } from 'src/services/sentry';

initSentrySDK();
enableAndroidFontFix();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Input.defaultProps = Input.defaultProps || {};
Input.defaultProps.allowFontScaling = false;
NativeText.defaultProps = NativeText.defaultProps || {};
NativeText.defaultProps.allowFontScaling = false;

AppRegistry.registerComponent(appName, () => App);
