export default {
  expo: {
    name: "Alora",
    slug: "alora",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    scheme: "alora",
    extra: {
      eas: {
        projectId: "152c6f48-c484-45c9-874d-d3615e5418e8", 
      },
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.emmanard9.alora",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.emmanard9.alora",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router", "expo-font", "expo-asset"],
    experiments: {
      bridgeless: false,
    },
  },
};
