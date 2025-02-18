import { StyleSheet, View, AppState, Alert, Platform, Linking } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { Icon } from '@rneui/base'
import { useTheme } from '@react-navigation/native'
import * as Speech from "expo-speech"
import { useFocusEffect } from '@react-navigation/native'
import LanguageDetect from 'languagedetect'
import languages from '../constants/languages.json'

interface AudioPlayerProps {
    text: string;
    iconSize: number;
}

const AudioPlayer = ({ text, iconSize }: AudioPlayerProps) => {
    const { colors } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                Speech.stop(); 
                setIsPlaying(false);
            };
        }, [])
    );

    useEffect(() => {
        const fetchVoices = async () => {
            const voices = await Speech.getAvailableVoicesAsync()
            if (voices) {
                const languageCodes = voices.map(voice => voice.language);
                setAvailableLanguages(languageCodes);
            }
        };
        fetchVoices();

        const appStateListener = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState !== "active") {
                Speech.stop();
                setIsPlaying(false);
            }
        });

        return () => appStateListener.remove();
    }, []);

    const promptUserToInstallLanguage = (languageName: string, languageCode: string) => {
        if (Platform.OS === 'android') {
            Alert.alert(
                "Install Language Pack",
                `Your device does not support the ${languageName.toUpperCase()} language (code: ${languageCode}). Please install it in your text-to-speech settings, or swap to the Google Speech Engine (preferred).`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
            );
        } else {
            Alert.alert(
                "Language Not Available",
                `Your iPhone does not support the "${languageName}" language (code: ${languageCode}). To install more languages, go to:\n\nSettings > Accessibility > Spoken Content > Voices`
            );
        }
    };

    const playAudio = async () => {
        let languageCode = "en-US"; 
        let detectedLanguageName = "English"; 
    
        const lngDetector = new LanguageDetect();
        const detectedLanguages = lngDetector.detect(text, 1);
        if (detectedLanguages.length > 0) {
            const detectedLang = detectedLanguages[0][0]; 
            detectedLanguageName = detectedLang; 
            const detectedLanguageCode = languages[detectedLang] || "en-US";
    
            if (availableLanguages.includes(detectedLanguageCode)) {
                languageCode = detectedLanguageCode;
            } else {
                console.warn(`Language ${detectedLanguageCode} is not available.`);
                promptUserToInstallLanguage(detectedLanguageName, detectedLanguageCode);
                return;
            }
        }
    
        console.log(`Using language: ${languageCode}`);
        setIsPlaying(true);
    
        Speech.speak(text, {
            language: languageCode,
            onDone: () => setIsPlaying(false),
            onStopped: () => setIsPlaying(false),
        });
    };

    const pauseAudio = () => {
        Speech.stop();
        setIsPlaying(false);
    };

    return (
        <View style={styles.iconContainer}>
            {!isPlaying ? (
                <Icon
                    name='volume-2'
                    type='feather'
                    color={colors.primary}
                    size={iconSize}
                    onPress={playAudio}
                />
            ) : (
                <Icon
                    name='stop-circle'
                    type='feather'
                    color={colors.primary}
                    size={iconSize}
                    onPress={pauseAudio}
                />
            )}
        </View>
    );
};

export default AudioPlayer;

const styles = StyleSheet.create({
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});
