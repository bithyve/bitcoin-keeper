package com.hexa_keeper;

import android.widget.Toast;

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
    public void sayHello(String name,Promise promise) {
        promise.resolve(WhirlpoolBridge.helloWorld(name));
    }

    @ReactMethod
    public void initiate(Promise promise) {
        promise.resolve(WhirlpoolBridge.initiate());
    }

    @ReactMethod
    public void getTx0Data(Promise promise) {
        promise.resolve(WhirlpoolBridge.gettx0data());
    }

    @ReactMethod
    public void getPools(Promise promise) {
        promise.resolve(WhirlpoolBridge.pools());
    }

    @ReactMethod
    public void tx0Preview(Integer inputsValue, String poolStr, Integer premixFeePerByte, String inputStructureStr,Integer minerFeePerByte,Integer coordinatorFee, String nWantedMaxOutputsStr, Integer nPoolMaxOutputs, Promise promise) {
        promise.resolve(WhirlpoolBridge.tx0preview(inputsValue, poolStr, premixFeePerByte, inputStructureStr, minerFeePerByte, coordinatorFee,nWantedMaxOutputsStr, nPoolMaxOutputs));
    }
}
