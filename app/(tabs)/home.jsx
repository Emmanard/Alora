import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, Text, View } from "react-native";
import { images } from "../../constants";
import { EmptyState, SearchInput, Trending, VideoCard } from "../../components";
import { usePosts, useLatestPosts } from "../../hooks/useQuery";
import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const { data: posts = [], refetch, isFetching } = usePosts();
  const { data: latestPosts = [] } = useLatestPosts();
  const [creator, setCreator] = useState("");
  const { user } = useGlobalContext();

  useEffect(() => {
    if (posts.length > 0 && posts[0]?.creator?.username) {
      setCreator(posts[0].creator.username);
    } else {
      setCreator(""); // or a fallback like "Guest"
    }
  }, [posts]);

  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator?.username || "GUEST"}
            avatar={item.creator?.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>
              <Trending posts={latestPosts} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
