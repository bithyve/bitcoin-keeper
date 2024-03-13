package io.hexawallet.keeper;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.os.AsyncTask;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;


import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.Scanner;

public class KeeperWidget extends AppWidgetProvider {


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId, List<JSONObject> jsonData, int btc_price) throws JSONException {
        setAlarm(context, appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.keeper_widget);
        Bitmap chartBitmap = createChartBitmap(context,jsonData);
        views.setImageViewBitmap(R.id.chart_image, chartBitmap);
        String feeRateText = "$"+String.valueOf(btc_price);
        views.setTextViewText(R.id.sat_byte_tag, feeRateText);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static Bitmap createChartBitmap(Context context, List<JSONObject> jsonData) throws JSONException {
        LineChart chart = new LineChart(context);

        // Create datasets for each line
        LineDataSet dataSet0 = createDataSetForLine(jsonData, "avgFee_0", Color.RED, Color.argb(100, 255, 0, 0));

        // Create a LineData object that will be set on the chart
        LineData lineData = new LineData(dataSet0);
        // Chart styling
        styleChart(chart);
        chart.setData(lineData);

        // Convert chart to Bitmap
        chart.measure(View.MeasureSpec.makeMeasureSpec(800, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(400, View.MeasureSpec.EXACTLY));
        chart.layout(0, 0, chart.getMeasuredWidth(), chart.getMeasuredHeight());

        Bitmap bitmap = Bitmap.createBitmap(chart.getMeasuredWidth(),
                chart.getMeasuredHeight(),
                Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        chart.draw(canvas);

        return bitmap;
    }

    private static void setAlarm(Context context, int appWidgetId) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, KeeperWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[] {appWidgetId});
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        long interval = 600000; // 10 minutes in milliseconds
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, System.currentTimeMillis(), interval, pendingIntent);
    }
    private static LineDataSet createDataSetForLine(List<JSONObject> jsonData, String key, int color, int fillColor) throws JSONException {
        List<Entry> entries = new ArrayList<>();

        for (int i = 0; i < jsonData.size(); i++) {
            JSONObject item = jsonData.get(i);
            float xValue = (float) item.getInt("sequence");
            float yValue = (float) item.getDouble(key);
            entries.add(new Entry(xValue, yValue));
        }

        LineDataSet dataSet = new LineDataSet(entries, "Line " + key);
        dataSet.setColor(color);
        dataSet.setLineWidth(2f);
        dataSet.setDrawCircles(false);
        dataSet.setDrawValues(false);
        dataSet.setMode(LineDataSet.Mode.CUBIC_BEZIER);
        dataSet.setDrawFilled(true);
        dataSet.setFillColor(fillColor);

        return dataSet;
    }

    private static void styleChart(LineChart chart) {
        chart.getDescription().setEnabled(false);
        chart.getLegend().setEnabled(false);
        chart.setDrawBorders(false);

        // No grid lines
        chart.getXAxis().setDrawGridLines(false);
        chart.getAxisLeft().setDrawGridLines(false);
        chart.getAxisRight().setDrawGridLines(false);

        // No axis lines
        chart.getXAxis().setDrawAxisLine(false);
        chart.getAxisLeft().setDrawAxisLine(false);
        chart.getAxisRight().setDrawAxisLine(false);

        // No labels
        chart.getXAxis().setDrawLabels(false);
        chart.getAxisLeft().setDrawLabels(false);
        chart.getAxisRight().setDrawLabels(false);

        chart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);

        // Transparent background
        chart.setBackgroundColor(Color.TRANSPARENT);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            new FetchChartDataAsyncTask(context, appWidgetManager, appWidgetId).execute();
        }
    }

    private static class FetchChartDataAsyncTask extends AsyncTask<Void, Void, List<JSONObject>> {
        private Context context;
        private AppWidgetManager appWidgetManager;
        private int appWidgetId;

        FetchChartDataAsyncTask(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
            this.context = context;
            this.appWidgetManager = appWidgetManager;
            this.appWidgetId = appWidgetId;
        }

        @Override
        protected List<JSONObject> doInBackground(Void... voids) {
            try {
                URL url = new URL("https://bithyve-dev-relay.el.r.appspot.com/widgetData");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.connect();

                int responseCode = connection.getResponseCode();
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    return null; // Handle response code as needed
                }

                Scanner scanner = new Scanner(url.openStream());
                StringBuilder response = new StringBuilder();
                while (scanner.hasNext()) {
                    response.append(scanner.nextLine());
                }
                scanner.close();

                // Parse the full response
                JSONObject jsonResponse = new JSONObject(response.toString());

                // Navigate through the structure to get to graph_data
                // Directly access widgetData from the response
                int btcPriceUsd = 0;
                if (jsonResponse.has("widgetData")) {
                    JSONObject widgetData = jsonResponse.getJSONObject("widgetData");
                    if (widgetData.has("btc_data")) {
                        JSONObject btcData = widgetData.getJSONObject("btc_data");
                        if (btcData.has("btc_price_usd")) {
                             btcPriceUsd = btcData.getInt("btc_price_usd");
                        }
                    }

                    if (widgetData.has("graph_data")) {
                        JSONArray graphDataArray = widgetData.getJSONArray("graph_data");

                        // Assuming DataTransformer.transformData can handle JSONArray of graph_data directly
                        List<JSONObject> transformedData = DataTransformer.transformData(graphDataArray);
                        if (transformedData != null) {
                            try {
                                updateAppWidget(context, appWidgetManager, appWidgetId, transformedData,btcPriceUsd);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                        } else {
                            // Handle error, possibly show previous data
                        }
                        return transformedData;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                return null; // Handle exception as needed
            }
            return null;
        }


        private List<Entry> parseChartData(String jsonData) {
            List<Entry> entries = new ArrayList<>();
            try {
                JSONArray jsonArray = new JSONArray(jsonData);
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    // Assuming you want to plot avgFee_50 against avgHeight
                    float avgHeight = (float) jsonObject.getDouble("avgHeight");
                    float avgFee_50 = (float) jsonObject.getDouble("avgFee_50");
                    entries.add(new Entry(avgHeight, avgFee_50));
                }
            } catch (Exception e) {
                e.printStackTrace();
                // Handle parsing exception
            }
            return entries;
        }
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        // Enter relevant functionality for when the first widget is created
        setAlarm(context, 0); // This simplistic approach assumes single widget instance for demonstration.

    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}