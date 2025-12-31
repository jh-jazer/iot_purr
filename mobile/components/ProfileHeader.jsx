import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import styles from "../assets/styles/profile.styles";
import COLORS from "../constants/colors";

export default function ProfileHeader({ name, avatar, onEditName, onEditAvatar }) {
  // Default avatar if none selected
  const displayAvatar = avatar
    ? { uri: avatar }
    : require("../assets/images/icon.png"); // Using app icon as fallback

  return (
    <View style={styles.profileHeader}>
      <TouchableOpacity onPress={onEditAvatar} activeOpacity={0.8} style={{ position: 'relative' }}>
        <Image source={displayAvatar} style={styles.profileImage} contentFit="cover" />
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          padding: 4,
          borderWidth: 2,
          borderColor: COLORS.white
        }}>
          <Ionicons name="camera" size={12} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      <View style={styles.profileInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.username}>{name}</Text>
          <TouchableOpacity onPress={onEditName} style={{ marginLeft: 8 }}>
            <Ionicons name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.memberSince}>Owner</Text>
      </View>
    </View>
  );
}