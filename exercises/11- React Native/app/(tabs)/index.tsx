import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [{x, y, z}, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [{gx, gy, gz}, setGData] = useState({
    gx: 0,
    gy: 0,
    gz: 0,
  });

  useEffect(() => {
    const subscription = Accelerometer.addListener(setData);
    const gSubscription = Gyroscope.addListener(({ x, y, z }) => {
      setGData({ gx: x, gy: y, gz: z });
    });
    return () => {
      subscription.remove();
      gSubscription.remove();
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={{ uri: 'https://www.advancednavigation.com/wp-content/uploads/2024/09/the-history-of-gyroscopes-from-humble-beginnings-to-hyper-technology-banner.jpg' }}
          style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">SENSOR MANAGER</ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText>
          {`Check how well your device's sensors are working.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Accelerometer</ThemedText>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`x: ${x.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(x, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: x >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`y: ${y.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(y, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: y >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`z: ${z.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(z, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: z >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Gyroscope</ThemedText>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`x: ${gx.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(gx, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: gx >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`y: ${gy.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(gy, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: gy >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.valueRow}>
            <ThemedText>{`z: ${gz.toFixed(2)}`}</ThemedText>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={[
                styles.bar,
                {
                  width: 60 + Math.max(Math.min(gz, 1), -1) * 60,
                  backgroundColor: 'yellow',
                  alignSelf: gz >= 0 ? 'flex-start' : 'flex-end',
                },
              ]} />
            </ThemedView>
          </ThemedView>
      </ThemedView>
      

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bar: {
    height: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
