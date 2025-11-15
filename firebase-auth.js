// firebase-auth.js
class FirebaseAuthService {
    constructor() {
        this.auth = firebase.auth();
    }

    // লগইন ফাংশন
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName
                }
            };
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found. Please sign up first.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Wrong password. Please try again.';
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // সাইন আপ ফাংশন
    async signUp(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Display name সেট করুন
            await userCredential.user.updateProfile({
                displayName: displayName
            });

            return {
                success: true,
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: displayName
                }
            };
        } catch (error) {
            let errorMessage = 'Sign up failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // লগআউট ফাংশন
    async logout() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // কারেন্ট ইউজার চেক
    getCurrentUser() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged((user) => {
                resolve(user);
            });
        });
    }
}

// Global instance তৈরি করুন
const authService = new FirebaseAuthService();