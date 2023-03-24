package io.hexawallet.keeper;

public class WhirlpoolBridge {
    static {
        System.loadLibrary("whirlpool");
    }

    public static native String helloWorld();
    public static native String initiate();
    public static native String get_pools();
    public static native String get_tx0_data();

}