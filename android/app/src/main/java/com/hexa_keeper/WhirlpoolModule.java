package com.hexa_keeper;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.Observer;
import androidx.work.Data;
import androidx.work.ExistingWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkInfo;
import androidx.work.WorkManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import io.hexawallet.keeper.WhirlpoolBridge;

public class WhirlpoolModule extends ReactContextBaseJavaModule{

    public static final String NAME = "Whirlpool";
    public static final String TAG = "WhirlpoolMODULE";
    private OneTimeWorkRequest workRequest;
    private Context mContext;
    public WhirlpoolModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;

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
    public void initiate(String port, Promise promise) {
        promise.resolve(WhirlpoolBridge.initiate(port));
    }

    @ReactMethod
    public void getTx0Data(String scode, String port, Promise promise) {
        promise.resolve(WhirlpoolBridge.gettx0data(scode, port));
    }

    @ReactMethod
    public void getPools(String port, Promise promise) {
        promise.resolve(WhirlpoolBridge.pools(port));
    }

    @ReactMethod
    public void tx0Preview(String inputsValue, String poolStr, String premixFeePerByte, String feesAddress, String inputStructureStr,String minerFeePerByte,String coordinatorFee, String nWantedMaxOutputsStr, String nPoolMaxOutputs, Promise promise) {
        promise.resolve(WhirlpoolBridge.tx0preview(inputsValue, poolStr,premixFeePerByte, feesAddress, inputStructureStr,minerFeePerByte, coordinatorFee, nWantedMaxOutputsStr, nPoolMaxOutputs));
    }

    @ReactMethod
    public void tx0Push(String txStr, String poolIdStr, String port, Promise promise) {
        promise.resolve(WhirlpoolBridge.tx0push(txStr, poolIdStr, port));
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
    public void blocking(String input, String privateKey, String destination,String poolId, String denomination, String preUserHash, String network, String blockHeight, String signedRegistrationMessage, String appId, String port, Promise promise) {


        workRequest = new OneTimeWorkRequest.Builder(BackgroundWorker.class)
                .setInputData(
                        new Data.Builder()
                                .putString("input", input)
                                .putString("privateKey", privateKey)
                                .putString("destination", destination)
                                .putString("poolId", poolId)
                                .putString("denomination", denomination)
                                .putString("preUserHash", preUserHash)
                                .putString("network", network)
                                .putString("blockHeight", blockHeight)
                                .putString("signedRegistrationMessage", signedRegistrationMessage)
                                .putString("appId", appId)
                                .putString("port", port)
                                .build()
                )
                .build();

        WorkManager.getInstance(mContext).enqueueUniqueWork("whirlpoolmix", ExistingWorkPolicy.KEEP, workRequest);
        /*
        WorkManager.getInstance(mContext)
                        .getWorkInfoByIdLiveData(workRequest.getId())
                .observe((LifecycleOwner) this, new Observer<WorkInfo>() {
                    @Override
                    public void onChanged(WorkInfo workInfo) {
                        if (workInfo != null) {
                            switch (workInfo.getState()){
                                case FAILED:
                                case SUCCEEDED: {
                                    String mixResult = workInfo.getOutputData().getString("MIX_RESULT");
                                    Log.d(TAG, "onChanged: "+mixResult);
                                    promise.resolve(mixResult);

                                    break;
                                }
                            }
                        }
                    }
                });*/


       //promise.resolve(WhirlpoolBridge.start(input, privateKey, destination, poolId, denomination, preUserHash, network,blockHeight, signedRegistrationMessage, appId, port));
    }

    @ReactMethod
    public void estimateTx0Size(String nP2pkhInputs, String nP2shP2wpkhInputs, String nP2wpkhInputs, String nP2wpkhOutputs, Promise promise) {
        promise.resolve(WhirlpoolBridge.estimatetx0size(nP2pkhInputs, nP2shP2wpkhInputs, nP2wpkhInputs, nP2wpkhOutputs));
    }
}
