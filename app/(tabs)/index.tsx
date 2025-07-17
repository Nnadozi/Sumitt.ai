import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import SavedSummary from "@/components/SavedSummary";
import MyInput from "@/components/MyInput";
import React from "react";
import Toast from "react-native-toast-message";
import { useFocusEffect } from 'expo-router';

const Index = () => {
  const [summaries, setSummaries] = useState<Array<{
    userInput: string; id: string; summary: string; timestamp: string, inputType:string
}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSummaries, setFilteredSummaries] = useState(summaries);

  const loadSummaries = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys()
      const filteredKeys = allKeys.filter((key) => key !== "theme" && key !== "summaryOptions" && key !== "customPrimaryColor");
      const summariesData = await Promise.all(
        filteredKeys.map(async (key) => {
          try {
            const summaryData = await AsyncStorage.getItem(key);
            if (summaryData) {
              const parsedData = JSON.parse(summaryData);
              return { id: key, ...parsedData };
            }
            return null;
          } catch (error) {
            console.error(`Error parsing data for key ${key}:`, error);
            return null;
          }
        })
      );

      const validSummaries = summariesData.filter(Boolean);
      setSummaries(validSummaries);
      setFilteredSummaries(validSummaries);

    } catch (error) {
      console.error("Error loading summaries:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSummaries();
    }, [])
  );

  useEffect(() => {
    setFilteredSummaries(
      summaries.filter((summary) =>
        summary.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, summaries]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this summary?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(id);
              setSummaries((prevSummaries) => prevSummaries.filter((summary) => summary.id !== id));
            } catch (error) {
              console.error("Error deleting summary:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <Page style={{ justifyContent: "flex-start" }} applyInsets={false}>
      {summaries.length > 4 && (
        <MyInput
          placeholder="🔎 Search..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          textAlignVertical="center"
          maxLength={30}
          dontShowClear
        />
      )}
      {filteredSummaries.length === 0 ? (
        <View style={styles.emptyState}>
          <MyText textAlign="center" style={{ opacity: 0.5 }}>
            No saved summaries
          </MyText>
          <MyText textAlign="center" style={{ opacity: 0.5 }}>
            Tap "+" to get started
          </MyText>
        </View>
      ) : (
        <ScrollView style={{width:"100%"}} contentContainerStyle={{ marginTop: 7.5, paddingBottom: "10%" }}>
          {filteredSummaries.map((summary) => (
            <SavedSummary
              title={summary.id}
              key={summary.id}
              id={summary.id}
              userInput={summary.userInput}
              inputType = {summary.inputType}
              timeStamp={summary.timestamp}
              summary={summary.summary}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}
    </Page>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Index;
