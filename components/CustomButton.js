import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';

const CustomButton = ({ title, onPress, style, textStyle, icon, outlined }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.button,
        outlined ? styles.outlinedButton : styles.filledButton,
        style
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.text, outlined && styles.outlinedText, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4
  },
  filledButton: {
    backgroundColor: colors.primary
  },
  outlinedButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700'
  },
  outlinedText: {
    color: colors.primary
  }
});

export default CustomButton;
