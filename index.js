/**
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import './shim';
import { AppRegistry } from 'react-native';
import 'react-native-get-random-values';
import App from './App';
import { name as appName } from './app.json';
import { enableAndroidFontFix } from './AndroidFontFix';

enableAndroidFontFix();

AppRegistry.registerComponent(appName, () => App);
