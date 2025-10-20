module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowUndefined: true, // ✅ prevents startup crash if cache delays loading
          safe: false,
        },
      ],
      // 👇 must be last
      "react-native-reanimated/plugin",
    ],
  };
};
