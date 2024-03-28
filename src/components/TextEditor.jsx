import React, { useEffect, useRef, useCallback, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip'; // Import JSZip

import { io } from "socket.io-client"
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor({ fileUrl }) {
    const documentId = fileUrl
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null || !fileUrl) return

        // Fetch the .docx file content and convert it to HTML
        const fetchData = async () => {
            try {
                const response = await fetch(fileUrl);
                const buffer = await response.arrayBuffer();

                const doc = new Docxtemplater();
                doc.loadZip(new JSZip(buffer));

                // Convert docx to HTML
                const html = doc.getFullText();

                quill.root.innerHTML = html;
            } catch (error) {
                console.error('Error fetching or converting .docx file:', error);
            }
        };

        fetchData();

    }, [socket, quill, fileUrl])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = delta => {
            quill.updateContents(delta)
        }
        socket.on("receive-changes", handler)

        return () => {
            socket.off("receive-changes", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }
    }, [socket, quill])

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS },
        })
        // q.disable()
        // q.setText("Loading...")
        setQuill(q)
    }, [])
    return (
        <div className='container' ref={wrapperRef}></div>
    )
}
