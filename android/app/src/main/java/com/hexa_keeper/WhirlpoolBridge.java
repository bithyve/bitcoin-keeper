package io.hexawallet.keeper;

public class WhirlpoolBridge {
    static {
        System.loadLibrary("whirlpool");
    }

    public static native String helloWorld(String name);
    public static native String initiate(String port);
    public static native String pools(String port);
    public static native String gettx0data(String scode, String port);
    public static native String tx0preview(String inputs_value, String poolStr, String premixFeePerByte, String feesAddress, String inputStructureStr, String minerFeePerByte,String coordinatorFee, String nWantedMaxOutputsStr, String nPoolMaxOutputs);
    public static native String tx0push(String txStr, String poolIdStr, String port);
    public static native String intopsbt(String previewStr, String tx0DataStr, String inputsStr,String addressBankStr, String changeAddrStr);
    public static native String start(String input, String privateKey, String destination,String poolId, String denomination, String preUserHash, String network, String blockHeight, String signedRegistrationMessage, String appId, String port);
    public static native String constructinput(String outpoint, Integer value, String scriptPubkey);
    public static native String estimatetx0size(String nP2pkhInputs, String nP2shP2wpkhInputs, String nP2wpkhInputs, String nP2wpkhOutputs);
}