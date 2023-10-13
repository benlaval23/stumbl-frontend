
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();


// User CRUD
exports.addUser = onRequest(async (req, res) => {
    const userId = req.query.userId;
    const userData = req.body;
    const usersCollection = getFirestore().collection("users");

    try {
        const userSnapshot = await usersCollection.doc(userId).get();
        if (userSnapshot.exists) {
            res.status(400).json({ error: `User with ID: ${userId} already exists.` });
            return;
        }

        await usersCollection.doc(userId).set(userData);
        res.status(200).json({ result: `User with ID: ${userId} added.` });
    } catch(e) {
        logger.error(e);
        res.status(500).json({ error: e });
    }
});

exports.getUser = onRequest(async (req, res) => {
    const userId = req.query.userId;
    try {
        const userDoc = await getFirestore()
            .collection("users")
            .doc(userId)
            .get();
        const userData = userDoc.data();

        if (userData) {
            res.status(200).json(userData);  
        } else {
            res.status(400).json({ error: `User with ID: ${userId} does not exist.` });
        }
    } catch(e) {  
        logger.error(e);
        res.status(500).json({ error: e });
    }
});

exports.searchUserByPhoneNumbers = onRequest(async (req, res) => {
    const phoneNumbers = req.body;
    try {
        const usersCollection = getFirestore().collection("users");
        const querySnapshot = await usersCollection
            .where("phoneNumber", "in", phoneNumbers)
            .get();
        const userData = querySnapshot.docs.map((doc) => doc.data());

        if (userData.length === 0) {
            res.status(400).json({ error: `No users found with phone numbers: ${phoneNumbers}` });
        } else {
            res.status(200).json(userData);
        }
    } catch(e) {
        logger.error(e);
        res.status(500).json({ error: e });
    }
});

exports.updateUser = onRequest(async (req, res) => {
    const userId = req.query.userId;
    const userData = req.body;

    try {
        const userSnapshot = await getFirestore()
            .collection("users")
            .doc(userId)
            .get();
        if (!userSnapshot.exists) {
            res.status(400).json({ error: `User with ID: ${userId} does not exist.` });
        } else {
            await getFirestore()
                .collection("users")
                .doc(userId)
                .update(userData);
            res.status(200).json({ result: `User with ID: ${userId} updated.` });
        }
    } catch(e) {
        logger.error(e);
        res.status(500).json({ error: e });
    }
});

exports.deleteUser = onRequest(async (req, res) => {
    const userId = req.query.userId;

    try {
        const userSnapshot = await getFirestore()
            .collection("users")
            .doc(userId)
            .get();
        if (!userSnapshot.exists) {
            res.status(400).json({ error: `User with ID: ${userId} does not exist.` });
        } else {
            await getFirestore()
                .collection("users")
                .doc(userId)
                .delete();
            res.status(200).json({ result: `User with ID: ${userId} deleted.` });
        }
    } catch(e) {
        logger.error(e);
        res.status(500).json({ error: e });
    }
});


exports.replaceUserContacts = onRequest(async (req, res) => {
    const userId = req.query.userId;  // Assuming userId is a path parameter
    const providedContacts = req.body;

    if (!Array.isArray(providedContacts)) {
        res.status(400).json({ error: 'Expected an array of contacts in the body.' });
        return;
    }

    const firestoreInstance = getFirestore();
    const userContactsCollection = firestoreInstance
        .collection("users")
        .doc(userId)
        .collection("contacts");

    const batch = firestoreInstance.batch();

    // Delete all existing contacts first
    const snapshot = await userContactsCollection.get();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    // Now, add the provided contacts
    for (let contact of providedContacts) {
        if (!contact.id) {
            res.status(400).json({ error: 'Each contact in the array must have an ID.' });
            return;
        }

        const contactDocRef = userContactsCollection.doc(contact.id);
        batch.set(contactDocRef, contact);
    }

    await batch.commit();

    res.status(200).json({ result: `Contacts for User with ID: ${userId} have been replaced.` });
});

