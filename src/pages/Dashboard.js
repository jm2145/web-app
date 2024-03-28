import React, { useEffect, useState } from "react";
import './Dashboard.css';
import Navbar from "../components/Navbar";
import StarryBackground from "../components/StarryBg";
import Todolist from "../components/Todolist/Todolist";
import Notifications from "../components/Notifications/Notification";
import { auth, db } from "../Firebase";
import { getDoc, doc, onSnapshot, updateDoc, deleteDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare, faPlus, faTimes, faBell } from "@fortawesome/free-solid-svg-icons";
import { LoadingScreen } from "../components/LoadingScreens/LoadingScreen";
import { useNavigate } from "react-router-dom";
import Template from "../components/Template";

function Dashboard() {
    const [showTodoList, setShowTodoList] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [todos, setTodos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavbarLoaded, setIsNavbarLoaded] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const navigate = useNavigate();
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [NotifsEvents, setNotifsEvents] = useState([]);
    const [senderUsernames, setSenderUsernames] = useState([]);

    useEffect(() => {
        const userset = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, "usertodo", user.uid);
                const fetchTodos = async () => {
                    try {
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            setTodos(userDoc.data().todos);
                        } else {
                            setTodos([]);
                        }
                    } catch (error) {
                        console.error("Error fetching todos: ", error);
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchTodos();

                const Realtime = onSnapshot(userDocRef, (doc) => {
                    try {
                        if (doc.exists()) {
                            const data = doc.data();
                            if (data) {
                                setTodos(doc.data().todos || []);
                            } else {
                                setTodos([]);
                            }
                        } else {
                            setTodos([]);
                        }
                    } catch (error) {
                        console.error("Error loading todos: ", error);
                    }
                });

                return () => {
                    Realtime();
                }
            }
        });

        return () => userset();
    }, []);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    console.log("Userid:", user.uid);
                    const useruid = user.uid;
                    const q = query(collection(db, "Chats"));
                    const unsubscribeChats = onSnapshot(q, async (querySnapshot) => {
                        const unreadMessagesData = querySnapshot.docs
                            .filter(doc => doc.id.startsWith(useruid) || doc.id.endsWith(useruid))
                            .map((doc) => {
                                const messages = doc.data().messages;
                                return messages.filter(
                                    (message) =>
                                        message.read === false && message.senderId !== useruid
                                );
                            }).flat();
                        setUnreadMessages(unreadMessagesData);
                        if (unreadMessagesData.length === 0) {
                            console.log("No messages and senders");
                        } else {
                            console.log(
                                "Senders:",
                                unreadMessagesData.map((m) => m.senderId).join(", ")
                            );
                            console.log("Messages:", unreadMessagesData);
                        }

                        const senderUsernamesData = await Promise.all(unreadMessagesData.map(async (message) => {
                            const senderDocRef = doc(db, "Users", message.senderId);
                            const senderDocSnapshot = await getDoc(senderDocRef);
                            if (senderDocSnapshot.exists()) {
                                return senderDocSnapshot.data().username;
                            } else {
                                console.log('User doc not found for senderId: ${message.senderId}');
                                return null;
                            }
                        }));
                        setSenderUsernames(senderUsernamesData)
                        console.log("Sender Usernames:", senderUsernames);
                    });
                    return () => {
                        unsubscribeChats();
                    };
                } else {
                    console.log("User not signed in");
                }
            } catch (error) {
                console.error("Error fetching unread messages:", error);
            }
        });
        return () => {
            unsubscribeAuth();
        };
    }, []);

    useEffect(() => {
        const getNotifsEvents = async () => {
            const currentTime = new Date();
            const twentyFourHours = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
            const eventsRef = collection(db, "events");
            const q = query(
                eventsRef,
                where("StartTime", ">=", currentTime),
                where("StartTime", "<=", twentyFourHours),
                orderBy("StartTime", "asc")
            );

            return onSnapshot(q, (querySnapshot) => {
                const events = querySnapshot.docs.map((doc) => ({
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
                setNotifsEvents(events);
            });
        };

        getNotifsEvents();
    }, []);


    useEffect(() => {
        getUpcomingEvents();
    }, []);

    const getUpcomingEvents = () => {
        const eventsRef = collection(db, "events");
        const q = query(
            eventsRef,
            where("StartTime", ">=", new Date()),
            orderBy("StartTime", "asc")
        );

        return onSnapshot(q, (querySnapshot) => {
            const events = querySnapshot.docs.map((doc) => ({
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
            setUpcomingEvents(events.slice(0, 3));
        });
    };

    // UseEffect to set isNavbarLoaded to true when the Navbar is loaded
    useEffect(() => {
        setIsNavbarLoaded(true);
    }, []);

    const handleTodoListClick = () => {
        setShowTodoList(true);
    }

    const handleCloseTodoList = () => {
        setShowTodoList(false);
    }

    const handleNotificationsClick = () => {
        setShowNotifications(true);
    }

    const handleCloseNotifications = () => {
        setShowNotifications(false);
    }

    const handleTaskClick = async (taskId) => {
        const updatedTodos = todos.map((todo) =>
            todo.id === taskId ? { ...todo, completed: !todo.completed } : todo)

        setTodos(updatedTodos);

        const userDocRef = doc(db, "usertodo", currentUser.uid)
        await updateDoc(userDocRef, { todos: updatedTodos });
        console.log("Successfully updated ");
    }

    if (isLoading || !isNavbarLoaded) {
        return <LoadingScreen />
    }

    const handleCalendarClick = () => {
        navigate('./Calender'); // Redirect to the '/Calender' route
    }

    const notifslen = unreadMessages.length + NotifsEvents.length;
    console.log("Dashboard:", notifslen);


    return (
        <div className="dashboard-container">
            <div className="db-starry-background">
                <StarryBackground />
                <div className="navbar-container">
                    <Navbar />
                </div>
                <div className="db-main-container">
                    <div className="calender-container">
                        <div className="calender-top" onClick={handleCalendarClick}>
                            <img src="./component 1.png" alt="clouds" className="db-calender-clouds" />
                            <div className="calender-title">
                                Calendar
                            </div>
                        </div>
                        <div className="upcoming-events">
                            <h2>Upcoming Events</h2>
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="event-item">
                                    <p>{new Date(event.StartTime).toLocaleDateString()} - {event.Subject}</p>
                                </div>
                            ))}

                        </div>
                    </div>
                    <div className="todolist-container">
                        <div className="todolist-top">
                            <img src="./component 1.png" alt="clouds" className="db-todolist-clouds" />
                            <div className="todolist-title">
                                To-Do List
                            </div>
                            <span className="addsign" onClick={handleTodoListClick}>
                                <FontAwesomeIcon icon={faPlus} />
                            </span>
                        </div>
                        <div className="todo-tasks">
                            {todos.length === 0 ? (
                                <div className="notodos">
                                    <p>Add your todos...</p>
                                </div>
                            ) : (

                                todos.map(todo => (
                                    <div key={todo.id} className="tasks-main" onClick={() => handleTaskClick(todo.id)}>
                                        <div className={`checkbox ${todo.completed ? "checked" : ""}`}>
                                            <FontAwesomeIcon icon={todo.completed ? faCheckSquare : faSquare} />
                                        </div>
                                        <p className={todo.completed ? "completed" : ""}>
                                            {todo.task}
                                        </p>
                                    </div>
                                ))

                            )}
                        </div>
                    </div>
                </div>
                <img src="./image 1.png" alt="moon" className="moon-icon" />

                {notifslen > 0 ? (
                    <FontAwesomeIcon icon={faBell} style={{ color: "#FFD43B", }} beat className="notifs-icon" onClick={handleNotificationsClick} />
                ) : (
                    <FontAwesomeIcon icon={faBell} className="notifs-icon" onClick={handleNotificationsClick} />
                )}

                {showNotifications && (
                    <div className="notifications-overlap">
                        <div className="notification-popup">
                            {notifslen > 0 ? (
                                <Notifications />
                            ) : (
                                <div className="no-notifs">
                                    <h1>No new Notifications...</h1>
                                </div>
                            )}

                            <div className="notifications-close" onClick={handleCloseNotifications}>
                                <FontAwesomeIcon icon={faTimes} size="2xl" alt="Close" />
                            </div>
                        </div>
                    </div>
                )}


                {showTodoList && (
                    <div className="todo-overlap">
                        <div className="todo-popup">
                            <Todolist />
                            {/* <button className="todo-close" onClick={handleCloseTodoList}>Close..</button> */}
                            <div className="todo-close" onClick={handleCloseTodoList}>
                                <FontAwesomeIcon icon={faTimes} size="2xl" alt="Add" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    )
}

export default Dashboard;
