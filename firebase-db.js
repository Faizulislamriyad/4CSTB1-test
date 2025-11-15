// firebase-db.js
class FirebaseDBService {
    constructor() {
        this.db = firebase.firestore();
    }

    // নোটিস সম্পর্কিত ফাংশন
    async getNotices() {
        try {
            const snapshot = await this.db.collection('notices')
                .orderBy('createdAt', 'desc')
                .get();
            
            const notices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Convert Firebase timestamp to regular date
            return notices.map(notice => ({
                ...notice,
                createdAt: notice.createdAt?.toDate?.()?.getTime() || Date.now(),
                updatedAt: notice.updatedAt?.toDate?.()?.getTime() || Date.now()
            }));
        } catch (error) {
            console.error('Error getting notices:', error);
            return [];
        }
    }

    async createNotice(noticeData) {
        try {
            const noticeWithTimestamp = {
                ...noticeData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('notices').add(noticeWithTimestamp);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateNotice(id, noticeData) {
        try {
            await this.db.collection('notices').doc(id).update({
                ...noticeData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteNotice(id) {
        try {
            await this.db.collection('notices').doc(id).delete();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // রিকোয়েস্ট সম্পর্কিত ফাংশন
    async getRequests() {
        try {
            const snapshot = await this.db.collection('requests')
                .orderBy('createdAt', 'desc')
                .get();
            
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Convert Firebase timestamp to regular date
            return requests.map(request => ({
                ...request,
                createdAt: request.createdAt?.toDate?.()?.getTime() || Date.now()
            }));
        } catch (error) {
            console.error('Error getting requests:', error);
            return [];
        }
    }

    async createRequest(requestData) {
        try {
            const requestWithTimestamp = {
                ...requestData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            };

            const docRef = await this.db.collection('requests').add(requestWithTimestamp);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateRequestStatus(id, status) {
        try {
            await this.db.collection('requests').doc(id).update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // রিয়েল-টাইম আপডেটের জন্য
    onNoticesChange(callback) {
        return this.db.collection('notices')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const notices = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.()?.getTime() || Date.now(),
                        updatedAt: data.updatedAt?.toDate?.()?.getTime() || Date.now()
                    };
                });
                callback(notices);
            });
    }
}

// Global instance তৈরি করুন
const dbService = new FirebaseDBService();