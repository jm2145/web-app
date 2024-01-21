import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db , auth} from "../Firebase";
import { getDoc , updateDoc, doc } from "firebase/firestore";
import './Category.css';
import StarryBackground from "../components/StarryBg";

function Category(){
    const [currentUser, setCurrentUser] = useState(null);
    const [isTeacherClicked, setTeacherClicked] = useState(false);
    const [isStudentClicked, setStudentClicked] = useState(false);
    const navigate = useNavigate();

    const handleNext = () => {
        navigate("/proDetails");
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const handleClick = async (userCategory) => {    
        try {
            const userDocRef = doc(db, "Users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if(userDoc.exists()){
                
                await updateDoc(userDocRef, { userCategory: userCategory});
                console.log("Category updated successfully");
                
                if (userCategory === "teacher"){
                    setTeacherClicked(true);
                    setStudentClicked(false);
                }else if (userCategory === "student"){
                    setStudentClicked(true);
                    setTeacherClicked(false);
                }
            }
            else{
                console.log("User document not found");
            }
        } catch (error){
            console.error("Error updating category:" , error);
        }
    };

    return(
        <div className="category-main">
            <StarryBackground/>
            <img className="category-cloudsdown" src="./image_2023-12-19_233830828-removebg-preview.png" alt="clouds"></img>
            <img className="category-cloudsup" src="./image_2023-12-19_233830828-removebg-preview.png" alt="clouds"></img>

            <div className="category-content">
                <h1>Select Category</h1>
                <h2>Which category of users do you come under?</h2>
                <h3>You can always change this later.</h3>
            </div>
            

            <div className="category-Select">
                <div 
                    className={`category-choice ${isTeacherClicked ? "button-clicked" : ""}`} onClick={() => handleClick("teacher")}>
                    <div className="category-icon">
                        <img src = "./Teachers.png" alt="TeachLogo"/>
                        <label className="category-label">Teacher</label>                    
                    </div>                    
                </div>
                <div 
                    className={`category-choice ${isStudentClicked ? "button-clicked" : ""}`}
                    onClick={() => handleClick("student")}
                >
                    <div className="category-icon">
                        <img src = "./Students.png" alt="StuLogo"/>
                        <label className="category-label">Student</label>
                    </div>
                </div>                    
            </div>

            <div className={`category-next`} onClick={handleNext}>
                <img className="category-next" src="./next.png" alt="next"></img>
            </div>
            
            
        </div>        
    );
}

export default Category;