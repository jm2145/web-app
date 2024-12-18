import React, { useState, useEffect } from "react";
import { driver } from 'driver.js';
import '../components/test.css'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { MouseParallax } from 'react-just-parallax';
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import LoginFailPopup from "../popups/LoginFailPopup";
import { IoIosInformationCircle } from "react-icons/io";
import './LogIn.css';
import StarryBackground from "../components/StarryBg";

function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [fail, setFail] = useState(false);
  //   const [recaptchaValue, setRecaptchaValue] = useState(null); // Store the reCAPTCHA value FOR RECAPTCHA IF WE EVER NEED IT
  const navigate = useNavigate();

  const submitDetails = (e) => {
    e.preventDefault();


    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("hi");
        // Check if the user exists and their email is verified
        if (user && user.emailVerified) {
          navigate("/loading");
        } else if (user && !user.emailVerified) {
          setFail(true);
          setErrMsg("Please verify your email before logging in.")
          console.log("Please verify your email before logging in.");
        }
      })
      .catch((error) => {
        const errorMessage = `Error creating user: ${error}`;
        setErrMsg(errorMessage);
        setFail(true);

        console.log(errorMessage);
      });

  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then(async (userCredentials) => {
        const user = userCredentials.user;

        if (user && user.emailVerified) {
          // Check if the user document already exists in the Users collection
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            // If the user document doesn't exist, create it
            // const username = user.displayName || "Anonymous";
            await setDoc(userDocRef, {
              // username: username,
              interests: "",
              uid: user.uid,
              profileDescription: "",
              userCategory: "",
              profileSetup: false,
            });

            // Check if the userChats document already exists
            const userChatsDocRef = doc(db, "userChats", user.uid);
            const userChatsDocSnapshot = await getDoc(userChatsDocRef);

            if (!userChatsDocSnapshot.exists()) {
              // If the userChats document doesn't exist, create it
              await setDoc(userChatsDocRef, {});
            }
          }

          // Navigate to the home page ("/") after the necessary setup
          navigate("/loading");
        } else if (user && !user.emailVerified) {
          console.log("Please verify your email before logging in.");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };


  useEffect(() => {
    const parallax = (e) => {
      document.querySelectorAll('.layer').forEach(layer => {
        const speed = layer.getAttribute('data-speed');
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    document.addEventListener("mousemove", parallax);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      document.removeEventListener("mousemove", parallax);
    };
  }, []);

  const driverObj = driver({
    showProgress: true,  // Because everyone loves progress bars!
    steps: [
      {
        element: '#email',
        popover: {
          title: 'Enter your email',
          description: 'This is the one you have registered with'
        }
      },
      {
        element: '#password',
        popover: {
          title: 'Enter your registered password !',
          description: 'good luck '
        }
      }

    ]
  });

  const startTheMagicShow = () => {
    driverObj.drive();
  };

  return (
    <div className="si-main-background">
      <StarryBackground />
      <div className="signin-content">
        <h1>Sign In</h1>
      </div>
      <div className="sign-in-background">
        {/* <MouseParallax enableOnTouchDevice> */}
        <img className="signin-cloudsup layer" src="./Component 1.png" alt="clouds" data-speed="-3" ></img>
        {/* </MouseParallax> */}
        {/* <MouseParallax enableOnTouchDevice > */}
        <img className="signin-cloudsdown layer" src="./Component 1.png" alt="clouds" data-speed="-3"></img>
        {/* </MouseParallax> */}
        <div className="sign-in-container">
          <form onSubmit={submitDetails} className="sign-in-form">
            <label>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <label>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password here"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>

            <Link className="forgot-password-text-right" to={'/forgot'}>Forgot Password ?</Link>

            <button className="si-button" type="submit">Sign In</button>
          </form>
          <div className="signin-content">
            <p>Or login with</p>
          </div>
          <button className="google-button" onClick={signInWithGoogle}>
            {/* Log in with Google */}
          </button>
        </div>
      </div>
      <p className="dont-container">
        Don't have an account?{' '}
        <Link className="login-line" to={"/signup"}>
          {/*put router link here*/}
          Sign Up
        </Link>
      </p>

      <div className="su-guide">
        <IoIosInformationCircle size={40} onClick={startTheMagicShow} />
      </div>
      {fail && (
        <LoginFailPopup
          message={errMsg}
          onClose={() => setFail(false)}
        />
      )}
    </div>
  );
}

export default LogIn;