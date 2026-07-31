const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyAdAHhXresfNiZlgJU986nZ5NVjUNheLok",
  authDomain: "nyztrix-wolf.firebaseapp.com",
  projectId: "nyztrix-wolf",
  storageBucket: "nyztrix-wolf.firebasestorage.app",
  messagingSenderId: "6454113284",
  appId: "1:6454113284:web:aadc5941ed179b0d86b151",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function main() {
  const email = "sitheshwaran27@mail.com";
  const password = "123456789";

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("SUCCESS: User created!");
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
       console.log("User already exists. Trying to sign in to verify...");
       try {
         await signInWithEmailAndPassword(auth, email, password);
         console.log("SUCCESS: Logged in! The password matches.");
       } catch (err) {
         console.error("FAILED to login:", err.message);
       }
    } else {
       console.error("FAILED to create user:", e.message);
    }
  }
  process.exit(0);
}

main();
