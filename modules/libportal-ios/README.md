# libportal-swift

This project builds a Swift package that provides [Swift] language bindings for the
`libportal` library.

Supported target platforms are:

- iOS, iPhones (aarch64)  
- iOS simulator, X86_64 and M1 (aarch64)  

## How to Use

To use the Swift language bindings for `libportal` in your [Xcode] iOS project add
the GitHub repository xxxxxx and select one of the
release versions. You may then import and use the `LibPortal` library in your Swift
code. For example:

```swift
import LibPortal

...

```

The `./build-local-swift.sh` script can be used instead to create a version of the project for local testing.

### How to test

```shell
swift test
```

[Swift]: https://developer.apple.com/swift/
[Xcode]: https://developer.apple.com/documentation/Xcode
