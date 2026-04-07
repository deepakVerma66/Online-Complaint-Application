import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../constants/colors';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  secureTextEntry,
  keyboardType,
  note,
  editable = true,
  rightText
}) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, multiline && styles.textAreaContainer]}>
        <TextInput
          style={[styles.input, multiline && styles.textArea, !editable && styles.disabledInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  textAreaContainer: {
    minHeight: 132,
    paddingVertical: 14
  },
  input: {
    fontSize: 15,
    color: colors.text
  },
  textArea: {
    minHeight: 100
  },
  disabledInput: {
    color: colors.textLight
  },
  rightText: {
    position: 'absolute',
    right: 16,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '500'
  },
  note: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textLight
  }
});

export default CustomInput;
