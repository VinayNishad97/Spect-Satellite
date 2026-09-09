import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
export default function Camera({
  serverIp,
  serverPort,
  socket
}) {
 useEffect(() => {
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.send(
      JSON.stringify({
        type: "camera-started",
      })
    );
  }
}, []);
  const [permission, requestPermission] = useCameraPermissions();
  // 1. Create a state variable to track if the camera should be open
  const [isCameraActive, setIsCameraActive] = useState(false);
console.log(
  `Satellite connected to ${serverIp}:${serverPort}`
);
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const stopCamera = () => {
  setIsCameraActive(false);

  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.send(
      JSON.stringify({
        type: "camera-stopped",
      })
    );
  }
};
  return (
    <View style={styles.container}>
      {/* 2. Conditionally render the camera based on your state */}
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView style={{flex:1}} facing="back" />
          
          {/* 3. A button overlaid on the camera to "Stop" or close it */}
          <View style={styles.buttonContainer}>
            <Button title="Stop Camera" onPress={stopCamera} color="red" />
          </View>
        </View>
      ) : (
        // 4. What the user sees before turning the camera on
        <View style={styles.center}>
          <Text style={{ marginBottom: 20 }}>Camera is currently off.</Text>
          <Button title="Start Camera" onPress={() => setIsCameraActive(true)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  cameraContainer: { flex: 1 },
  buttonContainer: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  center: { alignItems: 'center' }
});
