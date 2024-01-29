import React, { useEffect, useState } from "react";
import './Dashboard.css';
import Navbar from "../components/Navbar";
import StarryBackground from "../components/StarryBg";
import Todolist from "../components/Todolist/Todolist";
import { auth, db } from "../Firebase";
import { getDoc, doc, onSnapshot, updateDoc, deleteDoc, collection, query, where, orderBy, getDocuments } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LoadingScreen } from "../components/LoadingScreens/LoadingScreen";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [showTodoList, setShowTodoList] = useState(false);
    const [todos, setTodos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavbarLoaded, setIsNavbarLoaded] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const navigate = useNavigate(); 

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
                    try{
                        if (doc.exists()) {
                            const data = doc.data();
                            if (data) {
                                setTodos(doc.data().todos || []);
                            } else {
                                setTodos([]);
                            }
                        } else{
                            setTodos([]);
                        }
                    } catch(error){
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

    return (
        <div className="db-starry-background">
            <StarryBackground />
            <div className="db-navbar">
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
                        {upcomingEvents.map(event =>( 
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
                            <FontAwesomeIcon icon = {faPlus} />
                        </span>
                    </div>
                    <div className="todo-tasks">
                        {todos.length===0 ? (
                                <div className="notodos">
                                    <p>Add your todos...</p>
                                </div>
                            ): (

                                todos.map(todo => (
                                    <div key={todo.id} className="tasks-main" onClick={() => handleTaskClick(todo.id)}>
                                        <div className={`checkbox ${todo.completed ? "checked" : ""}`}>
                                            <FontAwesomeIcon icon = {todo.completed ? faCheckSquare : faSquare} />
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

            {showTodoList && (
                <div className="todo-overlap">
                    <div className="todo-popup">
                        <Todolist />
                        {/* <button className="todo-close" onClick={handleCloseTodoList}>Close..</button> */}
                        <div className="todo-close" onClick={handleCloseTodoList}>
                            <FontAwesomeIcon icon={faTimes} size="2xl" alt = "Add"/> 
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard;
