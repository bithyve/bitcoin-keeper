package com.hexa_keeper

import java.io.File
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.file.Files
import java.security.MessageDigest
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec

// This compiles the production core. IO/key adapters here are test fixtures,
// not implementations or tests of Android AtomicFile or Android Keystore.
private val fixtureSeed = ByteArray(32) { it.toByte() }

private fun aesKey(): SecretKey = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()

private fun expectFailure(block: () -> Unit) {
    var failed = false
    try {
        block()
    } catch (_: Exception) {
        failed = true
    }
    check(failed) { "Operation unexpectedly succeeded" }
}

private class FixtureKeys : KeeperPreviewMobileKeyEncryptionKeys {
    var key: SecretKey? = null
    var aliasPresent = false
    var reads = 0
    var creations = 0
    var readError = false

    override fun read(): SecretKey? {
        reads++
        if (readError) throw IllegalStateException("Injected Keystore error")
        return key
    }

    override fun containsAlias() = aliasPresent

    override fun create(): SecretKey {
        check(!aliasPresent)
        creations++
        return aesKey().also { key = it; aliasPresent = true }
    }
}

private class FixtureRecords(private val files: KeeperPreviewMobileKeyFiles) : KeeperPreviewMobileKeyRecords {
    var writes = 0
    var readError = false
    var writeError = false
    var readOverride: (() -> ByteArray)? = null

    override fun read(): ByteArray {
        if (readError) throw IllegalStateException("Injected storage error")
        return readOverride?.invoke() ?: files.seedFile.readBytes()
    }

    override fun writeDurably(record: ByteArray) {
        writes++
        if (writeError) {
            File(files.seedFile.path + ".new").writeBytes(record.copyOf(9))
            throw IllegalStateException("Injected interrupted write")
        }
        files.seedFile.writeBytes(record)
    }
}

private class Fixture : AutoCloseable {
    val directory = Files.createTempDirectory("keeper-preview-mobile-key-check-").toFile()
    val files = KeeperPreviewMobileKeyFiles(directory)
    val keys = FixtureKeys()
    val records = FixtureRecords(files)
    var randomCalls = 0
    var generatedBuffer: ByteArray? = null
    var randomError = false
    val store = KeeperPreviewMobileKeyStore(files, records, keys) { buffer ->
        randomCalls++
        generatedBuffer = buffer
        fixtureSeed.copyInto(buffer)
        if (randomError) throw IllegalStateException("Injected random failure")
    }

    fun assertNoCreation() {
        check(keys.creations == 0 && records.writes == 0 && randomCalls == 0)
    }

    fun assertGeneratedCleared() {
        check(generatedBuffer?.all { it == 0.toByte() } == true)
    }

    override fun close() { check(directory.deleteRecursively()) }
}

private fun digest(bytes: ByteArray) = MessageDigest.getInstance("SHA-256")
    .digest(bytes).joinToString("") { "%02x".format(it) }

// Cross-process fixtures store a software key in a temporary directory solely
// for this harness; the app still uses the Android Keystore implementation.
private fun processStore(directory: File): KeeperPreviewMobileKeyStore {
    val files = KeeperPreviewMobileKeyFiles(directory)
    val keyFile = File(directory, "harness-software-key.bin")
    val keys = object : KeeperPreviewMobileKeyEncryptionKeys {
        override fun read(): SecretKey? = if (keyFile.exists()) {
            SecretKeySpec(keyFile.readBytes(), "AES")
        } else null

        override fun containsAlias() = keyFile.exists()

        override fun create(): SecretKey = aesKey().also {
            keyFile.writeBytes(it.encoded)
            File(directory, "harness-key-creations.bin").appendBytes(byteArrayOf(1))
        }
    }
    return KeeperPreviewMobileKeyStore(files, object : KeeperPreviewMobileKeyRecords {
        override fun read() = files.seedFile.readBytes()
        override fun writeDurably(record: ByteArray) { files.seedFile.writeBytes(record) }
    }, keys)
}

