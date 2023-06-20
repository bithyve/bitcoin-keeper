package com.hexa_keeper;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import io.hexawallet.keeper.WhirlpoolBridge;

public class BackgroundWorker extends Worker {
    private final Context context;
    public static final String TAG = "BackgroundWorker";

    public BackgroundWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
        this.context = context;
    }

    @NonNull
    @Override
    public Result doWork() {
        try{
            String input = getInputData().getString("input");
            String privateKey = getInputData().getString("privateKey");
            String destination = getInputData().getString("destination");
            String poolId = getInputData().getString("poolId");
            String denomination = getInputData().getString("denomination");
            String preUserHash = getInputData().getString("preUserHash");
            String network = getInputData().getString("network");
            String blockHeight = getInputData().getString("blockHeight");
            String signedRegistrationMessage = getInputData().getString("signedRegistrationMessage");
            String appId = getInputData().getString("appId");
            String port = getInputData().getString("port");
            String mixResult =  WhirlpoolBridge.start(input, privateKey, destination, poolId, denomination, preUserHash, network,blockHeight, signedRegistrationMessage, appId, port);
            Data outPutData = new Data.Builder()
                    .putString("MIX_RESULT",mixResult)
                    .build();
            return Result.success(outPutData);
        }
        catch (Exception e){
            return Result.failure();
        }
    }
}
