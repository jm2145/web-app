import { db } from '../Firebase';
import { setDoc, doc, getDocs, onSnapshot, updateDoc, deleteDoc, collection } from 'firebase/firestore';

// Fetch events from Firestore
export const fetchEventsFromFirestore = async () => {
  const eventsCollection = await getDocs(collection(db, 'events'));
  const events = eventsCollection.docs.map(doc => ({
    Id: doc.id,
    Subject: doc.data().Subject,
    StartTime: new Date(doc.data().StartTime.seconds * 1000),
    EndTime: new Date(doc.data().EndTime.seconds * 1000),
    IsAllDay: doc.data().IsAllDay,
    Description: doc.data().Description,
    Location: doc.data().Location,
    RecurrenceRule: doc.data().RecurrenceRule,
    RecurrenceID: doc.data().RecurrenceID,
    RecurrenceException: doc.data().RecurrenceException,
  }));
  return events;
};

// Listen for real-time updates from Firestore
export const listenForEventsChanges = (callback) => {
  return onSnapshot(collection(db, 'events'), snapshot => {
    const events = snapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
};

// Add new event to Firestore
export const addEventToFirestore = async (event) => {
  try {
    await setDoc(doc(collection(db, 'events')), event);
  } catch (error) {
    console.error('Error adding event: ', error);
  }
};

// Update existing event in Firestore
export const updateEventInFirestore = async (event) => {
  try {
    await updateDoc(doc(db, 'events', event.Id), event);
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};

// Delete event from Firestore
export const deleteEventFromFirestore = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Error deleting event: ', error);
  }
};