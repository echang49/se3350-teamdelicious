import "../styles/style.css";
import firebase from "../firebase.js";
import '@firebase/auth';
import { useRef } from "react";

function AddDescriptions() {

    const userRef = useRef();
    const passRef = useRef();
    const errRef = useRef();

    async function handleClick() {
      try {
        await firebase.auth().signInWithEmailAndPassword(userRef.current.value, passRef.current.value);
        window.location.href = "/admin/matchTA";
      } catch (error) {
        errRef.current.classList.add("show");
      }
    }
    //code if logged in, redirect to dashboard?
    return (
      <div className="center matchTA">
          <div className="box">
            <p className="title"><strong>Login Page</strong></p>
            <label>Username</label>
            <input type="text" ref={userRef} />
            <br />
            <label>Password</label>
            <input type="password" ref={passRef} />
            <p className="error" ref={errRef}>Incorrect Password or Username!</p>
            <button onClick={() => handleClick()}>Login</button>
          </div>
      </div>
    );
  }
  
export default AddDescriptions;