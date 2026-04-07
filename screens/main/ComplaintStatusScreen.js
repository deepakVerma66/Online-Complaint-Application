import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import colors from '../../constants/colors';
import { complaintStages } from '../../constants/dummy';

const ComplaintStatusScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Track Your Complaint"
          subtitle="Follow the current progress of your grievance request."
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Complaint ID</Text>
          <Text style={styles.infoValue}>CMP-2026-00124</Text>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>Complaint Title</Text>
          <Text style={styles.infoValue}>Streetlight not working near community hall</Text>

          <Text style={[styles.infoLabel, styles.topSpacing]}>Category</Text>
          <Text style={styles.infoValue}>Electrical / Streetlight</Text>
        </View>

        <View style={styles.trackerCard}>
          {complaintStages.map((item, index) => {
            const isLastItem = index === complaintStages.length - 1;

            return (
              <View key={item.id} style={styles.stageRow}>
                <View style={styles.markerColumn}>
                  <View style={[styles.circle, item.active && styles.activeCircle]}>
                    <Text style={[styles.circleText, item.active && styles.activeCircleText]}>
                      {item.id}
                    </Text>
                  </View>
                  {!isLastItem ? (
                    <View style={[styles.line, item.active && styles.activeLine]} />
                  ) : null}
                </View>

                <View style={styles.stageContent}>
                  <Text style={styles.stageTitle}>{item.title}</Text>
                  <Text style={styles.stageSubtitle}>
                    {item.active
                      ? 'Stage updated and visible to the citizen.'
                      : 'Pending completion from the concerned authority.'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.remarksCard}>
          <Text style={styles.remarksTitle}>Officer Remarks</Text>
          <Text style={styles.remarksText}>
            Inspection completed. Repair team has been assigned and work is expected shortly.
          </Text>
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: 20
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  topSpacing: {
    marginTop: 16
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  },
  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  stageRow: {
    flexDirection: 'row'
  },
  markerColumn: {
    width: 34,
    alignItems: 'center'
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCircle: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight
  },
  activeCircleText: {
    color: colors.surface
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4
  },
  activeLine: {
    backgroundColor: colors.primary
  },
  stageContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 22
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  stageSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
    lineHeight: 19
  },
  remarksCard: {
    backgroundColor: '#EEF6FB',
    borderRadius: 20,
    padding: 18,
    marginTop: 20
  },
  remarksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8
  },
  remarksText: {
    fontSize: 13,
    color: colors.primaryDark,
    lineHeight: 20
  }
});

export default ComplaintStatusScreen;
