import { Theme, useTheme } from "@react-navigation/native";
import { CalendarPlusIcon } from "phosphor-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LocaleConfig, Calendar as RNCalendar } from "react-native-calendars";
import { NoteLink } from "~/components";
import { createCalendarEvent } from "~/lib/calendar-helper";
import { useNotes } from "~/lib/providers/notes-provider";

LocaleConfig.locales["pt"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt";

export default function CalendarScreen() {
  const theme = useTheme();
  const { notes } = useNotes();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const markedDates = useMemo(() => {
    const marks: any = {};

    notes.forEach((note) => {
      if (note.due.dateOnly) {
        marks[note.due.dateOnly] = {
          marked: true,
          dotColor: theme.colors.primary,
        };
      }
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: theme.colors.primary,
      disableTouchEvent: true,
    };

    return marks;
  }, [notes, selectedDate, theme.colors.primary]);

  const selectedNotes = notes.filter((n) => n.due.dateOnly === selectedDate);

  return (
    <View style={styles(theme).container}>
      <RNCalendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: theme.colors.card,
          calendarBackground: theme.colors.card,
          textSectionTitleColor: theme.colors.text,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: "#ffffffff",
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          textDisabledColor: theme.colors.border,
          monthTextColor: theme.colors.text,
          arrowColor: theme.colors.primary,
        }}
        style={styles(theme).calendar}
      />

      <View style={styles(theme).listContainer}>
        <Text style={styles(theme).headerText}>Tarefas de {selectedDate}</Text>

        <FlatList
          data={selectedNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles(theme).itemRow}>
              <View style={{ flex: 1 }}>
                <NoteLink note={item} />
              </View>
              <TouchableOpacity
                onPress={() => createCalendarEvent(item)}
                style={styles(theme).syncButton}
              >
                <CalendarPlusIcon color={theme.colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text
              style={{
                color: theme.colors.text,
                opacity: 0.5,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Sem tarefas para este dia.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
      gap: 16,
    },
    calendar: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listContainer: {
      flex: 1,
      gap: 8,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    syncButton: {
      padding: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      height: 56,
    },
  });
};
