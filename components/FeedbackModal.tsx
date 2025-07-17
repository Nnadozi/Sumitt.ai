import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MyText from './MyText';
import MyButton from './MyButton';
import ResponsiveIcon from './ResponsiveIcon';
import { useTheme } from '@react-navigation/native';
import MyInput from './MyInput';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // Update if needed
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Replace with your actual anon key

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          feedback: message.trim(),
          platform: Platform.OS,
          appVersion: Constants.expoConfig?.version || '1.0.0',
          userAgent: Platform.OS === 'ios' ? 'iOS' : 'Android'
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Thank you for your feedback!', [
          { text: 'OK', onPress: onClose }
        ]);
        setMessage('');
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <MyText bold fontSize="large">Send Feedback</MyText>
          <MyText fontSize="small" gray>Tell us what you think of Sumitt</MyText>
          <MyInput  
            placeholder="Type here..."
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            dontShowClear
            height="20%"
            style={{marginTop:15}}
            maxLength={2000}
            showLength
          />
            <MyButton
              iconName='send'
              title={isSubmitting ? 'Sending...' : 'Send Feedback'}
              onPress={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              style={{marginBottom:10}}
            />
            <MyButton
              iconName='close'
              title='Cancel'
              onPress={handleClose}
              disabled={isSubmitting}
            />
          {isSubmitting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <MyText>Sending feedback...</MyText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8, 
  },  
});

export default FeedbackModal; 