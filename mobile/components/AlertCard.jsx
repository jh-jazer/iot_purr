import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

const AlertCard = ({ alert, onDismiss, onMarkRead }) => {
    // Determine color and icon based on severity
    const getSeverityConfig = (severity) => {
        switch (severity) {
            case "critical":
                return {
                    color: "#DC2626",
                    bgColor: "#FEE2E2",
                    icon: "alert-circle",
                };
            case "warning":
                return {
                    color: "#F59E0B",
                    bgColor: "#FEF3C7",
                    icon: "warning",
                };
            case "info":
                return {
                    color: "#3B82F6",
                    bgColor: "#DBEAFE",
                    icon: "information-circle",
                };
            default:
                return {
                    color: COLORS.textSecondary,
                    bgColor: COLORS.inputBackground,
                    icon: "notifications",
                };
        }
    };

    const config = getSeverityConfig(alert.severity);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays}d ago`;
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: config.bgColor,
                    borderLeftColor: config.color,
                    opacity: alert.isRead ? 0.6 : 1,
                },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name={config.icon} size={24} color={config.color} />
                    <View style={styles.headerText}>
                        <Text style={[styles.severity, { color: config.color }]}>
                            {alert.severity.toUpperCase()}
                        </Text>
                        <Text style={styles.timestamp}>{formatDate(alert.createdAt)}</Text>
                    </View>
                </View>
                {!alert.isRead && (
                    <View style={[styles.badge, { backgroundColor: config.color }]} />
                )}
            </View>

            {/* Message */}
            <Text style={styles.message}>{alert.message}</Text>

            {/* Trigger Data (if available) */}
            {alert.triggerData && Object.keys(alert.triggerData).length > 0 && (
                <View style={styles.dataContainer}>
                    {alert.triggerData.baselineWeight && (
                        <Text style={styles.dataText}>
                            Baseline: {alert.triggerData.baselineWeight} kg
                        </Text>
                    )}
                    {alert.triggerData.currentWeight && (
                        <Text style={styles.dataText}>
                            Current: {alert.triggerData.currentWeight} kg
                        </Text>
                    )}
                    {alert.triggerData.changePercent && (
                        <Text style={[styles.dataText, { color: config.color }]}>
                            Change: {alert.triggerData.changePercent}%
                        </Text>
                    )}
                    {alert.triggerData.visitCount && (
                        <Text style={styles.dataText}>
                            Visits: {alert.triggerData.visitCount} in {alert.triggerData.timeframe}
                        </Text>
                    )}
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                {!alert.isRead && onMarkRead && (
                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: config.color }]}
                        onPress={() => onMarkRead(alert._id)}
                    >
                        <Ionicons name="checkmark" size={16} color={config.color} />
                        <Text style={[styles.actionText, { color: config.color }]}>
                            Mark Read
                        </Text>
                    </TouchableOpacity>
                )}
                {onDismiss && (
                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: COLORS.textSecondary }]}
                        onPress={() => onDismiss(alert._id)}
                    >
                        <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                        <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>
                            Dismiss
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerText: {
        marginLeft: 12,
    },
    severity: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    timestamp: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    badge: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    dataContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    dataText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: "600",
    },
});

export default AlertCard;
