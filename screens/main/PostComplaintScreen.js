import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';

const PostComplaintScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <SectionHeader
            title="Raise a Complaint"
            subtitle="Provide clear details to help faster resolution."
          />

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Share accurate information so the concerned department can understand the issue better.
            </Text>
          </View>

          <CustomInput label="Complaint Title" placeholder="Enter a short title for your complaint" />
          <CustomInput
            label="Complaint Category"
            placeholder="Select complaint category"
            rightText="Dropdown"
          />
          <CustomInput label="Area / Locality" placeholder="Enter the affected area or locality" />
          <CustomInput
            label="Description"
            placeholder="Describe the issue in detail"
            multiline
          />
          <CustomInput
            label="Landmark"
            placeholder="Optional nearby landmark"
            note="Optional field for easy identification."
          />
          <CustomInput
            label="Date"
            placeholder="Auto-generated or selected date"
            editable={false}
          />

          <Text style={styles.uploadLabel}>Attachment</Text>
          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>+</Text>
            <Text style={styles.uploadTitle}>Upload photo or document</Text>
            <Text style={styles.uploadSubtitle}>UI placeholder only. No file upload logic added.</Text>
          </View>

          <CustomButton title="Submit Complaint" onPress={() => {}} style={styles.submitButton} />
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
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    marginBottom: 24
  },
  uploadIcon: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: '400'
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8
  },
  uploadSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19
  },
  submitButton: {
    marginTop: 4
  }
});

export default PostComplaintScreen;
