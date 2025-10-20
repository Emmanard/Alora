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
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useUploadFile, useCreateVideoPost } from "../../hooks/useQuery";

const Create = () => {
  const { user } = useGlobalContext();
  const [form, setForm] = useState({ title: "", video: null, thumbnail: null, prompt: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: createVideoPost } = useCreateVideoPost();

  const player = useVideoPlayer(form.video?.uri || "", (player) => (player.loop = true));

  const openPicker = async (type) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert("Permission Required", "Please allow media library access.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        name: asset.fileName || `${type}_${Date.now()}`,
        uri: asset.uri,
        size: asset.fileSize || 0,
        type: asset.mimeType || (type === "image" ? "image/jpeg" : "video/mp4"),
      };
      setForm({ ...form, [type === "image" ? "thumbnail" : "video"]: file });
    }
  };

  const submit = async () => {
    if (!form.prompt || !form.title || !form.thumbnail || !form.video)
      return Alert.alert("Missing Fields", "Please provide all fields");

    try {
      setUploading(true);
      setUploadProgress("Uploading thumbnail...");
      const thumbnailRes = await uploadFile({ file: form.thumbnail, type: "image" });

      setUploadProgress("Uploading video...");
      const videoRes = await uploadFile({ file: form.video, type: "video" });

      setUploadProgress("Creating post...");
      await createVideoPost({
        ...form,
        thumbnail: thumbnailRes.$id,
        video: videoRes.$id,
        userId: user.$id,
      });

      Alert.alert("Success 🎉", "Post uploaded successfully", [
        { text: "OK", onPress: () => router.push("/home") },
      ]);
    } catch (err) {
      Alert.alert("Upload Failed ❌", err.message || "Something went wrong.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      setForm({ title: "", video: null, thumbnail: null, prompt: "" });
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="px-4 my-6">
          <Text className="text-2xl text-white font-psemibold">Upload Video</Text>

          <FormField title="Video Title" value={form.title} placeholder="Enter a catchy title..." handleChangeText={(e) => setForm({ ...form, title: e })} otherStyles="mt-10" />

          {/* Video Picker */}
          <TouchableOpacity onPress={() => openPicker("video")} className="mt-7">
            {form.video ? (
              <VideoView style={{ width: "100%", height: 256 }} player={player} contentFit="cover" />
            ) : (
              <View className="w-full h-40 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                <Image source={icons.upload} className="w-10 h-10 opacity-50" resizeMode="contain" />
              </View>
            )}
          </TouchableOpacity>

          {/* Thumbnail Picker */}
          <TouchableOpacity onPress={() => openPicker("image")} className="mt-7">
            {form.thumbnail ? (
              <Image source={{ uri: form.thumbnail.uri }} className="w-full h-64 rounded-2xl" resizeMode="cover" />
            ) : (
              <View className="w-full h-16 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center flex-row">
                <Image source={icons.upload} className="w-5 h-5 mr-2" resizeMode="contain" />
                <Text className="text-gray-100">Choose thumbnail</Text>
              </View>
            )}
          </TouchableOpacity>

          <FormField title="AI Prompt" value={form.prompt} placeholder="Describe your video..." handleChangeText={(e) => setForm({ ...form, prompt: e })} otherStyles="mt-7" />

          <CustomButton title="Submit & Publish" handlePress={submit} containerStyles="mt-7" isLoading={uploading} />

          {uploading && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color="#FF9C01" />
              <Text className="text-gray-100 text-sm mt-2">{uploadProgress}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Create;
