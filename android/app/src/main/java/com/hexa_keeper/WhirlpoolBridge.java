package io.hexawallet.keeper;

public class WhirlpoolBridge {
    static {
        System.loadLibrary("whirlpool");
    }

    public static native String helloWorld(String name);
    public static native String initiate();
    public static native String pools();
    public static native String gettx0data();
    public static native String tx0preview(Integer inputsValue, String poolStr, Integer premixFeePerByte, String inputStructureStr,Integer minerFeePerByte,Integer coordinatorFee, String nWantedMaxOutputsStr, Integer nPoolMaxOutputs);

}