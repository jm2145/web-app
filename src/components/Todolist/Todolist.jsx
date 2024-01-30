import "./Todolist.css";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Todo } from "./Todo";
import { EditTodoform } from "./EditToDoform";
import { auth, db } from "../../Firebase";
import { getDoc, updateDoc, doc, setDoc } from "firebase/firestore";
uuidv4();


function Todolist() {
    const [value, setValue] = useState("");
    const [todos, setTodos] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

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
                    }
                };

                fetchTodos();
            }
        });

        return () => userset();
    }, []);


    const handleSubmit = e => {
        e.preventDefault();
        addTodo(value);
        setValue("");
    }

    const addTodo = async (value) => {

        const newTodo = {
            id: uuidv4(),
            task: value,
            completed: false,
            isEditing: false
        };

        setTodos([...todos, newTodo]);

        try {
            const userDocRef = doc(db, "usertodo", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                await updateDoc(userDocRef, { todos: [...userDoc.data().todos, newTodo] })
                console.log("Todo added successfully");
            }
            else {
                await setDoc(userDocRef, {
                    userid: currentUser.uid,
                    todos: [newTodo]
                })
                console.log("Document created");
            }
        } catch (error) {
            console.error("Error adding todo: ", error);
        }
        // setTodos([...todos, { id: uuidv4(), task: value, completed: false, isEditing: false }])
        console.log(todos);
    }

    const toggleComplete = async (id) => {

        const updatedTodos = todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );

        setTodos(updatedTodos);

        const userDocRef = doc(db, "usertodo", currentUser.uid);
        try {
            await updateDoc(userDocRef, { todos: updatedTodos });
            console.log("Successfully updated completion");
        } catch (error) {
            console.error("Error toggling completion: ", error);
        }


        // setTodos(
        //     todos.map((todo) =>
        //         todo.id === id ? { ...todo, completed: !todo.completed } : todo
        //     )
        // );
    }


    const deleteTodo = async (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        const userDocRef = doc(db, "usertodo", currentUser.uid);

        try {
            const userDoc = await getDoc(userDocRef);
            const updatedTodos = userDoc.data().todos.filter((todo) => todo.id !== id);
            await updateDoc(userDocRef, { todos: updatedTodos });
            console.log("Successfully deleted todo");
        } catch (error) {
            console.error("Error deleting todo: ", error);
        }
    };

    const editTodo = async (id) => {

        const updatedTodos = todos.map((todo) =>
            todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
        );

        setTodos(updatedTodos);

        const userDocRef = doc(db, "usertodo", currentUser.uid);

        try {
            await updateDoc(userDocRef, { todos: updatedTodos });
            console.log("Successfully updated isEditing");
        } catch (error) {
            console.error("Error updating isEditing: ", error);
        }

        // setTodos(
        //     todos.map((todo) =>
        //         todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
        //     )
        // );
    }

    const editTask = async (task, id) => {

        setTodos((prevTodos) =>
            prevTodos.map((todo) =>
                todo.id === id ? { ...todo, task, isEditing: false } : todo
            )
        );

        const userDocRef = doc(db, "usertodo", currentUser.uid);

        try {
            const userDoc = await getDoc(userDocRef);
            const todoToUpdate = userDoc.data().todos.find((todo) => todo.id === id);
            const updatedTodo = { ...todoToUpdate, task, isEditing: false };
            await updateDoc(userDocRef, {
                todos: todos.map((todo) => (todo.id === id ? updatedTodo : todo)),
            });
            console.log("Successfully updated task");
        } catch (error) {
            console.error("Error updating task: ", error);
        };


        // setTodos(
        //   todos.map((todo) =>
        //     todo.id === id ? { ...todo, task, isEditing: !todo.isEditing } : todo
        //   )
        // );
    };


    return (
        <div className="TodoWrapper">
            <h1 className="td-title"> Manage Your Tasks!</h1>
            <form className='TodoForm' onSubmit={handleSubmit}>
                <input type="text" className='todo-input' placeholder='What is the task today ?' value={value} onChange={(e) => setValue(e.target.value)} />
                <button type='submit' className='todo-btn'> Add Task </button>
            </form>
            {todos.map((todo) => todo.isEditing ? (
                <EditTodoform editTodo={editTask} task={todo} />
            ) : (
                <Todo task={todo} key={todo.id} toggleComplete={toggleComplete} deleteTodo={deleteTodo} editTodo={editTodo} />
            ))}
        </div>
    )
}


export default Todolist;