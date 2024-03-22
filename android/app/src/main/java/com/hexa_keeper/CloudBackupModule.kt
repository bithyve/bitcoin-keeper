package com.hexa_keeper

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.googleapis.json.GoogleJsonResponseException
import com.google.api.client.http.FileContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.gson.JsonObject
import com.itextpdf.text.Document
import com.itextpdf.text.Element
import com.itextpdf.text.Image
import com.itextpdf.text.PageSize
import com.itextpdf.text.Paragraph
import com.itextpdf.text.pdf.BarcodeQRCode
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfGState
import com.itextpdf.text.pdf.PdfWriter
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Collections


class CloudBackupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private val SIGN_IN_INTENT_REQ_CODE = 1010
    private val FOLDER_NAME = "Bitcoin-Keeper"
    private var apiClient: GoogleSignInClient? = null
    private lateinit var tokenPromise: Promise
    private val qrImageSize = 350f

    init {
        reactContext.addActivityEventListener(this)
    }

    override
    fun getName() = "CloudBackup"

    @ReactMethod
    fun setup(promise: Promise) {
        val signInOptions =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("941693293750-vs0qf25erem5ges485bcd2njn55luc07.apps.googleusercontent.com")
                .requestEmail()
                .requestScopes(Scope(DriveScopes.DRIVE_FILE))
                .build()
        apiClient = GoogleSignIn.getClient(reactApplicationContext, signInOptions);
        promise.resolve(true)
    }

    @ReactMethod
    fun login(promise: Promise) {
        val activity = currentActivity
        if (apiClient == null) {
            rejectWithError(promise,"Call setup method first")
            return;
        }
        tokenPromise = promise
        activity?.runOnUiThread {
            val signInIntent = apiClient!!.signInIntent
            activity.startActivityForResult(signInIntent, SIGN_IN_INTENT_REQ_CODE)
        }
    }

    @ReactMethod
    fun bsmsHealthCheck(promise: Promise) {
        try {
            val gAccount = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            val credential =
                GoogleAccountCredential.usingOAuth2(
                    reactApplicationContext,
                    listOf(DriveScopes.DRIVE_FILE)
                )
            val driveClient =
                Drive.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                    .setApplicationName("Keeper")
                    .build()
            val folders = driveClient.files().list()
                .setQ("mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '$FOLDER_NAME'")
                .execute()
            if(folders.files.size <= 0) {
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", false)
                jsonObject.addProperty("error", "No Bitcoin-Keeper folder found on Google Drive")
                promise.resolve(jsonObject.toString())
            } else {
                val files = folders.files[0]
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", true)
                jsonObject.addProperty("error", "")
                jsonObject.addProperty("data", "Found ${files.size} files")
                promise.resolve(jsonObject.toString())
            }
        }catch (e: Exception){
            Log.d(name, "Exception: $e")
            rejectWithError(promise, e.message)
        }
    }

    @ReactMethod
    fun backupBsms(data: String, password: String, promise: Promise) {
        try {
            val gAccount = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            val credential =
                GoogleAccountCredential.usingOAuth2(
                    reactApplicationContext,
                    listOf(DriveScopes.DRIVE_FILE)
                )
            if (gAccount != null) {
                credential.selectedAccount = gAccount.account!!
            }
            val jsonArray = JSONArray(data)
            val currentDateTime = LocalDateTime.now()
            val formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy, hh:mm:ss a")
            val formattedDateTime = currentDateTime.format(formatter)
            var gFileIds = arrayOf<String>()
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                val content = jsonObject.getString("bsms")
                val vaultName = jsonObject.getString("name")
                val file = File(
                    reactApplicationContext.filesDir,
                    "${vaultName}-${formattedDateTime}.pdf"
                )
                val document = Document(PageSize.A4)
                val pdfWriter = PdfWriter.getInstance(document, FileOutputStream(File(file.path)))
                pdfWriter.setEncryption(
                    password.toByteArray(),
                    password.toByteArray(),
                    PdfWriter.ALLOW_COPY or PdfWriter.ALLOW_PRINTING,
                    PdfWriter.STANDARD_ENCRYPTION_128
                )
                document.open()

                val preface = Paragraph()
                preface.add(Paragraph("Vault Name: $vaultName"))
                preface.add(Paragraph(" "));
                preface.add(Paragraph(content))
                preface.add(Paragraph(" "));
                val barcodeQRCode = BarcodeQRCode(
                    content,
                    qrImageSize.toInt(),
                    qrImageSize.toInt(),
                    null
                )
                val codeQrImage = barcodeQRCode.image
                codeQrImage.scaleAbsolute(qrImageSize, qrImageSize)
                document.add(preface)
                document.add(codeQrImage)
                document.close()
                val driveClient =
                    Drive.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
                        .setApplicationName("Keeper")
                        .build()
                val folder = createFolder(driveClient)
                val gFile = com.google.api.services.drive.model.File()
                gFile.parents = Collections.singletonList(folder)
                gFile.name = file.name
                val newFileID =
                    driveClient.files().create(gFile, FileContent("application/pdf", file)).execute().id
                gFileIds += newFileID
            }
            val jsonObject = JsonObject()
            jsonObject.addProperty("status", true)
            jsonObject.addProperty("error", "")
            jsonObject.addProperty("data", "${gFileIds.size} files uploaded to Google Drive. ")
            promise.resolve(jsonObject.toString())
        }catch (e: Exception){
            rejectWithError(promise, e.message)
            Log.d(name, "Exception: $e")
        }
    }

    private fun createFolder(drive: Drive): String? {
        val folders = drive.files().list()
            .setQ("mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '$FOLDER_NAME'")
            .execute()
        if(folders.files.size > 0) {
            return folders.files[0].id
        }
        val file: com.google.api.services.drive.model.File = com.google.api.services.drive.model.File()
        file.name = FOLDER_NAME;
        file.mimeType = "application/vnd.google-apps.folder";
        return try {
            val folder: com.google.api.services.drive.model.File? = drive.files().create(file)
                .setFields("id")
                .execute()
            folder?.id
        } catch (e: GoogleJsonResponseException) {
            throw e
        }
    }

    private fun rejectWithError(promise: Promise, error: String?) {
        val jsonObject = JsonObject()
        jsonObject.addProperty("status", false)
        jsonObject.addProperty("error", error)
        promise.resolve(jsonObject.toString())
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        intent: Intent?
    ) {
        if(requestCode == SIGN_IN_INTENT_REQ_CODE) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(intent)
            try {
                val account: GoogleSignInAccount = task.getResult(
                    ApiException::class.java
                )
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", true)
                jsonObject.addProperty("error", "")
                jsonObject.addProperty("data", account.email)
                tokenPromise.resolve(jsonObject.toString())
            } catch (e: ApiException) {
                Log.d(name, "onActivityResult: ${e.message}")
                val code = e.statusCode
                val errorDescription = getDriveErrorMessage(code)
                rejectWithError(tokenPromise, errorDescription)
            }
        }
    }

    private fun getDriveErrorMessage(statusCode: Int): String {
        return when(statusCode) {
            17-> "Failed to connect to your Google Drive. Please try after sometime."
            14, 20-> "Error connecting with server. Please try again after sometime."
            10-> "Technical error occurred. This cannot be rectified at your end. Please contact our support."
            13-> "We encountered a error. Please try again after sometime"
            8-> "Google Drive is temporarily unavailable. Please try again"
            5-> "Incorrect account name. Please use the account name you used originally while setting up the wallet."
            7-> "A network error occurred. Please check your connection and try again."
            30-> "Please check authentication with your google account in settings and try again."
            15-> "Request timed out. Please try again."
            4-> "You are not logged-in into your Google Drive account. Please log in from your Phone Settings."
            19-> "Unable to connect with Google Drive right now. Please try again after sometime."
            2-> "The installed version of Google Play services is out of date. Please update it from Play store."
            22,21-> "Unable to re-connect with Google Drive right now. Please try again after sometime."
            12501, 12502, 16-> "We recommend signing in as it easily allows you to backup your wallet on your personal cloud."
            else-> "We encountered a non-standard error. Please try again after sometime or contact us"
        }
    }

    override fun onNewIntent(intent: Intent?) {
    }

}