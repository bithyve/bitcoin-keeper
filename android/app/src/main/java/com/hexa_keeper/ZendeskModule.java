package com.hexa_keeper;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import zendesk.android.Zendesk;
import zendesk.messaging.android.DefaultMessagingFactory;
import zendesk.messaging.android.push.PushNotifications;

public class ZendeskModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public ZendeskModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }


    @NonNull
    @Override
    public String getName() {
        return "Zendesk";
    }

    @ReactMethod
    public void initialize(String channelKey, Promise promise) {
        Zendesk.initialize(
                this.reactContext,
                channelKey,
                zendesk -> promise.resolve("success"),
                error -> promise.reject(error),
                new DefaultMessagingFactory());
    }

    @ReactMethod
    public void getUnreadMessageCount(Promise promise) {
        try {
            int unreadMsgCount = Zendesk.getInstance().getMessaging().getUnreadMessageCount();
            promise.resolve(unreadMsgCount);
        } catch (Exception e) {
            promise.reject("Zendesk Error", e.getMessage());
        }
    }

    @ReactMethod
    public void updateFcmToken(String fcmToken, Promise promise) {
        try {
            PushNotifications.updatePushNotificationToken(fcmToken);
            promise.resolve("updated");
        } catch(Exception error){
            promise.reject(error);
        }
    }
    @ReactMethod
    public void showMessaging(String appId, String tier, String tags, String appVersion, String versionHistory) {
        List<String> tagsList = new ArrayList<String>();
        Map<String,Object> fields = new HashMap<String, Object>();
        final String [] arr = tags.split(",");
        for (String s : arr) {
            tagsList.add(s.trim());
        }
        fields.put("18084979872925", appId);
        fields.put("18087575177885", tier);
        fields.put("18087673246237", appVersion);
        fields.put("18088921954333", versionHistory);
        Zendesk.getInstance().getMessaging().setConversationFields(fields);
        Zendesk.getInstance().getMessaging().setConversationTags(tagsList);
        Zendesk.getInstance().getMessaging().showMessaging(this.reactContext.getCurrentActivity());
    }
}
