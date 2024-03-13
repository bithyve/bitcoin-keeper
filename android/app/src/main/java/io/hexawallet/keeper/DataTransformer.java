package io.hexawallet.keeper;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataTransformer {

    static class FeeData {
        int count;
        double totalFee0;
    }

    public static List<JSONObject> transformData(JSONArray data) throws JSONException {
        List<JSONObject> jsonObjects = new ArrayList<>();
        for (int i = 0; i < data.length(); i++) {
            jsonObjects.add(data.getJSONObject(i));
        }
        Collections.sort(jsonObjects, new Comparator<JSONObject>() {
            @Override
            public int compare(JSONObject a, JSONObject b) {
                long timestampA = 0;
                try {
                    timestampA = a.getLong("timestamp");
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                long timestampB = 0;
                try {
                    timestampB = b.getLong("timestamp");
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                return Long.compare(timestampA, timestampB);
            }
        });

        // Grouping data by sequence
        HashMap<Integer, FeeData> groupedData = new HashMap<>();
        int sequence = 1;
        int lastHour = new Date(jsonObjects.get(0).getLong("timestamp") * 1000).getHours();

        for (JSONObject item : jsonObjects) {
            int currentHour = new Date(item.getLong("timestamp") * 1000).getHours();

            if (currentHour != lastHour) {
                lastHour = currentHour;
                sequence++;
            }

            FeeData feeData = null;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                feeData = groupedData.getOrDefault(sequence, new FeeData());
            }
            feeData.count++;
            feeData.totalFee0 += item.getDouble("avgFee_75");
            groupedData.put(sequence, feeData);
        }

        // Calculating averages and creating the result list
        List<JSONObject> transformedData = new ArrayList<>();
        for (Map.Entry<Integer, FeeData> entry : groupedData.entrySet()) {
            FeeData feeData = entry.getValue();
            JSONObject obj = new JSONObject();
            obj.put("sequence", entry.getKey());
            obj.put("avgFee_0", feeData.totalFee0 / feeData.count);
            transformedData.add(obj);
        }

        return transformedData;
    }
}