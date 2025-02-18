import { Modal, StyleSheet, View, Alert } from 'react-native';
import React, { useState } from 'react';
import MyText from './MyText';
import MyButton from './MyButton';
import MyInput from './MyInput';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NameModuleProps {
  visible: boolean;
  onPress: (name: string) => void;
  onCancel: () => void;
}

const NameModule = ({ visible, onPress, onCancel }: NameModuleProps) => {
  const [name, setName] = useState('');

  const checkNameExists = async (name: string) => {
    const allKeys = await AsyncStorage.getAllKeys();
    const nameExists = allKeys.includes(name);
    return nameExists;
  };

  const handleSave = async () => {
    const nameExists = await checkNameExists(name);
    if (nameExists) {
      Alert.alert(
        'Name already exists',
        'A summary with this name already exists. Please choose a different name.',
        [{ text: 'OK' }]
      );
    } else {
      onPress(name);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.con, { backgroundColor: useTheme().colors.card }]}>
          <MyText bold>Enter Summary Name</MyText>
          <MyInput
            style={{ marginTop: '3%' }}
            placeholder="Enter name"
            value={name}
            onChangeText={(text) => setName(text)}
            maxLength={30}
            dontShowClear = {true}
          />
          <View style={styles.buttonRow}>
            <MyButton iconName='save' disabled = {!name} width="40%" title="Save" onPress={handleSave} />
            <MyButton iconName='cancel' width="40%" title="Cancel" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NameModule;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  con: {
    backgroundColor: 'white',
    width: '80%',
    padding: '5%',
    borderRadius:15
  },
  buttonRow: {
    flexDirection: 'row',
    gap: '3%',
    marginTop: '5%',
  },
});
