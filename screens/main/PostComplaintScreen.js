import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import CategorySelectorModal from "../../components/CategorySelectorModal";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import SectionHeader from "../../components/SectionHeader";
import { buildApiUrl } from "../../constants/api";
import { complaintCategories } from "../../constants/complaintCategories";
import { councillorsData } from "../../constants/councillorsData";
import colors from "../../constants/colors";

const MAX_ATTACHMENTS = 3;
const IMAGE_MEDIA_TYPES = ["images"];

const getAssignedCounselor = (user) => {
  if (!user) {
    return null;
  }

  if (user.ward) {
    return councillorsData.find((item) => item.wardNumber === user.ward) || null;
  }

  const matchingAreas = councillorsData.filter(
    (item) => item.area.trim().toLowerCase() === user.area?.trim().toLowerCase(),
  );

  return matchingAreas.length === 1 ? matchingAreas[0] : null;
};

const getFileMetadata = (uri, index) => {
  const uriParts = uri.split("/");
  const fallbackName = `complaint-image-${Date.now()}-${index + 1}.jpg`;
  const fileName = uriParts[uriParts.length - 1] || fallbackName;
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "jpg";
  const normalizedExtension = extension === "jpg" ? "jpeg" : extension;

  return {
    uri,
    name: fileName,
    type: `image/${normalizedExtension}`,
  };
};

const PostComplaintScreen = ({ route }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const currentUser = route?.params?.user;
  const authToken = route?.params?.authToken;
  const citizenArea = currentUser?.area || "";
  const assignedCounselor = getAssignedCounselor(currentUser);

  const appendImages = (assets) => {
    if (!assets?.length) {
      return;
    }

    setSelectedImages((currentImages) => {
      const remainingSlots = MAX_ATTACHMENTS - currentImages.length;

      if (remainingSlots <= 0) {
        Alert.alert("Limit reached", "You can attach a maximum of 3 images.");
        return currentImages;
      }

      const nextImages = assets
        .slice(0, remainingSlots)
        .map((asset, index) =>
          getFileMetadata(asset.uri, currentImages.length + index),
        );

      if (assets.length > remainingSlots) {
        Alert.alert(
          "Only 3 images allowed",
          "Extra selected images were not added.",
        );
      }

      return [...currentImages, ...nextImages];
    });
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access to take a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        quality: 0.7,
      });

      if (!result.canceled) {
        appendImages(result.assets);
      }
    } catch (error) {
      Alert.alert(
        "Unable to open camera",
        "Please try again. If the issue continues, restart the app once.",
      );
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery permission needed",
          "Please allow gallery access to choose images.",
        );
        return;
      }

      const remainingSlots = MAX_ATTACHMENTS - selectedImages.length;

      if (remainingSlots <= 0) {
        Alert.alert("Limit reached", "You can attach a maximum of 3 images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.7,
      });

      if (!result.canceled) {
        appendImages(result.assets);
      }
    } catch (error) {
      Alert.alert(
        "Unable to open gallery",
        "Please try again. If the issue continues, restart the app once.",
      );
    }
  };

  const handleRemoveImage = (imageUri) => {
    setSelectedImages((currentImages) =>
      currentImages.filter((image) => image.uri !== imageUri),
    );
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setLandmark("");
    setSelectedImages([]);
    setErrorMessage("");
  };

  const handleSubmitComplaint = async () => {
    if (isSubmitting) {
      return;
    }

    if (!authToken) {
      setErrorMessage(
        "Login session not found. Please login again before posting a complaint.",
      );
      return;
    }

    if (!title.trim() || !category || !description.trim()) {
      setErrorMessage(
        "Complaint title, category, and description are required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("landmark", landmark.trim());

      selectedImages.forEach((image) => {
        formData.append("attachments", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
      });

      const response = await fetch(buildApiUrl("/api/complaints"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to submit complaint.");
        return;
      }

      resetForm();
      Alert.alert(
        "Complaint submitted",
        "Your complaint has been posted successfully.",
      );
    } catch (error) {
      setErrorMessage(
        "Unable to submit complaint. Please check the server connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <SectionHeader
            title="Raise a Complaint"
            subtitle="Provide clear details to help faster resolution."
          />

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Share accurate information so the concerned department can
              understand the issue better.
            </Text>
          </View>

          <CustomInput
            label="Complaint Title"
            placeholder="Enter a short title for your complaint"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.fieldLabel}>Complaint Category</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.selectorField}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Text
              style={
                category ? styles.selectorValue : styles.selectorPlaceholder
              }
            >
              {category || "Select complaint category"}
            </Text>
            <Text style={styles.selectorAction}>Select</Text>
          </TouchableOpacity>

          <CustomInput
            label="Area / Locality"
            value={citizenArea}
            placeholder="Area will come from your profile"
            editable={false}
            note="Using your registered area for complaint routing."
          />
          <CustomInput
            label="Assigned Councillor"
            value={
              assignedCounselor
                ? `${assignedCounselor.name} (Ward ${assignedCounselor.wardNumber})`
                : "Will be assigned from your registered area"
            }
            editable={false}
            note="This complaint will automatically go to the councillor responsible for your ward."
          />
          <CustomInput
            label="Description"
            placeholder="Describe the issue in detail"
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <CustomInput
            label="Landmark"
            placeholder="Optional nearby landmark"
            note="Optional field for easy identification."
            value={landmark}
            onChangeText={setLandmark}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Text style={styles.uploadLabel}>Attachments</Text>
          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>+</Text>
            <Text style={styles.uploadTitle}>Add complaint images</Text>
            <Text style={styles.uploadSubtitle}>
              You can take a live photo or choose up to 3 images from your
              gallery.
            </Text>

            <View style={styles.uploadActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryActionButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.secondaryActionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryActionButton}
                onPress={handleChooseFromGallery}
              >
                <Text style={styles.secondaryActionText}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.attachmentLimitText}>
              {selectedImages.length}/{MAX_ATTACHMENTS} images selected
            </Text>

            {selectedImages.length ? (
              <View style={styles.previewGrid}>
                {selectedImages.map((image) => (
                  <View key={image.uri} style={styles.previewCard}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(image.uri)}
                    >
                      <Text style={styles.removeImageButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <CustomButton
            title={isSubmitting ? "Submitting..." : "Submit Complaint"}
            onPress={handleSubmitComplaint}
            style={styles.submitButton}
          />

          {isSubmitting ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}
        </View>

        <CategorySelectorModal
          visible={isCategoryModalVisible}
          categories={complaintCategories}
          selectedValue={category}
          onSelect={(selectedCategory) => {
            setCategory(selectedCategory);
            setIsCategoryModalVisible(false);
          }}
          onClose={() => setIsCategoryModalVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  infoBanner: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  infoText: {
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  selectorField: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorValue: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingRight: 12,
  },
  selectorPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.textLight,
    paddingRight: 12,
  },
  selectorAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  helperText: {
    marginTop: -2,
    marginBottom: 14,
    fontSize: 12,
    color: colors.textLight,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FAFCFE",
    marginBottom: 24,
  },
  uploadIcon: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: "400",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  uploadActionsRow: {
    width: "100%",
    marginTop: 16,
  },
  secondaryActionButton: {
    borderRadius: 14,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryActionText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  attachmentLimitText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textLight,
  },
  previewGrid: {
    width: "100%",
    marginTop: 16,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: 170,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  removeImageButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  removeImageButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 4,
  },
  loader: {
    marginTop: 14,
  },
});

export default PostComplaintScreen;
