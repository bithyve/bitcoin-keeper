# Bitcoin Keeper - Your Private Bitcoin Vault

Bitcoin Keeper is a React Native app written in TypeScript. It uses Yarn as a package manager to handle dependencies.

## Prerequisites

Before getting started, make sure you have the following software installed on your machine:

- [Node.js > 12](https://nodejs.org) and npm (Recommended: Use [nvm](https://github.com/nvm-sh/nvm))
- [Watchman](https://facebook.github.io/watchman)
- [Xcode 12](https://developer.apple.com/xcode)
- [Cocoapods 1.10.1](https://cocoapods.org)
- [JDK > 11](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
- [Android Studio and Android SDK](https://developer.android.com/studio)

## Getting Started

1. Clone this repository to your local machine:

   ```shell
   git clone https://github.com/bithyve/bitcoin-keeper.git
    ```

2. Navigate to the project directory:
    ```shell
   cd bitcoin-keeper
    ```
3. Install the project dependencies using Yarn:
    The prepare scripts will automaticall install pods and nodify crypto related packages for react-netive
     ```shell
   yarn install
    ```
    
## Development
To start the development server and run the app on a connected device or emulator, use the following commands:

#### Android
```bash
yarn androidDevelopmentDebug
```
    
#### iOS
```bash
yarn ios --scheme=hexa_keeper_dev
```
These commands will build and launch the app on the respective platforms.


### Whirlpool prerequisites
To use the Whirlpool feature, you'll need to have the following platform-specific binaries and place them in the specified directories:

#### Android

* Copy the libwhirlpool.so file from the release notes' asset section to the following directory:
```bash
android/app/src/main/jniLibs/{arch_dir}/libwhirlpool.so
```
Replace {arch_dir} with the appropriate architecture directory (e.g., arm64-v8a, armeabi-v7a, x86).

#### iOS

* Copy the libwhirlpool.a file from the release notes' asset section to the following directory:
```bash
ios/libwhirlpool.a
```


## Testing
This project uses **Jest** as the testing framework. To run the tests, use the following command:
```bash
yarn test
```
## License
This project is licensed under the **MIT License.**
    

