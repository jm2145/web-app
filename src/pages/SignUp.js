import React, { useState, useRef, useEffect } from "react";
import { auth , db} from "../Firebase";
import { doc, setDoc } from "firebase/firestore";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { doc, setDoc } from "firebase/firestore";
import Popup from "../components/Popup";
import { Link } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    // signInWithPopup,
    // GoogleAuthProvider,
    sendEmailVerification, updateProfile
} from "firebase/auth";
import "./SignUp.css";


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;



function SignUp() {
    const [showPopup, setShowPopup] = useState(false);

    const userRef = useRef();
    const errRef = useRef();

    const [username, setUsername] = useState("");
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdfocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const formRef = useRef(null);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        const result = USER_REGEX.test(username);
        console.log(result);
        console.log(username);
        setValidName(result);
    }, [username])

    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        console.log(result);
        console.log(email);
        setValidEmail(result);
    }, [email])

    useEffect(() => {
        const result = PWD_REGEX.test(pwd);
        console.log(result);
        console.log(pwd);
        setValidPwd(result);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [username, email, pwd, matchPwd])

    // const handleSignUpWithGoogle = (e) => {
    //     e.preventDefault();

    //     const provider = new GoogleAuthProvider();
    //     signInWithPopup(auth, provider)
    //         .then((result) => {
    //             // You can handle the successful sign-up/sign-in with Google here.
    //             console.log(result);
    //         })
    //         .catch((error) => {
    //             // Handle sign-up/sign-in errors here
    //             console.log(error);
    //         });
    // };

    useEffect(() => {
        const formRefCurrent = formRef.current;
        const updateFormHeight = () => {
            if (formRefCurrent){
                const formHeight = formRefCurrent.clientHeight;
                document.documentElement.style.setProperty("--form-height", `${formHeight}px`);
            }
        }

        updateFormHeight();

        const resizeObserver = new ResizeObserver(updateFormHeight);
        if (formRefCurrent){
            resizeObserver.observe(formRefCurrent);
        }

        return () => {
            if (formRefCurrent){
                resizeObserver.unobserve(formRefCurrent);
            }
        }
    }, []);

    const handleSignUpWithEmail = (e) => {
        e.preventDefault();

        createUserWithEmailAndPassword(auth, email, pwd)
            .then((userCredential) => {
                const user = userCredential.user;
                const v1 = USER_REGEX.test(username);
                console.log('hola');
                const uid = user.uid;
                const v2 = PWD_REGEX.test(pwd);
                const v3 = EMAIL_REGEX.test(email);

                if (!v1 || !v2 || !v3) {
                    setErrMsg("Invalid Entry")
                    return;
                }
                console.log(username, pwd);
                setSuccess(true);

                // Send email verification
                sendEmailVerification(user)
                    .then(() => {
                        // Verification email sent successfully
                        console.log("Verification email sent");
                    })
                    .catch((error) => {
                        // Handle email verification error
                        console.log("Error sending verification email:", error);
                    });

                    updateProfile(user, {
                        displayName: username,
                      });

                setDoc(doc(db, "Users", uid), {
                  username: username,
                  interests: "",
                  uid:uid,
                  profileDescription: "",
                  userCategory: "",
                  profileSetup: false
                })
                
                setDoc(doc(db,"userChats",uid),{});


            })
            .catch((error) => {
                // Handle sign-up errors
                console.log("Error creating user:", error);
            });
    };






    return (

        <>
            {success ? (
                <Popup // Render the pop-up component if success is true
                    message="Success! A verification email has been sent to your email. Please verify as soon as possible in order to be able to Sign in!"
                    onClose={() => setShowPopup(false)} // Close the pop-up when needed
                />
            ) : (
                <section className="su-main-container">
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <div className="signup-content">
                        <h1>Sign Up</h1>
                        <p>Please fill in your information below</p>
                    </div>

                    <div className="form-background">
                        <form className="form-style" ref={formRef}>
                            <img className="signup-cloudsup" src="./Component 1.png" alt="clouds"></img>
                            <img className="signup-cloudsdown" src="./Component 1.png" alt="clouds"></img>
                            <label htmlFor="username">
                                Username
                                <span className={validName ? "valid" : "hide"}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validName || !username ? "hide" : "invalid"}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username here"
                                ref={userRef}
                                autoComplete="off"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                required
                                aria-invalid={validName ? "false" : "true"}
                                aria-describedby="uidnote"
                                onFocus={() => setUserFocus(true)}
                                onBlur={() => setUserFocus(false)}
                            />
                            <p id="uidnote" className={userFocus && username && !validName ? "instructions" : "offscreen"}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                4 to 24 characters.<br />
                                Must begin with a letter.<br />
                                Letters, numbers, underscores, hyphens allowed.
                            </p>


                            <label htmlFor="email">
                                Email
                                <span className={validEmail ? "valid" : "hide"}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validEmail || !email ? "hide" : "invalid"}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email here"
                                ref={userRef}
                                autoComplete="off"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                aria-invalid={validEmail ? "false" : "true"}
                                aria-describedby="eidnote"
                                onFocus={() => setEmailFocus(true)}
                                onBlur={() => setEmailFocus(false)}
                            />
                            <p id="eidnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                Enter a Valid Email
                            </p>

                            <label htmlFor="password">
                                Password
                                <span className={validPwd ? "valid" : "hide"}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validPwd || !pwd ? "hide" : "invalid"}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password here"
                                onChange={(e) => setPwd(e.target.value)}
                                value={pwd}
                                required
                                aria-invalid={validPwd ? "false" : "true"}
                                aria-describedby="pwdnote"
                                onFocus={() => setPwdfocus(true)}
                                onBlur={() => setPwdfocus(false)}
                            />
                            <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                8 to 24 characters.<br />
                                Must include uppercase and lowercase letters, a number and a special character.<br />
                                Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                            </p>

                            <label htmlFor="confirm_pwd">
                                Confirm Password
                                <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                                <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                            </label>
                            <input
                                type="password"
                                id="confirm_pwd"
                                placeholder="Confirm your password here"
                                onChange={(e) => setMatchPwd(e.target.value)}
                                value={matchPwd}
                                required
                                aria-invalid={validMatch ? "false" : "true"}
                                aria-describedby="confirmnote"
                                onFocus={() => setMatchFocus(true)}
                                onBlur={() => setMatchFocus(false)}
                            />
                            <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                Must match the first password input field.
                            </p>

                            <button disabled={!validName || !validPwd || !validMatch ? true : false} onClick={handleSignUpWithEmail} className="su-button">Sign Up</button>
                            {/* <button type="submit" disabled={!validName || !validEmail || !validPwd || !validMatch ? true : false} onClick={handleSignUpWithEmail}>Sign Up using Google</button> */}                            
                        </form>
                    </div>

                    <p className="already-container">
                        Already registered?{' '}
                        <Link className="line" to={"/logIn"}>
                            {/*put router link here*/}
                            Sign In
                        </Link>
                    </p>



                </section>
            )}
        </>



    );
}

export default SignUp;