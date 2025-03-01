import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from "react-native";
import Page from "@/components/Page";
import MyText from "@/components/MyText";
import SavedSummary from "@/components/SavedSummary";
import MyInput from "@/components/MyInput";
import React from "react";

const Index = () => {
  const [summaries, setSummaries] = useState<Array<{
    userInput: string; id: string; summary: string; timestamp: string, inputType:string
}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSummaries, setFilteredSummaries] = useState(summaries);

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys()
        const filteredKeys = allKeys.filter((key) => key !== "theme" && key !== "summaryOptions");
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

    loadSummaries();
  }, []);

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
    <Page style={{ justifyContent: "flex-start" }}>
      {summaries.length > 0 && (
        <MyInput
          style={{ marginTop: "0%", width: "100%" ,borderRadius:0, borderBottomWidth:1,borderTopWidth:0}}
          placeholder="🔍 Search..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          textAlignVertical="center"
          maxLength={50}
          dontShowClear
        />
      )}
      {filteredSummaries.length === 0 ? (
        <View style={{ position: "absolute", top: "45%" }}>
          <MyText textAlign="center" style={{ opacity: 0.5 }}>
            No saved summaries
          </MyText>
          <MyText textAlign="center" style={{ opacity: 0.5 }}>
            Tap "+" to get started
          </MyText>
        </View>
      ) : (
        <ScrollView style={{width:"100%"}} contentContainerStyle={{ marginTop: "3%", paddingBottom: "15%" }}>
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

const styles = StyleSheet.create({});

export default Index;
