import React, { useState, useEffect, useRef } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { useCameraPermissions } from 'expo-camera'; 
import { NodePlayer } from 'expo-nodemediaclient';

export default function Camera({ serverIp, serverPort, socket }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const playerRef = useRef(null);

  // Construct the streaming media URL (adjust protocol/path according to your backend setup)
  const streamUrl = `rtmp://${serverIp}:${serverPort}/live/stream`; 

  // Handle start action
  const startCamera = () => {
    setIsCameraActive(true);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "camera-started" }));
    }
  };

  // Handle stop action
  const stopCamera = () => {
    setIsCameraActive(false);
    if (playerRef.current) {
      playerRef.current.stop(); // Explicitly stop playback
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "camera-stopped" }));
    }
  };

  // Automatically start playback when component becomes active, and clean up when toggled off
  useEffect(() => {
    if (isCameraActive && playerRef.current) {
      playerRef.current.start();
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, [isCameraActive]);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permissions are required to use this feature.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <NodePlayer 
            ref={playerRef} 
            inputUrl={streamUrl} // NodePlayer uses inputUrl or url depending on package version
            bufferTime={1000} 
            maxBufferTime={2000}
            scaleMode={"ScaleAspectFit"} 
            autoplay={true}
            style={styles.player} 
          />
          <View style={styles.buttonContainer}>
            <Button title="Stop Camera" onPress={stopCamera} color="red" />
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.text}>Camera is currently off.</Text>
          <Button title="Start Camera" onPress={startCamera} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  cameraContainer: { 
    flex: 1,
    backgroundColor: '#000'
  },
  player: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: { 
    position: 'absolute', 
    bottom: 50, 
    left: 0, 
    right: 0, 
    alignItems: 'center' 
  },
  center: { 
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center'
  }
});
