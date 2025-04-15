// This might be removed when this issue is fixed: https://github.com/Sifir-io/react-native-tor/issues/57

import compressing from 'compressing';
import fs from 'fs';

const torPath = './node_modules/react-native-tor/android/libs/sifir_android.aar';

if (!fs.existsSync(torPath)) {
  console.log('react-native-tor not found, skipping patch.');
  process.exit(0);
}

console.log('Removing unsupported arm64 JNI from sifir_android');

(async () => {
  await compressing.zip.uncompress(
    torPath,
    './node_modules/react-native-tor/android/libs/sifir_android'
  );

  fs.rmSync('./node_modules/react-native-tor/android/libs/sifir_android/jni/arm64', {
    force: true,
    recursive: true,
  });

  fs.rmSync(torPath);

  await compressing.zip.compressDir(
    './node_modules/react-native-tor/android/libs/sifir_android',
    torPath,
    { ignoreBase: true }
  );

  fs.rmSync('./node_modules/react-native-tor/android/libs/sifir_android', {
    force: true,
    recursive: true,
  });
})();
