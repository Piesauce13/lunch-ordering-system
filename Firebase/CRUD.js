import db from "./firebase_config"
import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore"; 

const create = async () => {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            first: "Ada",
            last: "Lovelace",
            born: 1815
        });
        console.log("Document written with ID: ", docRef.id);
        } catch (e) {
        console.error("Error adding document: ", e);
}
}

const read = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
        });
    } catch (e){
        console.error("Error:",e)
    }
}

const update = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            first: "Ada",
            last: "Hehe",
            born: 1999
        })
    } catch (e){
        console.error("Errors: ", e)
    }
    
  
}

const remove = async (uid) => {
    try{
        const userRef = doc(db, 'user', uid);
        await deleteDoc(userRef)
    } catch(e)
    {
        console.error("Errors:",e )
    }
    
}

export default {create,read,update,remove}


