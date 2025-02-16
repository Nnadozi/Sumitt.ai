import React, { useState } from "react";
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import { Divider } from "@rneui/base";
import Version from "@/constants/Version";
import { useNavigation } from "expo-router";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@react-navigation/native";
import ResponsiveIcon from "@/components/ResponsiveIcon";
import { Dropdown } from "react-native-element-dropdown";

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useSettings();
  const [selectedValue, setSelectedValue] = useState(theme);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleThemeChange = (item: { label: string; value: string }) => {
    setSelectedValue(item.value);
    setTheme(item.value);
  };

  const typeStore = Platform.OS === "android" ? "Google Play Store" : "App Store";
  const storeLink =
    Platform.OS === "android"
      ? "https://play.google.com/store/apps/details?id=com.nnadozi.Sumitt"
      : "https://apps.apple.com/us/app/sumitt-ai-text-summarizer/id6741008785";

  return (
    <Page style={styles.page}>
      <View style = {styles.row}>
        <View>
          <View style={styles.iconRow}>
            <MyText bold fontSize="large">App Theme</MyText>
            <ResponsiveIcon style={{ marginHorizontal: "2%" }} name="sunny" size={20} color={resolvedTheme.colors.text} />
          </View>
          <MyText fontSize="small" opacity={0.5}>Customize your appearance</MyText>
        </View>
        <Dropdown
          style={[styles.dropdown]}
          data={themeOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Theme"
          value={selectedValue}
          onChange={handleThemeChange}
          selectedTextStyle={{color:colors.text}}
          containerStyle={{backgroundColor:colors.card,borderColor:colors.border,borderWidth:1}}
          itemTextStyle={{color:colors.text}}
          itemContainerStyle= {{ backgroundColor: colors.card }}
          renderItem={(item, selected) => (
            <View
              style={{
                backgroundColor: colors.background,padding:"10%"
              }}
            >
              <MyText>{item.label}</MyText>
            </View>
          )}
        />
      </View>
      <Divider width={15} />
      <TouchableOpacity
        activeOpacity={0.25}
        style={styles.row}
        onPress={() => Linking.openURL("https://www.termsfeed.com/live/cd0fe929-9586-4ec3-a520-92eb05b678be")}
      >
        <View>
          <View style={styles.iconRow}>
            <MyText bold fontSize="large">Privacy Policy</MyText>
            <ResponsiveIcon style={{ marginHorizontal: "3%" }} name="privacy-tip" size={19} color={resolvedTheme.colors.text} />
          </View>
          <MyText fontSize="small" opacity={0.5}>Review Sumitt's privacy policy</MyText>
        </View>
        <ResponsiveIcon name="chevron-right" size={30} color={resolvedTheme.colors.text} />
      </TouchableOpacity>
      <Divider width={15} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={() => Linking.openURL(storeLink)}>
        <View>
          <View style={styles.iconRow}>
            <MyText bold fontSize="large">Rate Sumitt</MyText>
            <ResponsiveIcon style={{ marginHorizontal: "3%" }} name="star" size={23} color={resolvedTheme.colors.text} />
          </View>
          <MyText fontSize="small" opacity={0.5}>Review on the {typeStore}</MyText>
        </View>
        <ResponsiveIcon name="chevron-right" size={30} color={resolvedTheme.colors.text} />
      </TouchableOpacity>
      <Divider width={15} />
      <View style={styles.versionRow}>
        <MyText bold fontSize="large">Version</MyText>
        <MyText opacity={0.5}>{Version}</MyText>
      </View>
    </Page>
  );
};

export default Settings;

const styles = StyleSheet.create({
  page: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "5%",
  },
  row: {
    flexDirection: "row",
    gap: "2%",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  iconRow: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  versionRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dropdown: {
    width: "20%"
  },
});
