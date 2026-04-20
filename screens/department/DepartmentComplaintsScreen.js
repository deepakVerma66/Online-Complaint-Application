import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SectionHeader from '../../components/SectionHeader';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { buildApiUrl, buildUploadUrl } from '../../constants/api';
import colors from '../../constants/colors';

const statusOptions = [
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' }
];

const MAX_RESOLUTION_ATTACHMENTS = 3;
const IMAGE_MEDIA_TYPES = ['images'];

const statusLabels = {
  forwarded_to_department: 'Forwarded to Department',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  completed: 'Resolved'
};

const formatStatusLabel = (status) => statusLabels[status] || 'Forwarded to Department';

const formatComplaintId = (complaintId) => {
  if (!complaintId) {
    return 'Not available';
  }

  return `CMP-${complaintId.slice(-6).toUpperCase()}`;
};

const formatCreatedDate = (dateValue) => {
  if (!dateValue) {
    return 'Not available';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getFileMetadata = (asset, index) => {
  const fallbackName = `department-resolution-${Date.now()}-${index + 1}.jpg`;
  const fileName = asset.fileName || asset.uri.split('/').pop() || fallbackName;
  const extension = fileName.includes('.')
    ? fileName.split('.').pop().toLowerCase()
    : 'jpg';
  const normalizedExtension = extension === 'jpg' ? 'jpeg' : extension;

  return {
    uri: asset.uri,
    name: fileName,
    type: asset.mimeType || `image/${normalizedExtension}`
  };
};

const DepartmentComplaintsScreen = ({ route }) => {
  const authToken = route?.params?.authToken;
  const [complaints, setComplaints] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [resolutionRemarks, setResolutionRemarks] = useState({});
  const [resolutionAttachments, setResolutionAttachments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingComplaintId, setUpdatingComplaintId] = useState('');

  const fetchComplaints = useCallback(async () => {
    if (!authToken) {
      setComplaints([]);
      setErrorMessage('Login session not found. Please login again to view department complaints.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(buildApiUrl('/api/complaints/department/my'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setComplaints([]);
        setErrorMessage(data.message || 'Failed to fetch department complaints.');
        return;
      }

      const complaintList = data.complaints || [];

      setComplaints(complaintList);
      setSelectedStatuses((current) => {
        const nextState = { ...current };

        complaintList.forEach((item) => {
          if (!nextState[item._id]) {
            nextState[item._id] = item.status === 'forwarded_to_department'
              ? 'acknowledged'
              : item.status === 'completed'
                ? 'resolved'
                : item.status;
          }
        });

        return nextState;
      });
      setResolutionRemarks((current) => {
        const nextState = { ...current };

        complaintList.forEach((item) => {
          if ((item.status === 'resolved' || item.status === 'completed') && !nextState[item._id]) {
            nextState[item._id] = item.departmentRemarks || '';
          }
        });

        return nextState;
      });
    } catch (error) {
      setComplaints([]);
      setErrorMessage('Unable to load department complaints. Please check the server connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const updateSelectedStatus = (complaintId, status) => {
    setSelectedStatuses((current) => ({
      ...current,
      [complaintId]: status
    }));

    if (status !== 'resolved') {
      setResolutionRemarks((current) => ({
        ...current,
        [complaintId]: ''
      }));
      setResolutionAttachments((current) => ({
        ...current,
        [complaintId]: []
      }));
    }
  };

  const appendResolutionImages = (complaintId, assets) => {
    if (!assets?.length) {
      return;
    }

    setResolutionAttachments((current) => {
      const currentImages = current[complaintId] || [];
      const remainingSlots = MAX_RESOLUTION_ATTACHMENTS - currentImages.length;

      if (remainingSlots <= 0) {
        Alert.alert('Limit reached', 'You can attach a maximum of 3 resolution images.');
        return current;
      }

      const nextImages = assets
        .slice(0, remainingSlots)
        .map((asset, index) => getFileMetadata(asset, currentImages.length + index));

      if (assets.length > remainingSlots) {
        Alert.alert('Only 3 images allowed', 'Extra selected images were not added.');
      }

      return {
        ...current,
        [complaintId]: [...currentImages, ...nextImages]
      };
    });
  };

  const handleTakeResolutionPhoto = async (complaintId) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access to take resolution photos.'
        );
        return;
      }

      const existingImages = resolutionAttachments[complaintId] || [];

      if (existingImages.length >= MAX_RESOLUTION_ATTACHMENTS) {
        Alert.alert('Limit reached', 'You can attach a maximum of 3 resolution images.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        quality: 0.7
      });

      if (!result.canceled) {
        appendResolutionImages(complaintId, result.assets);
      }
    } catch (error) {
      Alert.alert('Unable to open camera', 'Please try again.');
    }
  };

  const handleChooseResolutionImages = async (complaintId) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Gallery permission needed',
          'Please allow gallery access to choose resolution images.'
        );
        return;
      }

      const existingImages = resolutionAttachments[complaintId] || [];
      const remainingSlots = MAX_RESOLUTION_ATTACHMENTS - existingImages.length;

      if (remainingSlots <= 0) {
        Alert.alert('Limit reached', 'You can attach a maximum of 3 resolution images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.7
      });

      if (!result.canceled) {
        appendResolutionImages(complaintId, result.assets);
      }
    } catch (error) {
      Alert.alert('Unable to open gallery', 'Please try again.');
    }
  };

  const removeResolutionImage = (complaintId, imageUri) => {
    setResolutionAttachments((current) => ({
      ...current,
      [complaintId]: (current[complaintId] || []).filter((image) => image.uri !== imageUri)
    }));
  };

  const handleUpdateStatus = async (complaintId) => {
    if (!authToken || updatingComplaintId) {
      return;
    }

    const nextStatus = selectedStatuses[complaintId];

    if (!nextStatus) {
      Alert.alert('Status required', 'Please select a status before updating.');
      return;
    }

    if (nextStatus === 'resolved' && !(resolutionRemarks[complaintId] || '').trim()) {
      Alert.alert('Remarks required', 'Please enter officer remarks before resolving the complaint.');
      return;
    }

    try {
      setUpdatingComplaintId(complaintId);

      const formData = new FormData();
      formData.append('status', nextStatus);

      if (nextStatus === 'resolved') {
        formData.append('departmentRemarks', (resolutionRemarks[complaintId] || '').trim());

        (resolutionAttachments[complaintId] || []).forEach((image) => {
          formData.append('resolutionAttachments', {
            uri: image.uri,
            name: image.name,
            type: image.type
          });
        });
      }

      const response = await fetch(buildApiUrl(`/api/complaints/${complaintId}/department/status`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Update failed', data.message || 'Unable to update complaint status.');
        return;
      }

      setComplaints((current) =>
        current.map((item) =>
          item._id === complaintId
            ? {
                ...item,
                ...data.complaint
              }
            : item
        )
      );

      setSelectedStatuses((current) => ({
        ...current,
        [complaintId]: data.complaint?.status || nextStatus
      }));

      if (data.complaint?.status === 'resolved') {
        setResolutionRemarks((current) => ({
          ...current,
          [complaintId]: data.complaint?.departmentRemarks || ''
        }));
        setResolutionAttachments((current) => ({
          ...current,
          [complaintId]: []
        }));
      } else {
        setResolutionRemarks((current) => ({
          ...current,
          [complaintId]: ''
        }));
        setResolutionAttachments((current) => ({
          ...current,
          [complaintId]: []
        }));
      }

      Alert.alert('Status updated', 'The complaint status has been updated successfully.');
    } catch (error) {
      Alert.alert('Update failed', 'Unable to update complaint status right now. Please try again.');
    } finally {
      setUpdatingComplaintId('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Assigned Complaints"
          subtitle="Review complaints forwarded by councillors and update their department status."
        />

        {isLoading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.infoText}>Loading department complaints...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={styles.centerCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && !complaints.length ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No department complaints found</Text>
            <Text style={styles.infoText}>
              Complaints forwarded by councillors will appear here automatically.
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && complaints.length
          ? complaints.map((item) => {
              const selectedStatus = selectedStatuses[item._id] || (item.status === 'forwarded_to_department' ? 'acknowledged' : item.status);
              const isResolvedSelection = selectedStatus === 'resolved';
              const isUpdating = updatingComplaintId === item._id;

              return (
                <View key={item._id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.complaintId}>{formatComplaintId(item._id)}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{formatStatusLabel(item.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.metaText}>Category: {item.category}</Text>
                  <Text style={styles.metaText}>Assigned Ward: {item.wardNumber ? `Ward ${item.wardNumber}` : 'Not available'}</Text>
                  <Text style={styles.metaText}>Area: {item.area || 'Not available'}</Text>
                  <Text style={styles.metaText}>Citizen: {item.citizen?.name || 'Not available'}</Text>
                  <Text style={styles.metaText}>Councillor: {item.assignedToCounselor?.name || 'Not available'}</Text>
                  <Text style={styles.metaText}>Submitted Date: {formatCreatedDate(item.createdAt)}</Text>

                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>Complaint Description</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                  </View>

                  {item.attachments?.length ? (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionLabel}>Complaint Images</Text>
                      <View style={styles.imageGrid}>
                        {item.attachments.map((attachment, index) => (
                          <Image
                            key={`${item._id}-complaint-image-${index + 1}`}
                            source={{ uri: buildUploadUrl(attachment) }}
                            style={styles.attachmentImage}
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <Text style={styles.sectionLabel}>Update Status</Text>
                  <View style={styles.chipRow}>
                    {statusOptions.map((status) => {
                      const active = selectedStatus === status.value;

                      return (
                        <TouchableOpacity
                          key={status.value}
                          style={[styles.chip, active && styles.activeChip]}
                          onPress={() => updateSelectedStatus(item._id, status.value)}
                        >
                          <Text style={[styles.chipText, active && styles.activeChipText]}>
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {isResolvedSelection ? (
                    <View style={styles.remarksBox}>
                      <CustomInput
                        label="Officer Remarks / Action Taken"
                        placeholder="Add remarks for the councillor and citizen"
                        value={resolutionRemarks[item._id] || ''}
                        onChangeText={(text) =>
                          setResolutionRemarks((current) => ({
                            ...current,
                            [item._id]: text
                          }))
                        }
                        multiline
                      />

                      <Text style={styles.sectionLabel}>Resolution Images</Text>
                      <View style={styles.uploadActionsRow}>
                        <TouchableOpacity
                          activeOpacity={0.88}
                          style={styles.uploadButton}
                          onPress={() => handleTakeResolutionPhoto(item._id)}
                        >
                          <Text style={styles.uploadButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.88}
                          style={styles.uploadButton}
                          onPress={() => handleChooseResolutionImages(item._id)}
                        >
                          <Text style={styles.uploadButtonText}>Choose Images</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.uploadHelperText}>
                        {(resolutionAttachments[item._id] || []).length}/{MAX_RESOLUTION_ATTACHMENTS} images selected
                      </Text>

                      {(resolutionAttachments[item._id] || []).length ? (
                        <View style={styles.imageGrid}>
                          {(resolutionAttachments[item._id] || []).map((image, index) => (
                            <View key={`${item._id}-preview-${index + 1}`} style={styles.previewCard}>
                              <Image source={{ uri: image.uri }} style={styles.attachmentImage} />
                              <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={() => removeResolutionImage(item._id, image.uri)}
                              >
                                <Text style={styles.removeImageText}>Remove</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {(item.status === 'resolved' || item.status === 'completed') && item.departmentRemarks ? (
                    <View style={styles.remarksBox}>
                      <Text style={styles.sectionLabel}>Latest Officer Remarks</Text>
                      <Text style={styles.descriptionText}>{item.departmentRemarks}</Text>
                    </View>
                  ) : null}

                  {(item.status === 'resolved' || item.status === 'completed') && item.departmentResolutionAttachments?.length ? (
                    <View style={styles.remarksBox}>
                      <Text style={styles.sectionLabel}>Latest Resolution Images</Text>
                      <View style={styles.imageGrid}>
                        {item.departmentResolutionAttachments.map((attachment, index) => (
                          <Image
                            key={`${item._id}-resolved-image-${index + 1}`}
                            source={{ uri: buildUploadUrl(attachment) }}
                            style={styles.attachmentImage}
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}

                  <CustomButton
                    title={isUpdating ? 'Updating...' : 'Update Status'}
                    onPress={() => handleUpdateStatus(item._id)}
                    style={styles.updateButton}
                  />
                </View>
              );
            })
          : null}
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
  centerCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    alignItems: 'center'
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    lineHeight: 20,
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  complaintId: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700'
  },
  statusBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6
  },
  sectionBlock: {
    marginTop: 14,
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    padding: 14
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600'
  },
  activeChipText: {
    color: colors.surface
  },
  remarksBox: {
    marginTop: 12,
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    padding: 14
  },
  uploadButton: {
    borderRadius: 14,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  uploadActionsRow: {
    gap: 10
  },
  uploadButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700'
  },
  uploadHelperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10
  },
  attachmentImage: {
    width: '48%',
    height: 150,
    borderRadius: 14,
    backgroundColor: colors.accent,
    marginBottom: 10
  },
  previewCard: {
    width: '48%'
  },
  removeImageText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10
  },
  updateButton: {
    marginTop: 12
  }
});

export default DepartmentComplaintsScreen;
