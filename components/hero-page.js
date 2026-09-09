import React, { useState, useCallback,useRef } from "react";
import Camera from "./camera";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
const IP_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

const THEMES = {
  dark: {
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    subtext: "#9CA3AF",
    input: "#2A2A2A",
    border: "#333333",
    accent: "#6366F1",
    error: "#F87171",
    success: "#34D399",
  },
  light: {
    background: "#F5F7FA",
    card: "#FFFFFF",
    text: "#111827",
    subtext: "#6B7280",
    input: "#F3F4F6",
    border: "#E5E7EB",
    accent: "#6366F1",
    error: "#DC2626",
    success: "#059669",
  },
};

const STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
};

export default function HeroPage() {

  const SCREENS = {
  CONNECT: "connect",
  CAMERA: "camera",
};
const wsRef = useRef(null)
const [screen, setScreen] = useState(SCREENS.CONNECT);
  const [darkMode, setDarkMode] = useState(true);
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState("");

  const theme = darkMode ? THEMES.dark : THEMES.light;

  const validate = useCallback(() => {
    if (!ip.trim()) return "Please enter a server IP address.";
    if (!IP_REGEX.test(ip.trim())) return "Enter a valid IPv4 address.";

    const portNum = Number(port);
    if (!port.trim()) return "Please enter a port number.";
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      return "Port Should be 1935";
    }
    return null;
  }, [ip, port]);
const handleConnect = async () => {
  const validationError = validate();

  if (validationError) {
    setStatus(STATUS.ERROR);
    setErrorMessage(validationError);
    return;
  }

  setErrorMessage("");
  setStatus(STATUS.CONNECTING);

  try {
    const response = await fetch(
      `http://${ip}:${port}`
    );

    if (response.status === 404 || response.ok) {
      setStatus(STATUS.CONNECTED);

    
     wsRef.current = new WebSocket(
  `ws://${ip}:3001`
);

wsRef.current.onopen = () => {
  console.log("Satellite connected");

  wsRef.current.send(
    JSON.stringify({
      type: "satellite-register",
      device: "android",
    })
  );

  setStatus(STATUS.CONNECTED);

  setScreen(SCREENS.CAMERA);
};

wsRef.current.onmessage = (event) => {
  console.log(event.data);
};
wsRef.current.onerror = (err) => {
  console.log("WebSocket error", err);

  setStatus(STATUS.ERROR);
  setErrorMessage("Failed to connect to Spect.");
};
wsRef.current.onclose = () => {
  console.log("Socket closed");
};
const heartbeat = setInterval(() => {
  if (
    wsRef.current &&
    wsRef.current.readyState === WebSocket.OPEN
  ) {
    wsRef.current.send(
      JSON.stringify({
        type: "heartbeat",
        time: Date.now(),
      })
    );
  }
}, 5000);
      return;
    }

    throw new Error("Unexpected response");
  } catch (err) {
    setStatus(STATUS.ERROR);
    setErrorMessage(
      "Could not reach Spect Browser."
    );
  }
};
  const isConnecting = status === STATUS.CONNECTING;

  const statusLabel = {
    [STATUS.IDLE]: null,
    [STATUS.CONNECTING]: { text: "Connecting…", color: theme.subtext },
    [STATUS.CONNECTED]: { text: "Connected", color: theme.success },
    [STATUS.ERROR]: { text: errorMessage, color: theme.error },
  }[status];
    if (screen === SCREENS.CAMERA) {
  return (
    <Camera
      serverIp={ip}
      serverPort={port}
      socket = {wsRef.current}
    />
  );
}
  return (
    <SafeAreaProvider>
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
  
      <StatusBar style={darkMode ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.themeButton}
          onPress={() => setDarkMode((prev) => !prev)}
          accessibilityLabel="Toggle theme"
          accessibilityRole="button"
        >
          <Ionicons
            name={darkMode ? "moon" : "sunny"}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Spect Satellite
          </Text>
         <Text style={[styles.subtitle, { color: theme.subtext }]}>
  Connect this device to Spect Browser
</Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]}>
            Server IP Address
          </Text>
          <TextInput
            value={ip}
            onChangeText={setIp}
            placeholder="192.168.1.100"
            placeholderTextColor={theme.subtext}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="decimal-pad"
            editable={!isConnecting}
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          <Text style={[styles.label, { color: theme.text }]}>Port</Text>
          <TextInput
            value={port}
            onChangeText={(text) => setPort(text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            placeholder="8888"
            placeholderTextColor={theme.subtext}
            maxLength={5}
            editable={!isConnecting}
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.accent, opacity: isConnecting ? 0.7 : 1 },
            ]}
            onPress={handleConnect}
            disabled={isConnecting}
            accessibilityRole="button"
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
  {status === STATUS.CONNECTED
    ? "Launching..."
    : "Connect"}
</Text>
            )}
          </TouchableOpacity>

          {statusLabel && (
            <View style={styles.statusRow}>
              <Ionicons
                name={
                  status === STATUS.CONNECTED
                    ? "checkmark-circle"
                    : status === STATUS.ERROR
                    ? "alert-circle"
                    : "time-outline"
                }
                size={16}
                color={statusLabel.color}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.statusText, { color: statusLabel.color }]}>
                {statusLabel.text}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  themeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    marginBottom: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 4,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
});