fun main(args: Array<String>) {
    if (args.firstOrNull() == "lock-child") {
        val seed = processStore(File(args[1])).getSeed(createIfMissing = true)
        try { println(digest(seed)) } finally { seed.fill(0) }
        return
    }

    var passed = 0
    fun test(name: String, block: () -> Unit) {
        block()
        passed++
        println("PASS $name")
    }

    test("actual AES-GCM codec round trip and randomized nonce") {
        val key = aesKey()
        val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, key)
        check(record.size == 61 && record[0] == 1.toByte())
        check(KeeperPreviewMobileKeyRecord.decrypt(record, key).contentEquals(fixtureSeed))
        check(!record.contentEquals(KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, key)))
    }

    test("every record byte mutation fails authentication or version validation") {
        val key = aesKey()
        val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, key)
        for (index in record.indices) {
            val mutated = record.copyOf()
            mutated[index] = (mutated[index].toInt() xor 1).toByte()
            expectFailure { KeeperPreviewMobileKeyRecord.decrypt(mutated, key) }
        }
    }

    test("wrong encryption key and wrong app authenticated data are rejected") {
        val key = aesKey()
        val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, key)
        expectFailure { KeeperPreviewMobileKeyRecord.decrypt(record, aesKey()) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        cipher.updateAAD("io.hexawallet.bitcoinkeeper".toByteArray())
        val wrongAppRecord = byteArrayOf(1) + cipher.iv + cipher.doFinal(fixtureSeed)
        expectFailure { KeeperPreviewMobileKeyRecord.decrypt(wrongAppRecord, key) }
    }

    test("record and seed length boundaries fail closed") {
        val key = aesKey()
        val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, key)
        for (size in listOf(0, 1, 12, 29, 60, 62, 128)) {
            expectFailure { KeeperPreviewMobileKeyRecord.decrypt(record.copyOf(size), key) }
        }
        for (size in listOf(0, 16, 31, 33, 64)) {
            expectFailure { KeeperPreviewMobileKeyRecord.encrypt(ByteArray(size), key) }
        }
    }

    test("actual native file reader rejects short/oversized records with bounded reads") {
        val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, aesKey())
        check(KeeperPreviewMobileKeyRecord.readBounded(ByteArrayInputStream(record))
            .contentEquals(record))
        expectFailure {
            KeeperPreviewMobileKeyRecord.readBounded(ByteArrayInputStream(record.copyOf(60)))
        }
        var consumed = 0
        val endlessCorruption = object : InputStream() {
            override fun read(): Int { consumed++; return 1 }
        }
        expectFailure { KeeperPreviewMobileKeyRecord.readBounded(endlessCorruption) }
        check(consumed == 62) { "Corruption caused an unbounded file read" }
    }

    test("creation returns durable readback and later reads keep the same identity") {
        Fixture().use { f ->
            val seed = f.store.getSeed(createIfMissing = true)
            check(seed.contentEquals(fixtureSeed))
            check(f.store.getSeed(createIfMissing = false).contentEquals(seed))
            check(f.store.getSeed(createIfMissing = true).contentEquals(seed))
            check(f.keys.creations == 1 && f.records.writes == 1 && f.randomCalls == 1)
            check(f.files.seedFile.readBytes().size == 61)
            f.assertGeneratedCleared()
            seed.fill(0)
        }
    }

    test("read-existing on empty store touches neither keys nor random generation") {
        Fixture().use { f ->
            expectFailure { f.store.getSeed(createIfMissing = false) }
            f.assertNoCreation()
            check(f.keys.reads == 0 && !f.files.hasAnyRecord())
        }
    }

    test("alias without any record never creates a replacement seed") {
        Fixture().use { f ->
            f.keys.key = aesKey()
            f.keys.aliasPresent = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
        }
    }

    test("unreadable alias never creates a replacement encryption key") {
        Fixture().use { f ->
            f.keys.aliasPresent = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
        }
    }

    test("existing seed record without encryption alias is preserved") {
        Fixture().use { f ->
            val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, aesKey())
            f.files.seedFile.writeBytes(record)
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
            check(f.files.seedFile.readBytes().contentEquals(record))
        }
    }

    test("lone .new and .bak files are existing-store tombstones") {
        for (suffix in listOf(".new", ".bak")) {
            Fixture().use { f ->
                val tombstone = File(f.files.seedFile.path + suffix)
                tombstone.writeBytes(byteArrayOf(7, 8, 9))
                check(f.files.hasAnyRecord())
                expectFailure { f.store.getSeed(createIfMissing = true) }
                f.assertNoCreation()
                f.keys.key = aesKey()
                f.keys.aliasPresent = true
                expectFailure { f.store.getSeed(createIfMissing = true) }
                f.assertNoCreation()
                check(tombstone.readBytes().contentEquals(byteArrayOf(7, 8, 9)))
            }
        }
    }

    test("adapter-restored backup is read without creating a new seed") {
        Fixture().use { f ->
            f.keys.key = aesKey()
            f.keys.aliasPresent = true
            val backup = File(f.files.seedFile.path + ".bak")
            backup.writeBytes(KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, f.keys.key!!))
            f.records.readOverride = { backup.readBytes() }
            check(f.store.getSeed(createIfMissing = true).contentEquals(fixtureSeed))
            f.assertNoCreation()
        }
    }

    test("corrupt stored record is rejected and never rewritten") {
        Fixture().use { f ->
            f.keys.key = aesKey()
            f.keys.aliasPresent = true
            val record = KeeperPreviewMobileKeyRecord.encrypt(fixtureSeed, f.keys.key!!)
            record[30] = (record[30].toInt() xor 1).toByte()
            f.files.seedFile.writeBytes(record)
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
            check(f.files.seedFile.readBytes().contentEquals(record))
        }
    }

    test("random source failure clears generated seed and exposes nothing") {
        Fixture().use { f ->
            f.randomError = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertGeneratedCleared()
            check(f.records.writes == 0)
            expectFailure { f.store.getSeed(createIfMissing = true) }
            check(f.randomCalls == 1)
        }
    }

    test("interrupted write clears generated seed and retry cannot replace it") {
        Fixture().use { f ->
            f.records.writeError = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertGeneratedCleared()
            check(f.files.hasAnyRecord())
            expectFailure { f.store.getSeed(createIfMissing = true) }
            check(f.randomCalls == 1 && f.records.writes == 1 && f.keys.creations == 1)
        }
    }

    test("authenticated but different readback rejects the generated seed") {
        Fixture().use { f ->
            f.records.readOverride = {
                KeeperPreviewMobileKeyRecord.encrypt(ByteArray(32) { 42 }, f.keys.key!!)
            }
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertGeneratedCleared()
            check(f.records.writes == 1)
        }
    }

    test("durable readback IO failure rejects and clears generated seed") {
        Fixture().use { f ->
            f.records.readError = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertGeneratedCleared()
            check(f.files.hasAnyRecord())
            expectFailure { f.store.getSeed(createIfMissing = true) }
            check(f.randomCalls == 1 && f.records.writes == 1)
        }
    }

    test("Keystore access error fails before generation or writes") {
        Fixture().use { f ->
            f.keys.readError = true
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
        }
    }

    test("missing storage directory fails before key access") {
        Fixture().use { f ->
            check(f.directory.delete())
            expectFailure { f.store.getSeed(createIfMissing = true) }
            f.assertNoCreation()
            check(f.keys.reads == 0)
            check(f.directory.mkdir())
        }
    }

    test("production monitor and file lock serialize concurrent thread creation") {
        Fixture().use { f ->
            val pool = Executors.newFixedThreadPool(12)
            val start = CountDownLatch(1)
            try {
                val tasks = (1..24).map {
                    pool.submit(Callable {
                        start.await()
                        val seed = f.store.getSeed(createIfMissing = true)
                        try { digest(seed) } finally { seed.fill(0) }
                    })
                }
                start.countDown()
                val identities = tasks.map { it.get(20, TimeUnit.SECONDS) }
                check(identities.toSet().size == 1)
                check(f.randomCalls == 1 && f.records.writes == 1 && f.keys.creations == 1)
            } finally { pool.shutdownNow() }
        }
    }

    test("production file lock serializes independent JVM processes") {
        Fixture().use { f ->
            val javaPath = File(System.getProperty("java.home"), "bin/java").path
            val classpath = System.getProperty("java.class.path")
            val processes = (1..8).map {
                ProcessBuilder(javaPath, "-cp", classpath,
                    "com.hexa_keeper.KeeperPreviewMobileKeyStoreTestKt", "lock-child", f.directory.path)
                    .redirectErrorStream(true).start()
            }
            try {
                val identities = processes.map { process ->
                    check(process.waitFor(20, TimeUnit.SECONDS)) { "Child timed out" }
                    check(process.exitValue() == 0) { "Child failed" }
                    process.inputStream.bufferedReader().readText().trim().also {
                        check(it.matches(Regex("[a-f0-9]{64}")))
                    }
                }
                check(identities.toSet().size == 1)
                check(File(f.directory, "harness-key-creations.bin").readBytes().size == 1)
                check(f.files.seedFile.readBytes().size == 61)
            } finally { processes.forEach { it.destroyForcibly() } }
        }
    }

    println("$passed JVM native-core checks passed; Android/iOS platform services were not exercised.")
}
