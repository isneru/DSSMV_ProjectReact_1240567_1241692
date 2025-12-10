import * as Calendar from "expo-calendar";
import { Alert, Platform } from "react-native";
import type { Note } from "~/lib/types";

export async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

export async function createCalendarEvent(note: Note) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso ao calendário para guardar a nota."
      );
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    let calendarId = null;
    if (Platform.OS === "ios") {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      calendarId = defaultCalendar.id;
    } else {
      const primaryCalendar = calendars.find(
        (cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
      );
      calendarId = primaryCalendar?.id;
    }

    if (!calendarId) {
      calendarId = calendars[0]?.id;
    }

    if (!calendarId) {
      Alert.alert("Error", "Calendar not found");
      return;
    }

    const dueDate = new Date(note.due.dateTime || note.due.dateOnly);

    if (isNaN(dueDate.getTime())) {
      Alert.alert("Error", "Date isnt valid");
      return;
    }

    const endDate = new Date(dueDate);
    endDate.setHours(dueDate.getHours() + 1);

    await Calendar.createEventAsync(calendarId, {
      title: note.title,
      notes: note.content,
      startDate: dueDate,
      endDate: endDate,
      timeZone: "GMT",
      alarms: [{ relativeOffset: -15 }],
    });

    Alert.alert("Sucess", "Note added");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Error adding note.");
  }
}
