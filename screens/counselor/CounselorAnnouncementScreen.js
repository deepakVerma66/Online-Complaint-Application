import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const CounselorAnnouncementScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <SectionHeader
            title="Publish Announcement"
            subtitle="Announcements published here will be visible to users in the relevant area."
          />

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Use this form to share local updates, public notices, maintenance alerts, or ward-level reminders.
            </Text>
          </View>

          <CustomInput label="Announcement Title" placeholder="Enter the title of the announcement" />
          <CustomInput
            label="Announcement Category"
            placeholder="Select announcement category"
            rightText="Dropdown"
          />
          <CustomInput label="Area / Ward" placeholder="Enter ward number or locality" />
          <CustomInput label="Short Description" placeholder="Add a short summary" />
          <CustomInput
            label="Detailed Message"
            placeholder="Write the full announcement message"
            multiline
          />
          <CustomInput
            label="Date"
            placeholder="Optional date placeholder"
            editable={false}
          />

          <CustomButton title="Publish Announcement" onPress={() => {}} />
        </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4
  },
  infoBanner: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20
  },
  infoText: {
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 20
  }
});

export default CounselorAnnouncementScreen;
