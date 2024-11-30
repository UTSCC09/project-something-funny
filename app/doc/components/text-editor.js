import dynamic from 'next/dynamic';
import ReactQuill from "react-quill-new";
import {useRef, useEffect, useState, useMemo} from "react";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import {firebaseDB} from '../../../firebase-auth/index.js';
import useAuthStore from '../../../hooks/useAuthStore.js';
import {throttle} from "lodash";

export const TextEditor = () => {

    /* const user = useAuthStore((state) => state.user);
    const uid = user.uid;
 */
    //Just pass the name of the document to this variable here
    const docname = "sample-doc";

    const quillRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);

    const isLocalChange = useRef(false);

    const documentRef = doc(firebaseDB, "documents", docname);

    const saveContent = throttle(() => {
        if (quillRef.current && isLocalChange.current){
            const content = quillRef.current.getEditor().getContents();

            console.log("Saving to db: ", content);

            setDoc(documentRef, {content: content.ops}, {merge: true})
            .then(() => console.log("Content Saved"))
            .catch(console.error);

            isLocalChange.current = false;
        }
    }, 1000);

    useEffect (() => {
        if (quillRef.current) {
            //Loading content from Firestore
            getDoc(documentRef).then((docSnap)=> {
                const savedContent = docSnap.data().content;
                if (savedContent){
                    quillRef.current.getEditor().setContents(savedContent);
                } 
                else{
                    console.log("no doc found, starting with an empty editor");
                }
            }).catch(console.error);

            // Listen to updates and update real time
            const unsubscribe = onSnapshot(documentRef, (snapshot) => {
                if (snapshot.exists()) {
                    const newContent = snapshot.data().content;

                    if (!isEditing) {
                        const editor = quillRef.current.getEditor();
                        const currentCursorPosition = editor.getSelection()?.index || 0 ;
                        editor.setContents(newContent, "silent");
                        editor.setSelection(currentCursorPosition);
                    }
                }
            });

            // Listen for local text changes and save it to firestore
            const editor = quillRef.current.getEditor();
            editor.on("text-change", (delta, oldDelta, source) => {

                if (source === "user"){
                    isLocalChange.current = true;

                    setIsEditing(true);
                    saveContent();

                    setTimeout(() => setIsEditing(false), 5000);
                }
            });

            return () => {
                unsubscribe();
                editor.off("text-change");
            }
        }
    }, []);

    return (
    <div className = "google-docs-editor">
        {}
       <ReactQuill ref={quillRef} />
    </div>
    );
};

export default TextEditor;