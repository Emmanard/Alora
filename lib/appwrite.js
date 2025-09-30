import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

// Appwrite config
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "66e07b600011887ac41b",
  databaseId: "66e07dfd00294e69fe5d",
  userCollectionId: "66e07e45002700cd00c4",
  videoCollectionId: "66e07e850008f0287c42",
  storageId: "66e203ee00180ae2e66f",
};

// Initialize client (Expo: no setPlatform)
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Account creation failed");

    // Auto-login right after signup
    await signIn(email, password);

    // Save user to DB
    await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatars.getInitials(username).toString(), // ✅ FIXED
      }
    );

    return newAccount;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
}


// Sign In
export async function signIn(email, password) {
  try {
    // Check for existing session
    try {
      const activeSession = await account.getSession("current");
      if (activeSession) {
        console.log("Active session found");
        return activeSession;
      }
    } catch {
      console.log("No active session, creating new one");
    }

    // Create new session
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error("Sign in error:", error);
    throw new Error(error.message || "Failed to sign in");
  }
}

// ✅ FIXED: Get Account with session check
export async function getAccount() {
  try {
    // Ensure a session exists before calling account.get()
    const session = await account.getSession("current");
    if (!session) {
      console.warn("No active session. Please log in first.");
      return null;
    }

    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.error("Get account error:", error);
    return null;
  }
}

// ✅ FIXED: Get Current User safely
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) {
      console.warn("No account found. User might not be logged in.");
      return null;
    }

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || !currentUser.documents || currentUser.documents.length === 0) {
      console.log("User not found in database");
      return null;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Sign out error:", error);
    throw new Error(error.message || "Failed to sign out");
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return null;

  const { mimeType, ...rest } = file;
  const asset = { 
    type: mimeType || "application/octet-stream", 
    ...rest 
  };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    console.error("Upload file error:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("Failed to generate file URL");

    return fileUrl;
  } catch (error) {
    console.error("Get file preview error:", error);
    throw new Error(error.message || "Failed to get file preview");
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    console.error("Create video post error:", error);
    throw new Error(error.message || "Failed to create video post");
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );

    return posts.documents || [];
  } catch (error) {
    console.error("Get all posts error:", error);
    throw new Error(error.message || "Failed to get posts");
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents || [];
  } catch (error) {
    console.error("Get user posts error:", error);
    throw new Error(error.message || "Failed to get user posts");
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Search failed");

    return posts.documents || [];
  } catch (error) {
    console.error("Search posts error:", error);
    throw new Error(error.message || "Failed to search posts");
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents || [];
  } catch (error) {
    console.error("Get latest posts error:", error);
    throw new Error(error.message || "Failed to get latest posts");
  }
}
