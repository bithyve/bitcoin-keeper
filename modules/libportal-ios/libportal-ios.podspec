Pod::Spec.new do |s|
  s.name         = "libportal-ios"
  s.version      = "0.3.0"
  s.summary      = "iOS bindings for the Portal SDK"
  s.homepage     = "https://github.com/TwentyTwoHW/portal-software"
  s.license      = "GPL-3.0"
  s.authors      = "Alekos Filini"

  # s.platforms    = { :ios => min_ios_version_supported }
  # s.source       = { :git => "https://github.com/afilini/libportal-react-native.git", :tag => "#{s.version}" }

  s.source_files = "Sources/LibPortal/**/*.swift"
  s.vendored_frameworks = 'portalFFI.xcframework'

  s.source       = { :git => "https://github.com/TwentyTwoHW/portal-software", :tag => "#{s.version}" }
end
