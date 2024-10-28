package xyz.twenty_two.react_native

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.json.JSONObject

import xyz.twenty_two.PortalSdk
import xyz.twenty_two.GenerateMnemonicWords
import xyz.twenty_two.SetDescriptorBsmsData

class LibportalReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  var scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
  var instance: PortalSdk? = null

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun constructor(useFastOps: Boolean, promise: Promise) {
    scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    instance = PortalSdk(useFastOps)
    promise.resolve(null)
  }

  @ReactMethod
  fun destructor() {
    scope.cancel()
    instance = null
  }

  @ReactMethod
  fun poll(promise: Promise) {
    scope.launch {
      try {
        val nfcOut = instance!!.poll()
        val map = WritableNativeMap()
        map.putInt("msgIndex", nfcOut.msgIndex.toInt())
        val data = WritableNativeArray()
        nfcOut.data.forEach { data.pushInt(it.toInt()) }
        map.putArray("data", data)

        promise.resolve(map)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun newTag(promise: Promise) {
    scope.launch {
      try {
        instance!!.newTag()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  fun convertByteArray(data: ReadableArray): ByteArray {
    val dataParsed = arrayListOf<Byte>()
    for (i in 0 until data.size()) {
      if (data.getType(i) != ReadableType.Number) {
        throw Throwable("Invalid data type")
      } else {
        dataParsed.add(data.getDouble(i).toInt().toByte())
      }
    }

    return dataParsed.toByteArray()
  }

  @ReactMethod
  fun incomingData(msgIndex: Int, data: ReadableArray, promise: Promise) {
    scope.launch {
      try {
        instance!!.incomingData(msgIndex.toULong(), convertByteArray(data))
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    scope.launch {
      try {
        val status = instance!!.getStatus()

        val map = WritableNativeMap()
        map.putBoolean("initialized", status.initialized)
        // map.putBoolean("unverified", status.unverified)
        map.putBoolean("unlocked", status.unlocked)
        map.putString("network", status.network)

        promise.resolve(map)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun generateMnemonic(numWords: String, network: String, pair_code: String?, promise: Promise) {
    println("numWords" + numWords)
    val numWordsParsed = when (numWords) {
      "Words12" -> GenerateMnemonicWords.WORDS12
      "Words24" -> GenerateMnemonicWords.WORDS24
      else -> throw Throwable("Invalid num words")
    }

    scope.launch {
      try {
        instance!!.generateMnemonic(numWordsParsed, network, pair_code)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun restoreMnemonic(mnemonic: String, network: String, pair_code: String?, promise: Promise) {
    scope.launch {
      try {
        instance!!.restoreMnemonic(mnemonic, network, pair_code)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun unlock(pair_code: String, promise: Promise) {
    scope.launch {
      try {
        instance!!.unlock(pair_code)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun resume(promise: Promise) {
    scope.launch {
      try {
        instance!!.resume()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun displayAddress(index: Int, promise: Promise) {
    scope.launch {
      try {
        promise.resolve(instance!!.displayAddress(index.toUInt()))
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun signPsbt(psbt: String, promise: Promise) {
    scope.launch {
      try {
        promise.resolve(instance!!.signPsbt(psbt))
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun publicDescriptors(promise: Promise) {
    scope.launch {
      try {
        val descriptors = instance!!.publicDescriptors()

        val map = WritableNativeMap()
        map.putString("external", descriptors.external)
        if (descriptors.internal != null) {
          map.putString("internal", descriptors.internal)
        }

        promise.resolve(map)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun updateFirmware(binary: ReadableArray, promise: Promise) {
    scope.launch {
      try {
        instance!!.updateFirmware(convertByteArray(binary))
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun debugWipeDevice(promise: Promise) {
    scope.launch {
      try {
        instance!!.debugWipeDevice()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun getXpub(derivationPath: String, promise: Promise) {
    scope.launch {
      try {
        val result = instance!!.getXpub(derivationPath)

        val map = WritableNativeMap()
        map.putString("xpub", result.xpub)
        val bsms = WritableNativeMap()
        bsms.putString("version", result.bsms.version)
        bsms.putString("token", result.bsms.token)
        bsms.putString("keyName", result.bsms.keyName)
        bsms.putString("signature", result.bsms.signature)
        map.putMap("bsms", bsms)

        promise.resolve(map)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  @ReactMethod
  fun setDescriptor(descriptor: String, bsms: String?, promise: Promise) {
    val bsmsMapped = bsms
      ?.let { s -> JSONObject(s) }
      ?.let { o ->
        SetDescriptorBsmsData(
          o.getString("version"),
          o.getString("pathRestrictions"),
          o.getString("firstAddress")
        )
      }

    scope.launch {
      try {
        instance!!.setDescriptor(descriptor, bsmsMapped)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(e)
      }
    }
  }

  companion object {
    const val NAME = "LibportalReactNative"
  }
}
