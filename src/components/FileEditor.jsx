import * as React from "react";
import "../App.css";
import { auth, db } from "../Firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
DocumentEditorContainerComponent.Inject(Toolbar);

function FileEditor() {
  const docRef = React.useRef(null);

  const saveHandler = async () => {
    const uid = auth.currentUser.uid;
    const contentBlob = await docRef.current.documentEditor.saveAsBlob("Docx");

    // Create a storage reference
    const storage = getStorage();
    const storageRef = ref(storage, `Files/${uid}`);

    // Upload the blob to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, contentBlob);

    // Wait for the upload to complete and get the download URL
    const downloadURL = await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => { },
        (error) => reject(error),
        async () => {
          // Upload completed successfully, now we can get the download URL
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

    // Save the download URL to Firestore
    await setDoc(doc(db, "Files", uid), {
      content: downloadURL,
      user: uid,
    });

    //This saves locally
    docRef.current.documentEditor.save("undefined", "Docx");
  };

  return (
    <div className="editor">
      <button onClick={saveHandler}>Save</button>
      <DocumentEditorContainerComponent
        ref={docRef}
        id="container"
        height="100vh"
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        enableToolbar={true}
      />
    </div>
  );
}
export default FileEditor;
