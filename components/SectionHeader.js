import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';

const SectionHeader = ({ title, subtitle, rightText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  leftSection: {
    flex: 1,
    paddingRight: 10
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
    lineHeight: 20
  },
  rightText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default SectionHeader;
