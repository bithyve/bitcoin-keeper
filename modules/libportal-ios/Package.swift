// swift-tools-version:5.5
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "libportal-ios",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        // Products define the executables and libraries a package produces, and make them visible to other packages.
        .library(
            name: "LibPortal",
            targets: ["portalFFI", "LibPortal"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        // .package(url: /* package url */, from: "1.0.0"),
    ],
    targets: [
        .binaryTarget(name: "portalFFI", path: "./portalFFI.xcframework"),
        .target(
            name: "LibPortal",
            dependencies: ["portalFFI"]
        ),
        // .testTarget(
        //     name: "LibPortalTests",
        //     dependencies: ["LibPortal"]),
    ]
)
