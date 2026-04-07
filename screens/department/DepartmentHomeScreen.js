import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const summaryCards = [
  { id: '1', label: 'Total Assigned Complaints', value: '124' },
  { id: '2', label: 'Acknowledged', value: '28' },
  { id: '3', label: 'In Progress', value: '41' },
  { id: '4', label: 'Resolved', value: '55' }
];

const DepartmentHomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Official Role</Text>
          <Text style={styles.title}>Department Dashboard</Text>
          <Text style={styles.subtitle}>
            Review assigned complaints and manage resolution
          </Text>
        </View>

        <SectionHeader
          title="Overview"
          subtitle="A quick snapshot of currently assigned complaint volume."
        />

        <View style={styles.summaryGrid}>
          {summaryCards.map((item) => (
            <View key={item.id} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.actionCard}
          onPress={() => navigation.navigate('DepartmentComplaints')}
        >
          <Text style={styles.actionTitle}>Manage Complaints</Text>
          <Text style={styles.actionDescription}>
            Open the department complaint queue and update progress for assigned cases.
          </Text>
        </TouchableOpacity>
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
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5
  },
  kicker: {
    color: '#DDECF7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  title: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10
  },
  subtitle: {
    color: '#EAF4FB',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 18
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  actionDescription: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20
  }
});

export default DepartmentHomeScreen;
