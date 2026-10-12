package com.hexa_keeper

import android.util.AtomicFile
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import io.hexawallet.keeper.BuildConfig
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

/** A device-only seed store available exclusively in the separate testnet preview app. */
class KeeperPreviewMobileKeyModule(
    private val context: ReactApplicationContext
) : ReactContextBaseJavaModule(context) {
    override fun getName() = "KeeperPreviewMobileKey"

    @ReactMethod
    fun getOrCreateSeedBase64(promise: Promise) {
        resolveSeed(promise, createIfMissing = true)
    }

    @ReactMethod
    fun readExistingSeedBase64(promise: Promise) {
        resolveSeed(promise, createIfMissing = false)
    }

    private fun resolveSeed(promise: Promise, createIfMissing: Boolean) {
        if (!BuildConfig.IS_RECOVERABLE_PREVIEW || context.packageName != PREVIEW_PACKAGE) {
            promise.reject("PREVIEW_ONLY", "Mobile Key requires the testnet preview app")
            return
        }

        try {
            val files = KeeperPreviewMobileKeyFiles(context.noBackupFilesDir)
            val atomicFile = AtomicFile(files.seedFile)
            val records = object : KeeperPreviewMobileKeyRecords {
                override fun read(): ByteArray = atomicFile.openRead().use {
                    KeeperPreviewMobileKeyRecord.readBounded(it)
                }

                override fun writeDurably(record: ByteArray) {
                    val stream = atomicFile.startWrite()
                    try {
                        stream.write(record)
                        atomicFile.finishWrite(stream)
                    } catch (error: Exception) {
                        atomicFile.failWrite(stream)
                        throw error
                    }
                }
            }
            val seed = KeeperPreviewMobileKeyStore(files, records, AndroidEncryptionKeys())
                .getSeed(createIfMissing)
            val encoded = try {
                Base64.encodeToString(seed, Base64.NO_WRAP)
            } finally {
                seed.fill(0)
            }
            promise.resolve(encoded)
        } catch (_: Exception) {
            // Never replace an unreadable, corrupted, or inaccessible existing key.
            promise.reject("MOBILE_KEY_STORAGE_UNAVAILABLE", "Mobile Key secure storage is unavailable")
        }
    }

    private class AndroidEncryptionKeys : KeeperPreviewMobileKeyEncryptionKeys {
        // Initialize only under the core's process and file locks.
        private val keyStore by lazy { KeyStore.getInstance("AndroidKeyStore").apply { load(null) } }

        override fun read(): SecretKey? {
            val existing = keyStore.getKey(KEY_ALIAS, null) ?: return null
            return existing as? SecretKey
                ?: throw IllegalStateException("Mobile Key encryption key is invalid")
        }

        override fun containsAlias() = keyStore.containsAlias(KEY_ALIAS)

        override fun create(): SecretKey {
            val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            generator.init(
                KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .setRandomizedEncryptionRequired(true)
                    .setUserAuthenticationRequired(false)
                    .build()
            )
            return generator.generateKey()
        }
    }

    private companion object {
        const val PREVIEW_PACKAGE = KeeperPreviewMobileKeyRecord.PREVIEW_PACKAGE
        const val KEY_ALIAS = "$PREVIEW_PACKAGE.mobile-key.v1"
    }
}
