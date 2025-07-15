import React, { useState } from "react";
import { Linking, Platform, StyleSheet, TouchableOpacity, View, Image} from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import { Divider } from "@rneui/base";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@react-navigation/native";
import ResponsiveIcon from "@/components/ResponsiveIcon";
import appConfig from "../../app.json";
import ColorPickerModal from "@/components/ColorPickerModal";

const Settings = () => {  
  const { theme, setTheme, customPrimaryColor, setCustomPrimaryColor } = useSettings();
  const [selectedIndex, setSelectedIndex] = useState(
    theme === "light" ? 0 : theme === "dark" ? 1 : 2
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { colors } = useTheme();

  const handleThemeChange = () => {
    const themes: ('light' | 'dark' | 'system')[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    setSelectedIndex(nextIndex);
  };

  const handleRateApp = () => {
    if (Platform.OS === "android") {
      // Android: Open Play Store with showAllReviews=true
      Linking.openURL("https://play.google.com/store/apps/details?id=com.nnadozi.Sumitt&showAllReviews=true");
    } else {
      // iOS: Open App Store with action=write-review
      Linking.openURL("https://apps.apple.com/app/apple-store/id6741008785?action=write-review");
    }
  };

  const handleColorSelect = (color: string) => {
    setCustomPrimaryColor(color);
  };

  const handleColorReset = () => {
    setCustomPrimaryColor(null);
  };

  return (
    <Page style={styles.page}>
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={handleThemeChange}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="sun" type="feather" size={20} />
          <MyText bold >Appearance</MyText>
        </View>
        <MyText opacity={0.5}>{theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}</MyText>
      </TouchableOpacity>
      <Divider style={{width:"100%",borderColor:colors.border}} width={0.75} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={() => setShowColorPicker(true)}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="color-lens" size={20} />
          <MyText bold >Color</MyText>
        </View>
        <View style={[styles.colorPreview, { backgroundColor: customPrimaryColor || '#6ad478' }]} />
      </TouchableOpacity>
      <Divider style={{width:"100%",borderColor:colors.border}} width={0.75} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={handleRateApp}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="star" size={22} />
          <MyText bold >Rate</MyText>
        </View>
      </TouchableOpacity>
      <Divider style={{width:"100%",borderColor:colors.border}} width={0.75} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={handleRateApp}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="email" size={22} />
          <MyText bold >Feedback</MyText>
        </View>
      </TouchableOpacity>
      <Divider style={{width:"100%",borderColor:colors.border}} width={0.75} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={() =>
        Linking.openURL("https://www.termsfeed.com/live/cd0fe929-9586-4ec3-a520-92eb05b678be")}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="privacy-tip" size={20} />
          <MyText bold >Privacy Policy</MyText>
        </View>
      </TouchableOpacity>
      <Divider style={{width:"100%",borderColor:colors.border}} width={0.75} />
      <View style = {styles.row}>
        <View style = {styles.iconRow}>
          <ResponsiveIcon name="info" size={20} />
          <MyText bold >Version</MyText>
        </View>
        <MyText opacity={0.5}>{appConfig.expo.version}</MyText>
      </View>

      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={handleColorSelect}
        onReset={handleColorReset}
        initialColor={customPrimaryColor || '#6ad478'}
      />
    </Page>
  );
};

export default Settings;

const styles = StyleSheet.create({
  page: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"space-between",
    width:"100%",
  },
  iconRow:{
    justifyContent:"flex-start",
    alignItems:"center",
    flexDirection: "row",
    gap: 10,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
});
