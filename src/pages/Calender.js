import React, { useEffect, useState } from 'react';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, Inject, EventRenderedArgs } from '@syncfusion/ej2-react-schedule';
import { fetchEventsFromFirestore, listenForEventsChanges, addEventToFirestore, updateEventInFirestore, deleteEventFromFirestore } from './Datasource';
import '../pages/Calender.css'; 
import StarryBackground from "../components/StarryBg";

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedEvents = await fetchEventsFromFirestore();
        console.log('Fetched events:', fetchedEvents); // Log fetched events
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const unsubscribe = listenForEventsChanges(updatedEvents => {
      console.log('Updated events:', updatedEvents); // Log updated events
      setEvents(updatedEvents);
    });

    fetchData();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleActionBegin = async (args) => {
    const { requestType, data } = args;
    if (requestType === 'eventCreate') {
      try {
        await addEventToFirestore(data[0]);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    } else if (requestType === 'eventChange') {
      try {
        await updateEventInFirestore(data);
      } catch (error) {
        console.error('Error updating event:', error);
      }
    } else if (requestType === 'eventRemove') {
      try {
        await deleteEventFromFirestore(data[0].Id);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEventRendered = (args) => {
    if (args.name === 'eventRendered') {
      // You can add custom logic here for handling rendered events
      console.log('Rendered event:', args.data);
    }
  };

  return (
    <div className="calendar-starry-background">
      <StarryBackground />
      <div className="schedule-container">
        <ScheduleComponent
          eventSettings={{ dataSource: events }}
          actionBegin={handleActionBegin}
          eventRendered={handleEventRendered}
        >
          <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
        </ScheduleComponent>
      </div>
    </div>
  );
};

export default Calendar;