import { useState } from "react";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { icons } from "../../constants";
import { createVideoPost } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  const player = useVideoPlayer(form.video?.uri || "", (player) => {
    player.loop = true;
  });

  const openPicker = async (selectType) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert(
        "Permission Required",
        "You need to grant media library permissions to upload content."
      );
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          selectType === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: selectType === "image" ? [16, 9] : undefined,
        quality: selectType === "video" ? 0.5 : 1,
        videoMaxDuration: selectType === "video" ? 60 : undefined,
        videoQuality:
          selectType === "video"
            ? ImagePicker.UIImagePickerControllerQualityType.Medium
            : undefined,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const fileExt =
          selectType === "video"
            ? "mp4"
            : asset.fileName?.split(".").pop().toLowerCase() || "jpg";
        const formattedAsset = {
          name: asset.fileName || `${selectType}_${Date.now()}.${fileExt}`,
          uri: asset.uri,
          size: asset.fileSize || 0,
          type:
            asset.mimeType ||
            (selectType === "image" ? "image/jpeg" : "video/mp4"),
          mimeType:
            asset.mimeType ||
            (selectType === "image" ? "image/jpeg" : "video/mp4"),
        };
        setForm({
          ...form,
          [selectType === "image" ? "thumbnail" : "video"]: formattedAsset,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media. Please try again.");
      console.error(error);
    }
  };

  const submit = async () => {
    if (!form.prompt || !form.title || !form.thumbnail || !form.video) {
      return Alert.alert("Missing Fields", "Please provide all fields");
    }
    setUploading(true);
    setUploadProgress("Uploading thumbnail...");
    try {
      await createVideoPost({
        ...form,
        userId: user.$id,
      });
      Alert.alert("Success! 🎉", "Post uploaded successfully", [
        { text: "OK", onPress: () => router.push("/home") },
      ]);
    } catch (error) {
      setUploading(false);
      setUploadProgress("");
      const isTimeoutError =
        error.message.includes("Gateway time-out") ||
        error.message.includes("504") ||
        error.message.includes("timeout");
      Alert.alert(
        isTimeoutError ? "Upload Timeout ⏱️" : "Upload Failed ❌",
        isTimeoutError
          ? "The upload is taking longer than expected. This might be due to slow network or large file size.\n\nWould you like to try again?"
          : error.message || "Something went wrong. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => submit() },
        ]
      );
      return;
    } finally {
      setForm({ title: "", video: null, thumbnail: null, prompt: "" });
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="px-4 my-6" keyboardShouldPersistTaps="handled">
          <Text className="text-2xl text-white font-psemibold">
            Upload Video
          </Text>
          <FormField
            title="Video Title"
            value={form.title}
            placeholder="Give your video a catchy title..."
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles="mt-10"
          />
          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium">
              Upload Video
            </Text>
            <TouchableOpacity onPress={() => openPicker("video")}>
              {form.video ? (
                <VideoView
                  style={{ width: "100%", height: 256 }}
                  player={player}
                  allowsFullscreen
                  allowsPictureInPicture
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                  <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                    <Image
                      source={icons.upload}
                      resizeMode="contain"
                      alt="upload"
                      className="w-1/2 h-1/2"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium">
              Thumbnail Image
            </Text>
            <TouchableOpacity onPress={() => openPicker("image")}>
              {form.thumbnail ? (
                <Image
                  source={{ uri: form.thumbnail.uri }}
                  resizeMode="cover"
                  className="w-full h-64 rounded-2xl"
                />
              ) : (
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    alt="upload"
                    className="w-5 h-5"
                  />
                  <Text className="text-sm text-gray-100 font-pmedium">
                    Choose a file
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <FormField
            title="AI Prompt"
            value={form.prompt}
            placeholder="The AI prompt of your video...."
            handleChangeText={(e) => setForm({ ...form, prompt: e })}
            otherStyles="mt-7"
          />
          <CustomButton
            title="Submit & Publish"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={uploading}
          />
          {uploading && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color="#FF9C01" />
              <Text className="text-gray-100 text-sm mt-2">
                {uploadProgress}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Please wait, this may take a moment...
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Create;