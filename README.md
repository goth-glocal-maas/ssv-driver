# ReactNative Skeleton

Features

- Bottombar navigation
- Authentication (REST Interface)

## Setup

### Prerequisite

- node (nvm/`brew install node`)
- watchman `brew install watchman`
- CocoaPods `sudo gem install cocoapods`

### Running

Install pods

    npx pod-install ios

To run on simulator (either of the following would work)

    npx react-native run-ios
    npm run ios

To run a physical device checkout [here](https://reactnative.dev/docs/running-on-device)

### Troubleshooting

1. Error: `gyp: No Xcode or CLT version detected!`

This pretty much means that xcode path set incorrectly (probably to command line one) You should see `/Applications/Xcode.app/Contents/Developer` as its path.

    sudo xcode-select --reset
    xcode-select -print-path

2. KeepAwake pod issue

Dependencies are required to install manually since we use a bare reactnative.

    https://github.com/unimodules/react-native-unimodules

3. build cache

    watchman watch-del-all  && rm -rf node_modules/ && npm cache clean --force
    npm i && npm start -- --reset-cache