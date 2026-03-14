import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxtqae3GGjRq8-ANogZjAIl8D4g-pYkuo",
  authDomain: "workout-planner-naasmind.firebaseapp.com",
  projectId: "workout-planner-naasmind",
  storageBucket: "workout-planner-naasmind.firebasestorage.app",
  messagingSenderId: "269570348087",
  appId: "1:269570348087:web:af0f61fe32d50c39805bb2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function runTest() {
  // Using a test email to prove Firebase is fully connected
  const testEmail = "naasmind.test." + Date.now() + "@yopmail.com";
  const testPassword = "StrongPassword123!";

  console.log("\n==============================================");
  console.log("   ?? FIREBASE END-TO-END TEST SCRIPT ??");
  console.log("==============================================\n");

  try {
    console.log("Step 1: Creating new user in Firebase...");
    console.log("Email:", testEmail);
    const userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log("? Success! Firebase User UID:", userCred.user.uid);

    console.log("\nStep 2: Triggering Forgot Password Email...");
    await sendPasswordResetEmail(auth, testEmail);
    console.log("? Success! Password reset email strictly sent by Firebase to:", testEmail);

    console.log("\nAll Firebase logic is working perfectly!");
    process.exit(0);
  } catch (err) {
    console.error("? Test Failed:", err);
    process.exit(1);
  }
}

runTest();
