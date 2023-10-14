const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { user } = require("firebase-functions/v1/auth");

initializeApp();

// User CRUD
exports.addUser = onRequest(async (req, res) => {
	const userId = req.query.userId;
	const userData = req.body;

	if (userId !== String(userData.userId)) {
		res.status(400).json({
			error: `User ID: ${userId} does not match user data in the body of the request.`,
		});
		return;
	}
	const usersCollection = getFirestore().collection("users");

	try {
		const userSnapshot = await usersCollection.doc(userId).get();
		if (userSnapshot.exists) {
			res
				.status(400)
				.json({ error: `User with ID: ${userId} already exists.` });
			return;
		}

		await usersCollection.doc(userId).set(userData);
		res.status(200).json({ result: `User with ID: ${userId} added.` });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ error: e });
	}
});

exports.getUser = onRequest(async (req, res) => {
	const userId = req.query.userId;
	try {
		const userDoc = await getFirestore().collection("users").doc(userId).get();
		const userData = userDoc.data();

		if (userData) {
			res.status(200).json(userData);
		} else {
			res
				.status(400)
				.json({ error: `User with ID: ${userId} does not exist.` });
		}
	} catch (e) {
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
			res
				.status(400)
				.json({ error: `No users found with phone numbers: ${phoneNumbers}` });
		} else {
			res.status(200).json(userData);
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({ error: e });
	}
});

exports.updateUser = onRequest(async (req, res) => {
	const userId = req.query.userId;
	const userData = req.body;

	if (userId !== String(userData.userId)) {
		res.status(400).json({
			error: `User ID: ${userId} does not match user data in the body of the request.`,
		});
		return;
	}

	try {
		const userSnapshot = await getFirestore()
			.collection("users")
			.doc(userId)
			.get();
		if (!userSnapshot.exists) {
			res
				.status(400)
				.json({ error: `User with ID: ${userId} does not exist.` });
		} else {
			await getFirestore().collection("users").doc(userId).update(userData);
			res.status(200).json({ result: `User with ID: ${userId} updated.` });
		}
	} catch (e) {
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
			res
				.status(400)
				.json({ error: `User with ID: ${userId} does not exist.` });
		} else {
			const deleted = await getFirestore()
				.collection("users")
				.doc(userId)
				.delete();

			console.log(deleted);
			res.status(200).json({ result: `User with ID: ${userId} deleted.` });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({ error: e });
	}
});

exports.replaceUserContacts = onRequest(async (req, res) => {
	const userId = req.query.userId;
	const providedContacts = req.body;

	if (!userId) {
		res
			.status(400)
			.json({ error: "User ID must be provided in the query string." });
		return;
	}

	if (!Array.isArray(providedContacts)) {
		res
			.status(400)
			.json({ error: "Expected an array of contacts in the body." });
		return;
	}

	try {
		const userRef = getFirestore().collection("users").doc(userId);

		const userDoc = await userRef.get();

		if (!userDoc.exists) {
			res
				.status(400)
				.json({ error: `User with ID: ${userId} does not exist.` });
			return;
		}

		const userContactsCollection = userRef.collection("contacts");

		if (providedContacts.length === 0) {
			res.status(400).json({ error: "At least one contact must be provided." });
			return;
		}

		const batch = getFirestore().batch();

		// Delete all existing contacts first
		try {
			const snapshot = await userContactsCollection.get();
			snapshot.docs.forEach((doc) => {
				console.log(doc);

				batch.delete(doc.ref);
			});
			await batch.commit();
		} catch (e) {
			logger.error(e);
			res.status(500).json({ error: e });
			return;
		}

		const newBatch = getFirestore().batch();

		for (let contact of providedContacts) {
			console.log(providedContacts);
			console.log(contact);
			if (!contact.id) {
				res
					.status(400)
					.json({
						error: "Each contact in the array must have a valid non-empty ID.",
					});
				return;
			}

			try {
				const contactDocRef = userContactsCollection.doc(String(contact.id));
				newBatch.set(contactDocRef, contact);
			} catch (e) {
				logger.error(e);
				res.status(500).json({ error: e });
				return;
			}
		}

		await newBatch.commit();
		res.status(200).json({
			result: `Contacts for User with ID: ${userId} have been replaced.`,
		});
	} catch (e) {
		logger.error(e);
		res.status(500).json({ error: e });
		return;
	}
});
