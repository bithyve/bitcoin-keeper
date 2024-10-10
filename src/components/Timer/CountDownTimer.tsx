import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Text from '../KeeperText';
import Colors from 'src/theme/Colors';

const CountdownTimer = ({ initialTime, onTimerEnd = null }) => {
  const { colorMode } = useColorMode();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const center = 100;
  const intervalRef = useRef(null);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + initialTime * 1000;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remainingTime = Math.max((endTime - now) / 1000, 0);
      setTimeLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(intervalRef.current);
        if (onTimerEnd) {
          onTimerEnd();
        }
      }
    }, 10);

    return () => clearInterval(intervalRef.current);
  }, [initialTime, onTimerEnd]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const strokeDashoffset = (timeLeft / initialTime) * circumference;

  const angle = timeLeft > 0 ? ((initialTime - timeLeft) / initialTime) * 2 * Math.PI : 0;
  const smallCircleX = center + radius * Math.cos(angle - Math.PI / 2);
  const smallCircleY = center + radius * Math.sin(angle - Math.PI / 2);

  return (
    <Box style={styles.timerContainer}>
      <Box style={styles.svgContainer}>
        <Svg width={200} height={200}>
          <Circle
            stroke={Colors.LightCrimson}
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth="3"
          />
          <Circle
            stroke={Colors.MediumGrey}
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
          <Circle cx={smallCircleX} cy={smallCircleY} r={6} fill={Colors.CoralRed} />
        </Svg>
        <Box style={styles.textView}>
          <Text semiBold color={`${colorMode}.alertRed`} style={styles.timerText}>
            {timeLeft > 0 ? formatTime(timeLeft) : 'Time-Out'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  svgContainer: {
    position: 'relative',
    width: 200,
    height: 200,
  },
  textView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 25,
    lineHeight: 30,
  },
});

export default CountdownTimer;
