import React from "react";
import {
    MDBCol,
    MDBContainer,
    MDBIcon,
    MDBRow,
    MDBTypography,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import './FAQs.css'

export default function StaticFaqSection() {
    const navigate = useNavigate();

    const navigatePath = (path) => {
        navigate(path);

    }
    return (
        <MDBContainer>
            <section>
                <MDBTypography
                    tag="h3"
                    className="text-center mb-4 pb-2 text-primary fw-bold"
                >
                    FAQ
                </MDBTypography>
                <p className="text-center mb-5">
                    Find the answers for the most frequently asked questions below
                </p>

                <MDBRow>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon far icon="paper-plane text-primary pe-2" /> What are notifications and how do they work?
                        </MDBTypography>
                        <p>
                            <strong>
                                <u>Good Question!</u>
                            </strong>{" "}
                            Notifications are alerts that inform you about activity related to your account, such as chats and event deadlines. You'll receive notifications in real-time.

                        </p>
                    </MDBCol>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon fas icon="pen-alt text-primary pe-2" /> Can I message other users privately ?
                        </MDBTypography>
                        <p>
                            <strong>
                                <u>Yes, it is possible!</u>
                            </strong>{" "}
                            Yes, you can send private messages to other users by adding them in the messages page and clicking on
                            their icon. This will open a private chat where you can communicate with them one-on-one.
                        </p>
                    </MDBCol>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon fas icon="user text-primary pe-2" /> Do i need to pay to use this app?
                        </MDBTypography>
                        <p>
                            Currently, we only offer monthly subscription to universities/schools if they like our app!. 
                        </p>

                    </MDBCol>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon fas icon="rocket text-primary pe-2" /> Is my data handled in a secure manner?
                        </MDBTypography>
                        <p>
                            Yes. Your data is directly handled by the world-famous Google service Firebase. They follow strict guidelines to protect our users's rights and data!
                        </p>
                    </MDBCol>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon fas icon="home text-primary pe-2" />  How do I change my profile information or settings?
                        </MDBTypography>
                        <p>
                        To change your profile information or settings, navigate to "Settings" option present in the navbar.
                        From there, you can access Account Settings that allows you to update your personal and public information!.
                        </p>
                    </MDBCol>
                    <MDBCol md="6" lg="4" className="mb-4">
                        <MDBTypography tag="h6" className="mb-3 text-primary">
                            <MDBIcon fas icon="book-open text-primary pe-2" /> How do I react to posts?
                        </MDBTypography>
                        <p>
                        You can react to posts by clicking on the reaction icon (e.g., like) located below the post. Your reaction will be displayed alongside the post
                        </p>
                    </MDBCol>
                </MDBRow>
            </section>
            <div className="ss-buttons">
                <button className="ss-button" onClick={() => navigatePath("/")}>Back to Dashboard</button>
            </div>
        </MDBContainer>
    );
}