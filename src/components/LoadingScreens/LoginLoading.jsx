import React, {useEffect,useState} from 'react'
import './LoadingScreen.scss'
import StarryBackground from '../StarryBg'
import { auth, db } from '../../Firebase'
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


export const LoginLoading = () => {
    const [isProfileSetup, setIsProfileSetup] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchProfileSetup = async() =>{
            try{
                const user = auth.currentUser;

                const userDocRef = doc(db, "Users", user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    if (userData && userData.profileSetup !== undefined) {
                      setIsProfileSetup(userData.profileSetup);
                    } else {
                      // Handle the case where the profileSetup field is not available
                      console.error("Profile setup information not available");
                    }
                  } else {
                    // Handle the case where the document does not exist
                    console.error("User document does not exist");
                  }

            }catch(error){
                console.error("Error fetching profile setup information: ", error);
            }
        }
        fetchProfileSetup();
    },[])
    
    useEffect(() => {
        // Navigate based on isProfileSetup
        if (isProfileSetup !== null) {
          const destination = isProfileSetup ? "/" : "/category";
          navigate(destination);
        }
      }, [isProfileSetup]);


  return (
    <div class="universe-wrapper">
        <StarryBackground/>
    <div class="stars-wrapper"></div>
    <div class="planets-wrapper">
      <div class="sun"></div>
      <div class="mercury"></div>
      <div class="venus"></div>
      <div class="earth"> </div>
      <div class="mars"> </div>
      <div class="jupiter"></div>
      <div class="saturn"></div>
      <div class="uranus"></div>
      <div class="neptune"></div>
      <div class="pluto"></div>
    </div>
  </div>
  )
}
