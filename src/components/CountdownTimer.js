import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isLive, setIsLive] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const calculateTimeLeft = () => {
    const targetDate = new Date('2025-10-25T10:00:00');
    const difference = +targetDate - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      const isTimeUp = Object.values(time).every((val) => val === 0);
      setIsLive(isTimeUp);

      fadeAnim.setValue(0.3);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {isLive ? (
        <Text style={[styles.timeText, styles.liveText]}>
          🎉 The Get-Together is LIVE now!
        </Text>
      ) : (
        <>
          <Animated.Text
            style={[
              styles.timeText,
              { opacity: fadeAnim },
              timeLeft.days === 0 ? styles.redText : styles.yellowText,
            ]}
          >
            ⏳ {timeLeft.days ?? '--'}d : {timeLeft.hours ?? '--'}h : {timeLeft.minutes ?? '--'}m : {timeLeft.seconds ?? '--'}s
          </Animated.Text>
          <Text style={styles.subtitle}>Left until the Grand Reunion 🎉</Text>
        </>
      )}
    </View>
  );
};

export default CountdownTimer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 5,
  },
  timeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign:"center"
  },
  yellowText: {
    color: '#FFD700',
    textAlign:"center"
  },
  redText: {
    color: '#FF3B30',
    textAlign:"center"
  },
  subtitle: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    color: '#FFD700',
    textAlign:"center"
  },
  liveText: {
    color: '#34C759',
  },
});
