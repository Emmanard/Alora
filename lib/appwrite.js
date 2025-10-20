import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  APPWRITE_VIDEO_COLLECTION_ID,
  APPWRITE_STORAGE_ID,
} from "@env";

// Appwrite config
export const appwriteConfig = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  userCollectionId: APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: APPWRITE_VIDEO_COLLECTION_ID,
  storageId: APPWRITE_STORAGE_ID,
};
console.log("✅ ENV Loaded:", APPWRITE_ENDPOINT);
if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
  console.warn("⚠️ Appwrite environment variables are missing!");
}
// Initialize client (Expo: no setPlatform)
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Create user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw new Error("Account creation failed");

    await signIn(email, password);

    let sessionReady = false;
    for (let i = 0; i < 5; i++) {
      try {
        const session = await account.getSession("current");
        if (session) {
          sessionReady = true;
          break;
        }
      } catch {
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    if (!sessionReady) throw new Error("Session not active — please retry");

    const randomSeed = username || Math.random().toString(36).substring(7);
    const randomAvatar = `https://api.dicebear.com/7.x/thumbs/png?seed=${encodeURIComponent(randomSeed)}`;

    const existingUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", newAccount.$id)]
    );

    if (!existingUser.documents.length) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email,
          username,
          avatar: randomAvatar,
        }
      );
    }

    return newAccount;
  } catch (error) {
    console.error("Create user error:", error.message);
    throw error;
  }
}

// Sign in
export async function signIn(email, password) {
  try {
    try {
      const activeSession = await account.getSession("current");
      if (activeSession) return activeSession;
    } catch {}

    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error("Sign in error:", error);
    throw new Error(error.message || "Failed to sign in");
  }
}

// Get account
export async function getAccount() {
  try {
    const session = await account.getSession("current");
    if (!session) return null;
    return await account.get();
  } catch (error) {
    return null;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    return currentUser.documents[0] || null;
  } catch {
    return null;
  }
}

// Sign out
export async function signOut() {
  try {
    try {
      await account.getSession("current");
    } catch {
      return null;
    }

    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    const msg = error.message || "";
    if (
      error.code === 401 ||
      msg.includes("missing scopes") ||
      msg.includes("guests") ||
      msg.includes("Unauthorized")
    ) {
      return null;
    }
    return null;
  }
}

// Upload file
export async function uploadFile(file, type, retries = 2) {
  if (!file) return null;

  const { mimeType, ...rest } = file;
  const asset = {
    type: mimeType || file.type || "application/octet-stream",
    ...rest,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        asset
      );
      return await getFilePreview(uploadedFile.$id, type);
    } catch (error) {
      if (attempt === retries)
        throw new Error(error.message || "Failed to upload file");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Get file preview
export async function getFilePreview(fileId, type) {
  try {
    if (type !== "video" && type !== "image") {
      throw new Error("Invalid file type");
    }
    return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
  } catch (error) {
    throw new Error(error.message || "Failed to get file preview");
  }
}

// Create video post
export async function createVideoPost(form) {
  try {
    const thumbnailUrl = await uploadFile(form.thumbnail, "image");
    const videoUrl = await uploadFile(form.video, "video");

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
    throw new Error(error.message || "Failed to create video post");
  }
}

export async function getAllPosts() {
  try {
    const postsRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );
    const posts = postsRes.documents || [];
    if (!posts.length) return [];

    const creatorIds = [...new Set(posts.map((p) => p.creator).filter(Boolean))];

    const usersMap = {};
    for (const id of creatorIds) {
      try {
        const userRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          [Query.equal("$id", id)]
        );
        if (userRes.documents.length > 0) {
          usersMap[id] = userRes.documents[0];
        }
      } catch {}
    }

    const mergedPosts = posts.map((post) => ({
      ...post,
      creator: usersMap[post.creator] || { username: "Unknown", avatar: "" },
    }));

    return mergedPosts;
  } catch (error) {
    throw new Error(error.message || "Failed to get posts");
  }
}

// Get user posts
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );
    return posts.documents || [];
  } catch (error) {
    throw new Error(error.message || "Failed to get user posts");
  }
}

// Search posts
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );
    return posts.documents || [];
  } catch (error) {
    throw new Error(error.message || "Failed to search posts");
  }
}

export async function getLatestPosts() {
  try {
    const postsRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );
    return postsRes.documents || [];
  } catch (error) {
    throw new Error(error.message || "Failed to get latest posts");
  }
}
