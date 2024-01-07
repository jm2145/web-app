import "./Todolist.css";
import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Todo } from "./Todo";
import { EditTodoform } from "./EditToDoform";
uuidv4();


function Todolist() {
    const [value, setValue] = useState("");
    const [todos, setTodos] = useState([]);


    const handleSubmit = e => {
        e.preventDefault();
        addTodo(value);
        setValue("");
    }

    const addTodo = value => {
        setTodos([...todos, { id: uuidv4(), task: value, completed: false, isEditing: false }])
        console.log(todos);
    }

    const toggleComplete = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    }


    const deleteTodo = (id) => setTodos(todos.filter((todo) => todo.id !== id));

    const editTodo = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
            )
        );
    }

    const editTask = (task, id) => {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, task, isEditing: !todo.isEditing } : todo
          )
        );
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