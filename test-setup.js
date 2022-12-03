import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import {
    Dimensions
} from "react-native";
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

jest.mock('react-native-device-info', () => mockRNDeviceInfo);

jest.mock("react-native/Libraries/Utilities/Dimensions");
jest.mock("react-native-iphone-x-helper");


jest.spyOn(Dimensions, 'get').mockReturnValue({
    width: 414,
    height: 818
});


global.crypto = {
    getRandomValues: (arr) => require('crypto').randomBytes(arr.length)
};

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    // The mock for `call` immediately calls the callback which is incorrect
    // So we override it with a no-op
    Reanimated.default.call = () => {};
    return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-native-firebase/messaging', () =>
    jest.fn().mockImplementation(() => ({
        hasPermission: jest.fn(() => Promise.resolve(true)),
        subscribeToTopic: jest.fn(),
        unsubscribeFromTopic: jest.fn(),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        getToken: jest.fn(() => Promise.resolve('myMockToken')),
    }))
);

jest.mock('redux-persist', () => {
    const real = jest.requireActual('redux-persist');
    return {
        ...real,
        persistReducer: jest
            .fn()
            .mockImplementation((config, reducers) => reducers),
    };
});

jest.mock('react-native-reanimated', () =>
    require('react-native-reanimated/mock')
);

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    ReactNavigationInstrumentation: jest.fn(),
    ReactNativeTracing: jest.fn(),
}));