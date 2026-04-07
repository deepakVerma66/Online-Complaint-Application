import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const actions = [
  {
    id: '1',
    title: 'View Complaints',
    description: 'Review ward complaints and forward them to the appropriate department.',
    screen: 'CounselorComplaints'
  },
  {
    id: '2',
    title: 'Make Announcement',
    description: 'Publish ward-level updates and notices for residents in your area.',
    screen: 'CounselorAnnouncement'
  }
];

const CounselorHomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Official Role</Text>
          <Text style={styles.title}>Counselor Dashboard</Text>
          <Text style={styles.subtitle}>
            Review citizen complaints and publish local announcements
          </Text>
        </View>

        <SectionHeader
          title="Dashboard Actions"
          subtitle="Use these demo routes to preview the counselor workflow."
        />

        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{item.id}</Text>
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  iconText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700'
  },
  textWrap: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  cardDescription: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20
  }
});

export default CounselorHomeScreen;
