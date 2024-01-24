import React, {useEffect, useState} from "react";
import './Dashboard.css';
import Navbar from "../components/Navbar";
import StarryBackground from "../components/StarryBg";
import Todolist from "../components/Todolist/Todolist";
import {auth, db}  from "../Firebase";
import { getDoc ,doc, onSnapshot, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";


function Dashboard() {

    const [showTodoList, setShowTodoList] = useState(false);
    const [todos, setTodos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userset = auth.onAuthStateChanged(user => {
            if (user){
                setCurrentUser(user);
                const userDocRef = doc(db, "usertodo", user.uid);
                const fetchTodos = async () => {
                    try {
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()){
                            setTodos(userDoc.data().todos);
                        } else{
                            setTodos([]);
                        }
                    } catch (error) {
                        console.error("Error fetching todos: ", error);
                    }
                };

                fetchTodos();

                const Realtime = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists){
                        setTodos(doc.data().todos);
                    }
                });

                return () => {
                    Realtime();
                }
            }
        });

        return () => userset();
    }, []);

    const handleTodoListClick = () => {
        setShowTodoList(true);
    }

    const handleCloseTodoList = () => {
        setShowTodoList(false);
    }

    const handleTaskClick = async (taskId) => {
        const updatedTodos = todos.map((todo) =>
        todo.id === taskId ? {...todo, completed: !todo.completed} : todo)

        setTodos(updatedTodos);

        const userDocRef = doc(db, "usertodo", currentUser.uid)
        await updateDoc(userDocRef, {todos: updatedTodos});
        console.log("Successfully updated ");
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
                    </div>
                    <div className="todo-tasks">
                        {todos.map(todo => (
                            <div key={todo.id} className="tasks-main" onClick={() => handleTaskClick(todo.id)}>
                                <div className={`checkbox ${todo.completed ? "checked" : ""}`}>
                                    <FontAwesomeIcon icon = {todo.completed ? faCheckSquare : faSquare} />
                                </div>
                                <p className={todo.completed ? "completed" : ""}>
                                    {todo.task}                                    
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <img src="./image 1.png" alt="moon" className="moon-icon" />

            {showTodoList && (
                <div className = "todo-overlap">
                    <div className="todo-popup">
                        <Todolist />
                        <button className="todo-close" onClick={handleCloseTodoList}>Close..</button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard;