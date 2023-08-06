package com.hexa_keeper;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class NFCHostModule extends ReactContextBaseJavaModule {

    private Intent intent;
    private Context context;

    public NFCHostModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = getReactApplicationContext();
        intent = new Intent(context, NFCHostService.class);
    }

    @NonNull
    @Override
    public String getName() {
        return "NFCHost";
    }

    @ReactMethod
    public void startBroadCast(String message, Promise promise) {
        intent.putExtra("ndefMessage", message);
        context.startService(intent);
        promise.resolve(true);
    }

    @ReactMethod
    public void stopBroadCast(Promise promise) {
        context.stopService(intent);
        promise.resolve(true);
    }
}
