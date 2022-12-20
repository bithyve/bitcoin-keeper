# enabling node core modules
# adding node core modules support in react-native
rn-nodeify --install buffer,events,process,stream,util,inherits,fs,path,assert,crypto,constants --hack --yarn

# ios dependency installation
cd ios && pod install

# android SDK location configuration
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" >local.properties
