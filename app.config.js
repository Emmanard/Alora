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
      backgroundColor: "#000000",
    },
    scheme: "aora",
    extra: {
      eas: {
        projectId: "ec1ecda5-3a54-436c-a00c-791f416ad9ea"
      }
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