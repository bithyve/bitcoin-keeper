package com.hexa_keeper

import java.io.File
import java.io.InputStream
import java.io.RandomAccessFile
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** Platform-neutral parts of the preview store; Android supplies Keystore and AtomicFile. */
internal class KeeperPreviewMobileKeyFiles(private val directory: File) {
    val seedFile = File(directory, "keeper-preview-mobile-key-v1.bin")
    private val lockFile = File(directory, "keeper-preview-mobile-key-v1.lock")

    fun hasAnyRecord() = seedFile.exists() ||
        File(seedFile.path + ".bak").exists() || File(seedFile.path + ".new").exists()

    fun <T> withLock(block: () -> T): T = synchronized(processLock) {
        if (!directory.isDirectory) {
            throw IllegalStateException("No-backup storage unavailable")
        }
        // Hold both locks across record IO and Keystore access, including readback.
        RandomAccessFile(lockFile, "rw").use { file ->
            file.channel.use { channel -> channel.lock().use { block() } }
        }
    }

    private companion object {
        val processLock = Any()
    }
}

internal interface KeeperPreviewMobileKeyRecords {
    fun read(): ByteArray
    fun writeDurably(record: ByteArray)
}

internal interface KeeperPreviewMobileKeyEncryptionKeys {
    fun read(): SecretKey?
    fun containsAlias(): Boolean
    fun create(): SecretKey
}

internal class KeeperPreviewMobileKeyStore(
    private val files: KeeperPreviewMobileKeyFiles,
    private val records: KeeperPreviewMobileKeyRecords,
    private val keys: KeeperPreviewMobileKeyEncryptionKeys,
    private val fillRandom: (ByteArray) -> Unit = { SecureRandom().nextBytes(it) }
) {
    /** Caller owns the returned buffer and must clear it immediately after bridge encoding. */
    fun getSeed(createIfMissing: Boolean): ByteArray = files.withLock {
        val hasAnyRecord = files.hasAnyRecord()
        if (!createIfMissing && !hasAnyRecord) {
            throw IllegalStateException("Mobile Key record is missing")
        }
        val key = encryptionKey(hasAnyRecord)
        if (hasAnyRecord) {
            KeeperPreviewMobileKeyRecord.decrypt(records.read(), key)
        } else {
            val seed = ByteArray(KeeperPreviewMobileKeyRecord.SEED_LENGTH)
            try {
                fillRandom(seed)
                records.writeDurably(KeeperPreviewMobileKeyRecord.encrypt(seed, key))
                // Return only the seed actually read from committed storage.
                val readback = KeeperPreviewMobileKeyRecord.decrypt(records.read(), key)
                if (!MessageDigest.isEqual(seed, readback)) {
                    readback.fill(0)
                    throw IllegalStateException("Mobile Key readback differs")
                }
                readback
            } finally {
                seed.fill(0)
            }
        }
    }

    private fun encryptionKey(recordExists: Boolean): SecretKey {
        val existing = keys.read()
        if (existing != null) {
            // An alias without a record can be a crash before the first durable write.
            if (!recordExists) throw IllegalStateException("Mobile Key record is missing")
            return existing
        }
        if (recordExists || keys.containsAlias()) {
            throw IllegalStateException("Mobile Key encryption key is missing")
        }
        return keys.create()
    }
}

/** Versioned, authenticated record format shared by the Android store and JVM checks. */
internal object KeeperPreviewMobileKeyRecord {
    const val PREVIEW_PACKAGE = "io.hexawallet.keeper.recoverablepreview"
    const val SEED_LENGTH = 32
    private const val IV_LENGTH = 12
    private const val TAG_LENGTH = 16
    private const val RECORD_VERSION: Byte = 1
    private const val RECORD_LENGTH = 1 + IV_LENGTH + SEED_LENGTH + TAG_LENGTH

    /** A corrupted file must not cause readFully to allocate an unbounded buffer. */
    fun readBounded(input: InputStream): ByteArray {
        val record = ByteArray(RECORD_LENGTH)
        var offset = 0
        while (offset < record.size) {
            val count = input.read(record, offset, record.size - offset)
            if (count <= 0) throw IllegalStateException("Invalid Mobile Key record")
            offset += count
        }
        if (input.read() != -1) throw IllegalStateException("Invalid Mobile Key record")
        return record
    }

    fun encrypt(seed: ByteArray, key: SecretKey): ByteArray {
        if (seed.size != SEED_LENGTH) throw IllegalStateException("Invalid Mobile Key seed")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        cipher.updateAAD(PREVIEW_PACKAGE.toByteArray(Charsets.UTF_8))
        val iv = cipher.iv
        if (iv.size != IV_LENGTH) throw IllegalStateException("Invalid Mobile Key nonce")
        return byteArrayOf(RECORD_VERSION) + iv + cipher.doFinal(seed)
    }

    fun decrypt(record: ByteArray, key: SecretKey): ByteArray {
        if (record.size != RECORD_LENGTH ||
            record[0] != RECORD_VERSION
        ) {
            throw IllegalStateException("Invalid Mobile Key record")
        }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(
            Cipher.DECRYPT_MODE,
            key,
            GCMParameterSpec(128, record.copyOfRange(1, 1 + IV_LENGTH))
        )
        cipher.updateAAD(PREVIEW_PACKAGE.toByteArray(Charsets.UTF_8))
        val seed = cipher.doFinal(record.copyOfRange(1 + IV_LENGTH, record.size))
        if (seed.size != SEED_LENGTH) {
            seed.fill(0)
            throw IllegalStateException("Invalid Mobile Key seed")
        }
        return seed
    }
}
