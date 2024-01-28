import React, { useEffect, useState } from "react";
import './Dashboard.css';
import Navbar from "../components/Navbar";
import StarryBackground from "../components/StarryBg";
import Todolist from "../components/Todolist/Todolist";
import { auth, db } from "../Firebase";
import { getDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LoadingScreen } from "../components/LoadingScreens/LoadingScreen";

function Dashboard() {
    const [showTodoList, setShowTodoList] = useState(false);
    const [todos, setTodos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavbarLoaded, setIsNavbarLoaded] = useState(false);

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

    return (
        <div className="db-starry-background">
            <StarryBackground />
            <div className="db-navbar">
                <Navbar />
            </div>
            <div className="db-main-container">

                <div className="calender-container">
                    <div className="calender-top">
                        <img src="./component 1.png" alt="clouds" className="db-calender-clouds" />
                        <div className="calender-title">
                            Calendar

                        </div>
                    </div>
                </div>
                <div className="todolist-container">
                    <div className="todolist-top" onClick={handleTodoListClick}>
                        <img src="./component 1.png" alt="clouds" className="db-todolist-clouds" />
                        <div className="todolist-title">
                            To-Do List
                        </div>
                        {todos.length > 0 && (
                            <span className="addsignup" onClick={handleTodoListClick}>
                                <FontAwesomeIcon icon = {faPlus} />
                            </span>
                        )}
                    </div>
                    <div className="todo-tasks">
                        {todos.length===0 ? (
                                <div className="notodos" onClick={handleTodoListClick}>
                                    <p>Add your todos...</p>
                                    <span className="addsigndown" onClick={handleTodoListClick}>
                                        <FontAwesomeIcon icon = {faPlus} />
                                    </span>
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
