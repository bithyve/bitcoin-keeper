# Bitcoin Keeper - Secure today, plan for tomorrow

Affordable and easy-to-use, security for all your sats, BIP-85, Multisig, Own Node, and Hardware Wallet support. Built with React Native

<img width="1396" alt="Screenshot 2024-04-25 at 11 08 39 AM" src="https://github.com/bithyve/bitcoin-keeper/assets/50690016/1e08c786-f376-4e04-8bee-0917718cf870">

[![Playstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/gpbtn.png)](https://play.google.com/store/apps/details?id=io.hexawallet.bitcoinkeeper)
[![Appstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/applebtn.png)](https://apps.apple.com/us/app/bitcoin-keeper/id1545535925)
[![PGP_APK](https://github.com/bithyve/bitcoin-keeper/assets/50690016/67693cf0-a059-4391-8b48-a9d46a55e71c)](https://github.com/bithyve/bitcoin-keeper/releases)

Bitcoin Keeper is an open source, bitcoin-only app designed for seasoned bitcoin hodlers. Built to store bitcoin over a prolonged period of time, Keeper helps you source, clean, and stack sats across different kinds of wallets. Keeper also helps you plan your bitcoin inheritance with built in tools and templates that unlock at the Diamond Hands subscription tier.

## Features
- Create hot wallets or multi-key offline vaults of different m-of-n configurations
- Supports most of the trusted hardware wallets
- Several softkey options including Assisted Keys
- Ready to use Mobile Key when you setup a vault
- Manage UTXOs
- Plan bitcoin inheritance
- In-app chat and Concierge services coming soon


## Prerequisites

Before getting started, make sure you have a proper [React Native development environment](https://reactnative.dev/docs/environment-setup) on your machine

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
   The prepare scripts will automatically install pods and nodify crypto-related packages for react-native
   ```shell
   yarn install
   ```

## Build and Run

### Varients

The project has testnet and mainnet variants. The development variant is configured to use testnet and the production variant to use mainnet.

Start metro metro

```bash
yarn start
```

#### Development

To run the development app on a connected device or emulator:

**Android**

```bash
yarn androidDevelopmentDebug
```

**iOS**

```bash
yarn ios --scheme=hexa_keeper_dev
```

#### Production

To run the production app on a connected device or emulator:

**Android**

```bash
yarn androidProductionDebug
```

**iOS**

```bash
yarn ios --scheme=hexa_keeper
```

These commands will build and launch the app on the respective platforms.

## PGP

```bash
389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62
```

## Verify Authenticity of Android APK

Please download an [APK](https://github.com/bithyve/bitcoin-keeper/releases) and keep all these files in the same directory: `Android APK file, SHA256SUM.asc, KEEPER_DETACHED_SIGN.sign`. Make a copy of `Android APK file` and rename it as `Android APK clone`.

Get the public PGP key for `hexa@bithyve.com` (Hexa Team's PGP key) using

```
gpg --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

or

```
gpg --keyserver hkps://keys.openpgp.org --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

**Verify APK checksum**

Verify the checksum against the APK using:

```
shasum -a 256 --check SHA256SUM.asc
```

Output should contain the name of the APK file followed by **OK** as shown below:

```
Bitcoin_Keeper_v2.0.0.apk: OK
```

**Verify that the signed checksum is from hexa@bithyve.com**

```
gpg --verify SHA256SUM.asc
```

Output should show Hexa's PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

**Alternate method for verifying PGP signature**

Verify the detached signature against the APK file:

```
gpg --verify KEEPER_DETACHED_SIGN.sign Bitcoin_Keeper_Beta_v1.1.8.apk
```

Output should show PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

## Testing

This project uses **Jest** as the testing framework. To run the tests, use the following command:

```bash
yarn test
```

## License

This project is licensed under the **MIT License.**

## Community

- Follow us on [Twitter](https://twitter.com/bitcoinKeeper_)
- Join our [Telegram](https://t.me/bitcoinkeeper)
