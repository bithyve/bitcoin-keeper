package io.hexawallet.keeper;

public class WhirlpoolBridge {
    static {
        System.loadLibrary("whirlpool");
    }

    public static native String helloWorld(String name);
    public static native String initiate(String torPort);
    public static native String get_pools(String torPort);
    public static native String get_tx0_data(String torPort);

}