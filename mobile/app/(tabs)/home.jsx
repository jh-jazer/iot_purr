import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";

const Home = () => {
    console.log("Rendering Home Screen");
    const [showEditCatModal, setShowEditCatModal] = useState(false);
    const [cat, setCat] = useState(null);
    const [catName, setCatName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCat();
    }, []);

    const loadCat = async () => {
        try {
            // 1. Try to fetch from API first (Single Source of Truth)
            const response = await fetch(`${API_URL}/cats`);
            let cats = [];
            if (response.ok) {
                try {
                    cats = await response.json();
                } catch (e) {
                    console.log("Error parsing cats JSON", e);
                }
            }

            let currentCat = null;

            if (cats && cats.length > 0) {
                // Use the first cat found
                const serverCat = cats[0];
                currentCat = {
                    id: serverCat._id,
                    name: serverCat.name,
                    weight: serverCat.currentWeight,
                };
            } else {
                // Fallback to local storage
                const savedCat = await AsyncStorage.getItem("myCat");
                if (savedCat) {
                    currentCat = JSON.parse(savedCat);
                } else {
                    // Default
                    currentCat = {
                        name: "My Cat",
                        weight: 0,
                    };
                }
            }

            // 2. Fetch latest visit to get real-time weight
            try {
                const visitsRes = await fetch(`${API_URL}/cats/visits`);
                let visits = [];
                if (visitsRes.ok) {
                    visits = await visitsRes.json();
                }
                if (visits && Array.isArray(visits) && visits.length > 0) {
                    // entryTime -1 sort is default from backend
                    currentCat.weight = visits[0].weightIn;
                }
            } catch (err) {
                console.log("Could not fetch visits for weight update", err);
            }

            setCat(currentCat);
            // Persist
            await AsyncStorage.setItem("myCat", JSON.stringify(currentCat));
        } catch (error) {
            console.error("Failed to load cat", error);
            // Fallback to local
            const savedCat = await AsyncStorage.getItem("myCat");
            if (savedCat) {
                setCat(JSON.parse(savedCat));
            } else {
                // Offline & First run fallback
                const defaultCat = {
                    name: "My Cat",
                    weight: 0,
                };
                setCat(defaultCat);
                // We typically don't persist here in catch block to avoid overwriting valid data if it was just a read error but...
                // If local storage is empty, it's safe to set a default.
                await AsyncStorage.setItem("myCat", JSON.stringify(defaultCat));
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadCat();
    }, []);

    const handleSaveCat = async () => {
        if (!catName.trim()) {
            Alert.alert("Error", "Please enter a name for your cat.");
            return;
        }

        // Prepare payload - Name only
        const payload = {
            name: catName,
            owner: "Me" // Ensure owner stays valid
        };

        try {
            let response;
            if (cat && cat.id) {
                // Update existing
                response = await fetch(`${API_URL}/cats/${cat.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create new
                response = await fetch(`${API_URL}/cats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, breed: "Unknown", gender: "Unknown", currentWeight: 0 })
                });
            }

            const updatedCat = await response.json();

            if (response.ok) {
                const newCatState = {
                    id: updatedCat._id,
                    name: updatedCat.name,
                    weight: updatedCat.currentWeight || cat.weight, // Keep existing weight if backend doesn't return calc immediately
                };
                setCat(newCatState);
                await AsyncStorage.setItem("myCat", JSON.stringify(newCatState));
                setShowEditCatModal(false);
                setCatName("");
                Alert.alert("Success", "Cat profile updated!");
            } else {
                Alert.alert("Error", updatedCat.message || "Failed to save");
            }

        } catch (error) {
            Alert.alert("Error", "Failed to save cat profile.");
        }
    };

    const openEditModal = () => {
        if (cat) {
            setCatName(cat.name);
        } else {
            setCatName("");
        }
        setShowEditCatModal(true);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Home</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {cat ? (
                    <View style={styles.petCard}>
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: COLORS.inputBackground,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: COLORS.border
                        }}>
                            <Ionicons name="paw" size={32} color={COLORS.primary} />
                        </View>

                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{cat.name}</Text>
                            <Text style={styles.petRfid}>
                                {cat.weight ? `Avg Weight: ${cat.weight} kg` : "No weight data yet"}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={openEditModal} style={{ padding: 8 }}>
                            <Ionicons name="pencil-outline" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="paw-outline" size={60} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No cat profile set</Text>
                        <Text style={styles.emptySubtext}>Set up your cat's profile to start monitoring.</Text>

                        <TouchableOpacity
                            style={[styles.sheetButton, { marginTop: 20, width: "auto", paddingHorizontal: 32 }]}
                            onPress={openEditModal}
                        >
                            <Text style={styles.sheetButtonText}>Set Up Profile</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* EDIT/ADD CAT MODAL */}
            <Modal
                visible={showEditCatModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditCatModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {cat ? "Edit Cat Profile" : "Set Cat Profile"}
                        </Text>

                        <Text style={{ marginBottom: 8, color: COLORS.textPrimary, fontWeight: "600" }}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Luna"
                            placeholderTextColor={COLORS.textSecondary}
                            value={catName}
                            onChangeText={setCatName}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowEditCatModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCat}>
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
