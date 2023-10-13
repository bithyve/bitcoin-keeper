import React from 'react'
import { StyleSheet, Animated } from 'react-native'
import { Box } from 'native-base'

const BounceLoader = () => {
    let opacity = new Animated.Value(0);

    Animated.loop(
        Animated.spring(opacity, {
            toValue: 2,
            friction: 4,
            tension: 25,
            useNativeDriver: true
        })
    ).start();

    const bounce = opacity.interpolate({
        inputRange: [1, 2, 3],
        outputRange: [1, 6, 2]
    })
    const bounce1 = opacity.interpolate({
        inputRange: [1, 3, 4],
        outputRange: [2, 7, 3]
    })
    const bounce2 = opacity.interpolate({
        inputRange: [1, 4, 5],
        outputRange: [2, 8, 4]
    })
    const bounce3 = opacity.interpolate({
        inputRange: [1, 5, 6],
        outputRange: [2, 9, 5]
    })
    return (
        <Box style={styles.container}>
            <Animated.View style={[styles.ball, { transform: [{ translateY: bounce }] }]} />
            <Animated.View style={[styles.ball, { transform: [{ translateY: bounce1 }] }]} />
            <Animated.View style={[styles.ball, { transform: [{ translateY: bounce2 }] }]} />
            <Animated.View style={[styles.ball, { transform: [{ translateY: bounce3 }] }]} />
        </Box>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    },
    ball: {
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: '#6B9B92',
        marginHorizontal: 3
    },
})
export default BounceLoader