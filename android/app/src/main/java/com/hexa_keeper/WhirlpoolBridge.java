package io.hexawallet.keeper;

public class WhirlpoolBridge {
    static {
        System.loadLibrary("whirlpool");
    }

    public static native String helloWorld(String name);
    public static native String initiate(String torPort);
    public static native String pools(String torPort);
    public static native String gettx0data(String torPort);

}