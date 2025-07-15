import React from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import MyText from './MyText';
import MyButton from './MyButton';
import { useTheme } from '@react-navigation/native';

interface ColorPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
    initialColor?: string;
    onReset?: () => void;
}

const ColorPickerModal = ({ 
    visible, 
    onClose, 
    onColorSelect, 
    initialColor = '#6ad478',
    onReset 
}: ColorPickerModalProps) => {
    return (
        <Modal visible={visible} animationType='fade' transparent>
            <View style={styles.modalContainer}>
                <View style={[styles.pickerContainer,{backgroundColor:useTheme().colors.card,borderColor:useTheme().colors.border}]}>
                    <View style={styles.pickerWrapper}>
                        <ColorPicker 
                            color={initialColor}
                            onColorChange={onColorSelect}
                            thumbSize={20}
                            sliderSize={20}
                            noSnap={true}
                            row={false}
                            swatches={true}
                            swatchesLast={true}
                            useNativeDriver={true}
                        />
                    </View>
                    <View style={{flexDirection:"row",width:"100%", alignItems:"center", justifyContent:"center", gap:20}}>
                        {onReset && (
                            <MyButton 
                                title="Reset" 
                                onPress={onReset}
                                width="40%"
                            />
                        )}
                        <MyButton 
                            title="Done" 
                            onPress={onClose}
                            width="40%"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    pickerWrapper: {
        width: '100%',
        height: 400,
        marginBottom: 20,
    },  
});

export default ColorPickerModal; 