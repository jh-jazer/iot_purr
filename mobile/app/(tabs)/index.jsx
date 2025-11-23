import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
  Pressable,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/home.styles";

const Home = () => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState("");
  const [rfidKey, setRfidKey] = useState("");

  const handleAddPet = useCallback(() => {
    if (!petName.trim() || !rfidKey.trim()) return;
    setPets((prev) => [...prev, { id: Date.now(), name: petName, rfid: rfidKey }]);
    setPetName("");
    setRfidKey("");
    setShowAddPetModal(false);
  }, [petName, rfidKey]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Home</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* PET LIST */}
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <Ionicons name="paw-outline" size={28} color={COLORS.primary} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petRfid}>RFID: {item.rfid}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No pets or devices yet</Text>
            <Text style={styles.emptySubText}>Tap “+” to add one</Text>
          </View>
        }
      />

      {/* ADD OPTIONS MODAL */}
      <Modal
        visible={showAddOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddOptions(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowAddOptions(false)} />
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Add New</Text>

          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setShowAddOptions(false);
              alert("Scanning for nearby devices...");
            }}
          >
            <Ionicons name="hardware-chip-outline" size={20} color={COLORS.white} />
            <Text style={styles.sheetButtonText}>Add Device</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setShowAddOptions(false);
              setShowAddPetModal(true);
            }}
          >
            <Ionicons name="paw-outline" size={20} color={COLORS.white} />
            <Text style={styles.sheetButtonText}>Add Pet</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ADD PET MODAL */}
      <Modal
        visible={showAddPetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddPetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Pet</Text>

            <TextInput
              style={styles.input}
              placeholder="Pet Name"
              placeholderTextColor={COLORS.textSecondary}
              value={petName}
              onChangeText={setPetName}
            />
            <TextInput
              style={styles.input}
              placeholder="RFID Key"
              placeholderTextColor={COLORS.textSecondary}
              value={rfidKey}
              onChangeText={setRfidKey}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddPetModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddPet}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
