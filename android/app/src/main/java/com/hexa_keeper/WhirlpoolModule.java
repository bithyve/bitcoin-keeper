package com.hexa_keeper;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import io.hexawallet.keeper.WhirlpoolBridge;

public class WhirlpoolModule extends ReactContextBaseJavaModule{

    public static final String NAME = "Whirlpool";

    public WhirlpoolModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void hello_world(Promise promise) {
        promise.resolve(WhirlpoolBridge.helloWorld());
    }

    @ReactMethod
    public void initiate(Promise promise) {
        promise.resolve(WhirlpoolBridge.initiate());
    }
}
