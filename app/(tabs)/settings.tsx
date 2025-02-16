import React, { useState } from "react";
import { Linking, Platform, StyleSheet, TouchableOpacity, View, Image} from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import { Divider, Icon, ButtonGroup } from "@rneui/base";
import Version from "@/constants/Version";
import { useNavigation } from "expo-router";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@react-navigation/native";
import ResponsiveIcon from "@/components/ResponsiveIcon";

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useSettings();
  const [selectedIndex, setSelectedIndex] = useState(
    theme === "light" ? 0 : theme === "dark" ? 1 : 2
  );
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleThemeChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTheme = index === 0 ? "light" : index === 1 ? "dark" : "system";
    setTheme(selectedTheme);
  };

  const typeStore = Platform.OS === "android" ? "Google Play Store" : "App Store"
  const storeLink = Platform.OS === "android" ? "https://play.google.com/store/apps/details?id=com.nnadozi.Sumitt" : "https://apps.apple.com/us/app/sumitt-ai-text-summarizer/id6741008785"

  return (
    <Page style={styles.page}>
      <View style = {styles.iconRow}>
        <MyText bold fontSize="large">App Theme</MyText>
        <ResponsiveIcon style={{marginHorizontal:"2%"}} name="sunny" size={20} color={resolvedTheme.colors.text}/>
      </View>
      <MyText fontSize="small" opacity={0.5}>Customize your appearance</MyText>
      <ButtonGroup
        buttons={["Light", "Dark", "System"]}
        selectedIndex={selectedIndex}
        onPress={handleThemeChange}
        selectedButtonStyle={{ backgroundColor: colors.primary }}
        innerBorderStyle={{ color: colors.border }}
        containerStyle={{
          marginVertical: "4%",
          width: "100%",
          marginLeft: "0%",
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={() =>
        Linking.openURL("https://www.termsfeed.com/live/cd0fe929-9586-4ec3-a520-92eb05b678be")}>
        <View>
          <View style = {styles.iconRow}>
            <MyText bold fontSize="large">Privacy Policy</MyText>
            <ResponsiveIcon style={{marginHorizontal:"3%"}} name="privacy-tip" size={19} color={resolvedTheme.colors.text}/>
          </View>
          <MyText fontSize="small" opacity={0.5}>Review Sumitt's privacy policy</MyText>
        </View>
        <ResponsiveIcon name="chevron-right" size={30} color={resolvedTheme.colors.text}/>
      </TouchableOpacity>
      <Divider width={15} />
      <TouchableOpacity activeOpacity={0.25} style={styles.row} onPress={() =>
        Linking.openURL(storeLink)}>
        <View>
          <View style = {styles.iconRow}>
            <MyText bold fontSize="large">Rate Sumitt</MyText>
            <ResponsiveIcon style={{marginHorizontal:"3%"}} name="star" size={23} color={resolvedTheme.colors.text}/>
          </View>
          <MyText fontSize="small" opacity={0.5}>Review on the {typeStore}</MyText>
        </View>
        <ResponsiveIcon name="chevron-right" size={30} color={resolvedTheme.colors.text}/>
      </TouchableOpacity>
      <Divider width={15} />
      <View style = {styles.versionRow}>
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
    justifyContent:"space-between",
    width:"100%",
  },
  iconRow:{
    justifyContent:"flex-start",
    alignItems:"center",
    flexDirection: "row",
  },
  versionRow:{
    flexDirection:"row", 
    width:"100%",
    alignItems:"flex-end",
    justifyContent:"space-between"
  }
});
