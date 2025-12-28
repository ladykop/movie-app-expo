import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { AuthContext } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Status message for Web & Mobile compatibility
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" }); // type: 'error' or 'success'

  // Form States
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Helper to show messages
  const showMessage = (text, type = "error") => {
    setStatusMsg({ text, type });
    // Auto-hide after 5 seconds
    setTimeout(() => setStatusMsg({ text: "", type: "" }), 5000);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) return showMessage("Passwords do not match");
    if (username.trim().length < 3) return showMessage("Username too short");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });
      showMessage("Account created!", "success");
    } catch (error) {
      showMessage(error.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Welcome back!", "success");
    } catch (error) {
      showMessage("Invalid email or password");
    }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { username: username });

      if (password !== "" && currentPassword !== "") {
        if (password !== confirmPassword) throw new Error("New passwords do not match");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, password);
      }

      showMessage("Profile updated!", "success");
      setIsEditing(false);
      setCurrentPassword(""); setPassword(""); setConfirmPassword("");
    } catch (error) {
      showMessage(error.message);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // 1. Delete from Firestore first
      await deleteDoc(doc(db, "users", user.uid));
      // 2. Delete from Auth
      await deleteUser(user);
    } catch (error) {
      showMessage("Please logout and login again to confirm deletion.");
    }
    setLoading(false);
  };

  // --- UI COMPONENTS ---

  const StatusDisplay = () => statusMsg.text ? (
    <View style={[styles.statusBanner, statusMsg.type === "success" ? styles.successBg : styles.errorBg]}>
      <Text style={styles.statusText}>{statusMsg.text}</Text>
    </View>
  ) : null;

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.padding}>
          <StatusDisplay />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Account</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editToggleText}>{isEditing ? "Cancel" : "Edit Profile"}</Text>
            </TouchableOpacity>
          </View>

          {!isEditing ? (
            <View style={styles.profileInfoCard}>
              <View style={styles.infoItem}>
                <MaterialIcons name="person" size={24} color="#e50914" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>{username || "No username"}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="email" size={24} color="#e50914" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.label}>Update Username</Text>
              <TextInput style={styles.input} value={username} onChangeText={setUsername} />
              <View style={styles.divider} />
              <Text style={styles.label}>Change Password</Text>
              <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholderTextColor="#555" />
              <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#555" />
              <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor="#555" />

              {loading ? <ActivityIndicator color="#e50914" /> : (
                <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!isEditing && (
            <>
              <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut(auth)}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{marginTop: 30}} onPress={handleDeleteAccount}>
                <Text style={{color: '#ff4444', textAlign: 'center'}}>Delete My Account Permanently</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <StatusDisplay />
        <Text style={styles.title}>{isRegistering ? "Join Us" : "Welcome Back"}</Text>
        
        {isRegistering && (
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="#555" />
        )}

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholderTextColor="#555" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#555" />

        {isRegistering && (
          <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor="#555" />
        )}

        {loading ? (
          <ActivityIndicator color="#e50914" size="large" />
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={isRegistering ? handleRegister : handleLogin}>
            <Text style={styles.buttonText}>{isRegistering ? "Create Account" : "Sign In"}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{marginTop: 20}}>
          <Text style={styles.toggleText}>
            {isRegistering ? "Already have an account? Login" : "New here? Create an account"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  padding: { padding: 20 },
  authContainer: { flex: 1, justifyContent: "center", padding: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 10 },
  editToggleText: { color: "#e50914", fontWeight: 'bold', fontSize: 16 },
  profileInfoCard: { backgroundColor: "#111", borderRadius: 12, padding: 20, marginBottom: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { color: "#888", fontSize: 12, textTransform: 'uppercase' },
  infoValue: { color: "#fff", fontSize: 18, fontWeight: '500' },
  card: { backgroundColor: "#111", padding: 15, borderRadius: 12, marginBottom: 20 },
  label: { color: "#e50914", fontWeight: "bold", marginBottom: 10 },
  input: { backgroundColor: "#222", color: "#fff", padding: 15, borderRadius: 8, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  primaryBtn: { backgroundColor: "#e50914", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logoutBtn: { backgroundColor: "#333", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  toggleText: { color: "#aaa", textAlign: "center" },
  statusBanner: { padding: 12, borderRadius: 8, marginBottom: 20 },
  errorBg: { backgroundColor: "rgba(255, 68, 68, 0.2)", borderLeftWidth: 4, borderLeftColor: "#ff4444" },
  successBg: { backgroundColor: "rgba(0, 200, 81, 0.2)", borderLeftWidth: 4, borderLeftColor: "#00c851" },
  statusText: { color: "#fff", fontSize: 14, fontWeight: "500" },
});