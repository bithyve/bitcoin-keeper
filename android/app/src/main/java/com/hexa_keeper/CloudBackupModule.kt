package com.hexa_keeper

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
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
import com.itextpdf.text.BaseColor
import com.itextpdf.text.Chunk
import com.itextpdf.text.Document
import com.itextpdf.text.Element
import com.itextpdf.text.Font
import com.itextpdf.text.FontFactory
import com.itextpdf.text.Image
import com.itextpdf.text.PageSize
import com.itextpdf.text.Paragraph
import com.itextpdf.text.pdf.BarcodeQRCode
import com.itextpdf.text.pdf.BaseFont
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfGState
import com.itextpdf.text.pdf.PdfWriter
import com.itextpdf.text.pdf.draw.DottedLineSeparator
import com.itextpdf.text.pdf.draw.LineSeparator
import io.hexawallet.keeper.R
import org.json.JSONArray
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Base64
import java.util.Collections


class CloudBackupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private val SIGN_IN_INTENT_REQ_CODE = 1010
    private val FOLDER_NAME = "Bitcoin-Keeper"
    private var apiClient: GoogleSignInClient? = null
    private lateinit var tokenPromise: Promise
    private val qrImageSize = 250f

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
            val jsonObject = JsonObject()
            jsonObject.addProperty("status", true)
            jsonObject.addProperty("error", "")
            promise.resolve(jsonObject.toString())
            return
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
            val file = File(
                reactApplicationContext.filesDir,
                "Your-Wallet-Configurations-${formattedDateTime}.pdf"
            )

            val assetManager = reactApplicationContext.assets
            val fontStream = assetManager.open("fonts/FiraSans-Regular.ttf")

            val byteArrayOutputStream = ByteArrayOutputStream()
            fontStream.use { input ->
                byteArrayOutputStream.use { output ->
                    input.copyTo(output)
                }
            }
            val fontBytes = byteArrayOutputStream.toByteArray()
            val firaSansRegular =  BaseFont.createFont("FiraSans-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null)

            val defaultFont = Font(firaSansRegular, 13f, Font.NORMAL)
            val document = Document(PageSize.A4)
            val pdfWriter = PdfWriter.getInstance(document, FileOutputStream(File(file.path)))
            pdfWriter.setEncryption(
                password.toByteArray(),
                password.toByteArray(),
                PdfWriter.ALLOW_COPY or PdfWriter.ALLOW_PRINTING,
                PdfWriter.STANDARD_ENCRYPTION_128
            )
            document.open()

            val padding = 36f // 0.5 inch padding on all sides
            val bitmap = BitmapFactory.decodeResource(reactApplicationContext.resources, R.drawable.bgkeeper)
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val byteArray = stream.toByteArray()
            val image = Image.getInstance(byteArray)
            image.scaleAbsolute(320F, 150F)

            // Align image to center
            image.alignment = Element.ALIGN_CENTER
            document.add(image)
            val header = Paragraph("Your Wallet Configurations",  Font(firaSansRegular, 24f, Font.NORMAL))
            header.alignment = Element.ALIGN_CENTER
            header.spacingBefore = padding
            header.spacingAfter = padding
            val paragraph1 = Paragraph("Dear Recipient,", defaultFont)
            val paragraph2 = Paragraph("This document includes all your Wallet Configurations (aka Output Descriptors or BSMS files)*. To recreate your wallet on a multisig app like Keeper or Sparrow**, copy the text between the dotted lines in the Wallet Configuration Text section, and paste it in the appropriate area of the app. You can also scan the QR code of the desired vault to recreate it. ", defaultFont)
            paragraph1.spacingBefore = 10f
            paragraph1.spacingAfter = 10f
            paragraph2.spacingBefore = 10f
            paragraph2.spacingAfter = 10f
            document.add(header)
            document.add(paragraph1)
            document.add(paragraph2)

            val footer = Paragraph("This document is generated by the Bitcoin Keeper app. Need help? Reach out to us via the in-app chat support called Keeper Concierge. For more details visit: www.bitcoinkeeper.app.   \n" +
                    "\n" +
                    "* Wallet configuration files standardize multi-signature setups, ensuring secure and interoperable configurations with public keys and derivation paths. This ensures that you do not have to rely on a single bitcoin wallet to create and use a multisig wallet. \n" +
                    "** Keeper and Sparrow are bitcoin wallets that allow you to create wallets called multisig wallets (In Keeper these are called Vaults). Multisig wallets, as the name suggests require multiple signatures to sign a single bitcoin transaction.", defaultFont)
            footer.spacingBefore = padding
            footer.spacingAfter = padding
            document.add(footer)
            for (i in 0 until jsonArray.length()) {
                document.newPage()
                val jsonObject = jsonArray.getJSONObject(i)
                val content = jsonObject.getString("bsms")
                val vaultName = jsonObject.getString("name")

                val preface = Paragraph()
                preface.alignment = Element.ALIGN_CENTER
                preface.spacingBefore = padding
                preface.spacingAfter = padding
                preface.add(Paragraph("Vault Name: $vaultName", defaultFont))
                preface.add(Paragraph(" "));
                preface.add(Paragraph("Wallet Configuration Text:",  defaultFont))
                preface.add(Paragraph("----------------------------------------------------------------------------------------------------------------------"));
                preface.add(Paragraph(content, defaultFont))
                preface.add(Paragraph("----------------------------------------------------------------------------------------------------------------------"));
                preface.add(Paragraph("File Details: File created on: $formattedDateTime",  Font(firaSansRegular, 13f, Font.NORMAL)));
                preface.add(Paragraph(" "));
                preface.add(Paragraph("Wallet Configuration QR: ",  defaultFont));
                preface.add(Paragraph(" "));
                val barcodeQRCode = BarcodeQRCode(
                    content,
                    qrImageSize.toInt(),
                    qrImageSize.toInt(),
                    null
                )
                val codeQrImage = barcodeQRCode.image
                codeQrImage.scaleAbsolute(qrImageSize, qrImageSize)
                codeQrImage.alignment = Element.ALIGN_CENTER
                document.add(preface)
                document.add(Chunk.NEWLINE)
                document.add(codeQrImage)
                document.add(Chunk.NEWLINE)

            }
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