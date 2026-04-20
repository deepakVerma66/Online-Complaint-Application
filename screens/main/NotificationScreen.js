import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';
import { notifications } from '../../constants/dummy';

const NotificationScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Community Updates"
          subtitle="Latest announcements from your area"
        />

        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              {item.isNew ? <Text style={styles.badge}>New</Text> : null}
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: 20,
    paddingBottom: 32
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    paddingRight: 12
  },
  badge: {
    backgroundColor: '#E8F5EC',
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  message: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 21
  },
  date: {
    marginTop: 14,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default NotificationScreen;
