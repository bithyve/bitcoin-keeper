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
    public static native String tx0push(String txStr, String poolIdStr);
    public static native String intopsbt(String previewStr, String tx0DataStr, String inputsStr,String addressBankStr, String changeAddrStr);
    public static native String blocking(String input, String privateKey, String destination,String poolId, String denomination, String preUserHash, String network, String blockHeight);
    public static native String constructinput(String outpoint, Integer value, String scriptPubkey);

}