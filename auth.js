import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwBuy-gkE9CDZpjA8zVRAteDV4PxCsVBk",
  authDomain: "muhammad-sheikh.firebaseapp.com",
  projectId: "muhammad-sheikh",
  storageBucket: "muhammad-sheikh.firebasestorage.app",
  messagingSenderId: "292369780037",
  appId: "1:292369780037:web:fa0b44444532a6cef5022c",
  measurementId: "G-Y4SJ536K1D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign In
const signinBtn = document.getElementById("lbtn");
if (signinBtn) {
  signinBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("lemail").value.trim();
    const password = document.getElementById("lpass").value.trim();
    
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Empty Fields",
        text: "Email and Password are required",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }
    
    const adminEmail = "admin12@gmail.com"
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password,adminEmail);
      Swal.fire({
        title: "Welcome Back!",
        text: `Logged in as ${userCredential.user.email}`,
        icon: "success",
        confirmButtonColor: "#4F46E5",
      }).then(() => {

        if(userCredential.user.email === adminEmail){
          window.location = "./index.html";
        }else{
          window.location = "./user.html"
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonColor: "#4F46E5",
      });
    }
  });
}

// Sign Up
const signupBtn = document.getElementById("btn");
if (signupBtn) {
  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Empty Fields",
        text: "Email and Password are required",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire({
        title: "Account Created!",
        text: `Welcome ${userCredential.user.email}`,
        icon: "success",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        window.location.href = "./login.html";
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message,
        confirmButtonColor: "#4F46E5",
      });
    }
  });
}

// Google Auth
const googleBtn = document.getElementById("google-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      Swal.fire({
        title: "Google Login Success!",
        text: `Welcome ${user.displayName || user.email}`,
        icon: "success",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        window.location.href = './index.html';
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: error.message,
        confirmButtonColor: "#4F46E5",
      });
    }
  });
}