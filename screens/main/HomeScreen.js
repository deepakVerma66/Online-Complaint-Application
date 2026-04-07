import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const menuCards = [
  {
    id: '1',
    title: 'Post Complaint',
    description: 'Submit a new civic issue with clear details and location.',
    screen: 'PostComplaint'
  },
  {
    id: '2',
    title: 'Complaint Status',
    description: 'Track updates and progress of your submitted complaint.',
    screen: 'ComplaintStatus'
  },
  {
    id: '3',
    title: 'Notifications',
    description: 'View public notices and area announcements from authorities.',
    screen: 'Notifications'
  }
];

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.portalTitle}>Citizen Complaint Portal</Text>
          <Text style={styles.heroHeading}>Hello, User</Text>
          <Text style={styles.heroSubheading}>What would you like to do today?</Text>
        </View>

        <SectionHeader
          title="Quick Access"
          subtitle="Choose an option to continue with your grievance services."
        />

        {menuCards.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>→</Text>
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
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
  portalTitle: {
    color: '#DDECF7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  heroHeading: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12
  },
  heroSubheading: {
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
    elevation: 3
  },
  cardContent: {
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
    fontSize: 20,
    color: colors.primary,
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

export default HomeScreen;
