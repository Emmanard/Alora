import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const BookmarkItem = ({ title, date, category }) => (
  <TouchableOpacity className="bg-white/10 p-4 rounded-lg mb-3">
    <View className="flex-row justify-between items-start">
      <View className="flex-1">
        <Text className="text-white text-lg font-medium mb-2">{title}</Text>
        <View className="flex-row items-center space-x-2">
          <Ionicons name="time-outline" size={16} color="#D1D5DB" />
          <Text className="text-gray-300 text-sm">{date}</Text>
        </View>
        <View className="flex-row items-center mt-2">
          <View className="bg-white/20 rounded-full px-3 py-1">
            <Text className="text-gray-300 text-xs">{category}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center space-x-3">
        <TouchableOpacity>
          <Ionicons name="star" size={20} color="#FBBF24" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const Bookmark = () => {
  const bookmarks = [
    {
      id: 1,
      title: "Understanding React Native Navigation",
      date: "2 hours ago",
      category: "Development"
    },
    {
      id: 2,
      title: "Best Practices for Mobile UI Design",
      date: "Yesterday",
      category: "Design"
    },
    {
      id: 3,
      title: "Building Scalable React Native Apps",
      date: "2 days ago",
      category: "Architecture"
    },
    {
      id: 4,
      title: "Advanced TypeScript Patterns",
      date: "3 days ago",
      category: "Development"
    },
    {
      id: 5,
      title: "Mobile App Performance Optimization",
      date: "1 week ago",
      category: "Performance"
    }
  ];

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <View className="flex-row items-center space-x-2 mb-6">
        <Ionicons name="bookmark" size={28} color="white" />
        <Text className="text-2xl text-white font-semibold">Bookmark</Text>
      </View>
      
      <View className="flex-row space-x-2 mb-6">
        <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full">
          <Text className="text-white">All</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-full">
          <Text className="text-gray-300">Development</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-full">
          <Text className="text-gray-300">Design</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
      >
        {bookmarks.map(bookmark => (
          <BookmarkItem
            key={bookmark.id}
            title={bookmark.title}
            date={bookmark.date}
            category={bookmark.category}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmark;