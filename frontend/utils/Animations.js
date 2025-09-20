import { Animated, Easing } from 'react-native';

// Fade in animation
export const fadeIn = (animatedValue, duration = 600, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Fade out animation
export const fadeOut = (animatedValue, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Scale in animation
export const scaleIn = (animatedValue, duration = 500, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: true,
  }).start();
};

// Scale out animation
export const scaleOut = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0.8,
    duration,
    delay,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Slide in from bottom
export const slideInBottom = (animatedValue, duration = 500, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Slide in from top
export const slideInTop = (animatedValue, duration = 500, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Slide in from left
export const slideInLeft = (animatedValue, duration = 500, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Slide in from right
export const slideInRight = (animatedValue, duration = 500, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Pulse animation (continuous)
export const pulse = (animatedValue, duration = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  ).start();
};

// Bounce animation
export const bounce = (animatedValue, intensity = 1.2, duration = 800) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 4,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: (duration * 3) / 4,
      easing: Easing.bounce,
      useNativeDriver: true,
    }),
  ]).start();
};

// Shake animation
export const shake = (animatedValue, intensity = 10, duration = 500) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity / 2,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity / 2,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity / 4,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 8,
      useNativeDriver: true,
    }),
  ]).start();
};

// Rotate animation (360 degrees)
export const rotate360 = (animatedValue, duration = 1000) => {
  animatedValue.setValue(0);
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start();
};

// Stagger animation for multiple elements
export const staggerAnimation = (animatedValues, animationType = fadeIn, staggerDelay = 100, animationDuration = 600) => {
  const animations = animatedValues.map((value, index) => {
    return Animated.timing(value, {
      toValue: 1,
      duration: animationDuration,
      delay: index * staggerDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  });

  return Animated.stagger(staggerDelay, animations).start();
};

// Spring animation
export const spring = (animatedValue, toValue = 1, tension = 300, friction = 8) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  }).start();
};

// Parallax animation helper
export const createParallaxTransform = (scrollY, inputRange, outputRange) => {
  return scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

// Slide up modal animation
export const slideUpModal = (animatedValue, duration = 400) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Slide down modal animation
export const slideDownModal = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Combined fade and scale animation
export const fadeScaleIn = (fadeValue, scaleValue, duration = 600, delay = 0) => {
  return Animated.parallel([
    Animated.timing(fadeValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(scaleValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }),
  ]).start();
};

// Progressive blur animation (for backgrounds)
export const progressiveBlur = (animatedValue, maxBlur = 10, duration = 800) => {
  return Animated.timing(animatedValue, {
    toValue: maxBlur,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false, // Blur effects don't support native driver
  }).start();
};