
import { Reminder } from '../types';

const REMINDERS_KEY = 'hdfc_reminders';

export const getReminders = (): Reminder[] => {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load reminders", e);
    return [];
  }
};

export const saveReminder = (reminder: Reminder) => {
  try {
    const reminders = getReminders();
    // Check if exists, update if so, else add
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.unshift(reminder);
    }
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error("Failed to save reminder", e);
  }
};

export const deleteReminder = (id: string) => {
  try {
    const reminders = getReminders();
    const filtered = reminders.filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete reminder", e);
  }
};