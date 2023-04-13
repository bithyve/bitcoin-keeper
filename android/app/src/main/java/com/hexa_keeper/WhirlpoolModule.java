package com.hexa_keeper;

import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import io.hexawallet.keeper.WhirlpoolBridge;

public class WhirlpoolModule extends ReactContextBaseJavaModule{

    public static final String NAME = "Whirlpool";
    public static final String TAG = "WhirlpoolMODULE";

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
    public void tx0Preview(String inputsValue, String poolStr, String premixFeePerByte, String feesAddress, String inputStructureStr,String minerFeePerByte,String coordinatorFee, String nWantedMaxOutputsStr, String nPoolMaxOutputs, Promise promise) {
        promise.resolve(WhirlpoolBridge.tx0previewnew(inputsValue, poolStr,premixFeePerByte, feesAddress, inputStructureStr,minerFeePerByte, coordinatorFee, nWantedMaxOutputsStr, nPoolMaxOutputs));
    }

    @ReactMethod
    public void tx0Push(String txStr, String poolIdStr, Promise promise) {
        promise.resolve(WhirlpoolBridge.tx0push(txStr, poolIdStr));
    }

    @ReactMethod
    public void intoPsbt(String previewStr, String tx0DataStr, String inputsStr,String addressBankStr, String changeAddrStr, Promise promise) {
        promise.resolve(WhirlpoolBridge.intopsbt(previewStr, tx0DataStr, inputsStr, addressBankStr, changeAddrStr));
    }

    @ReactMethod
    public void constructInput(String outpoint, Integer value, String scriptPubkey, Promise promise) {
        promise.resolve(WhirlpoolBridge.constructinput(outpoint, value, scriptPubkey));
    }

    @ReactMethod
    public void blocking(String input, String privateKey, String destination,String poolId, String denomination, String preUserHash, String network, String blockHeight, Promise promise) {
        promise.resolve(WhirlpoolBridge.blocking(input, privateKey, destination, poolId, denomination, preUserHash, network,blockHeight));
    }
}
