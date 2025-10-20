export default {
  expo: {
    name: "Aora",
    slug: "aora",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor:  "#000000",
    },
    scheme: "aora",
    extra: {
      eas: {
        projectId: "152c6f48-c484-45c9-874d-d3615e5418e8", 
      },
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.emmanard9.aora",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.emmanard9.aora",
    },
    web: {
      favicon: "./assets/images/logo-small.png",
    },
    plugins: ["expo-router", "expo-font", "expo-asset"],
    experiments: {
      bridgeless: false,
    },
  },
};
