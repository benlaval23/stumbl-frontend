const {logger} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions/v2/options");

setGlobalOptions({maxInstances: 10});
initializeApp();

exports.addUser = onCall(async (request) => {
  const userData = request.data;
  const userId = userData.uid;

  const usersCollection = getFirestore().collection("users");

  try {
    const userSnapshot = await usersCollection.doc(userId).get();
    if (userSnapshot.exists) {
      return {
        success: true,
        message: `User with ID: ${userId} already exists.`,
      };
    }

    await usersCollection.doc(userId).set(userData);
    return {success: true, message: `User with ID: ${userId} added.`};
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.getUser = onCall(async (request) => {
  const userId = request.data.userId;
  try {
    const userDoc = await getFirestore().collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (userData) {
      return {
        success: true,
        message: `User with ID: ${userId} found.`,
        data: userData,
      };
    } else {
      return {
        success: false,
        message: `User with ID: ${userId} does not exist.`,
      };
    }
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.searchUserByPhoneNumbers = onCall(async (request) => {
  const phoneNumbers = request.data.phoneNumbers;
  try {
    const usersCollection = getFirestore().collection("users");
    const querySnapshot = await usersCollection
        .where("phoneNumber", "in", phoneNumbers)
        .get();
    const userData = querySnapshot.docs.map((doc) => doc.data());

    if (userData.length === 0) {
      return {
        success: false,
        message: `No users found with phone numbers: ${phoneNumbers}`,
      };
    } else {
      return {
        success: true,
        data: userData,
        message: `Users found with phone numbers: ${phoneNumbers}`,
      };
    }
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.updateUser = onCall(async (request) => {
  const userId = request.data.userId;
  const userData = request.data.data;

  try {
    const userSnapshot = await getFirestore()
        .collection("users")
        .doc(userId)
        .get();
    if (!userSnapshot.exists) {
      return {
        success: false,
        message: `User with ID: ${userId} does not exist.`,
      };
    } else {
      await getFirestore().collection("users").doc(userId).update(userData);
      return {success: true, message: `User with ID: ${userId} updated.`};
    }
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.deleteUser = onCall(async (request) => {
  const userId = request.data.userId;

  try {
    const userSnapshot = await getFirestore()
        .collection("users")
        .doc(userId)
        .get();
    if (!userSnapshot.exists) {
      return {
        success: false,
        message: `User with ID: ${userId} does not exist.`,
      };
    } else {
      await getFirestore().collection("users").doc(userId).delete();

      return {success: true, message: `User with ID: ${userId} deleted.`};
    }
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.replaceUserContacts = onCall(async (request) => {
  const userId = request.data.userId;
  const providedContacts = request.data.contacts;

  if (!userId) {
    return {
      success: false,
      message: "User ID must be provided in the query string.",
    };
  }

  if (!Array.isArray(providedContacts)) {
    return {
      success: false,
      message: "Expected an array of contacts in the body.",
    };
  }

  try {
    const userRef = getFirestore().collection("users").doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: `User with ID: ${userId} does not exist.`,
      };
    }

    const userContactsCollection = userRef.collection("contacts");

    if (providedContacts.length === 0) {
      return {
        success: true,
        message: "No contacts provided.",
      };
    }

    const batch = getFirestore().batch();

    try {
      const snapshot = await userContactsCollection.get();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (e) {
      logger.error(e);
      return {error: e};
    }

    const newBatch = getFirestore().batch();

    for (const contact of providedContacts) {
      if (!contact.id) {
        return {
          success: false,
          message: "Each contact in the array must have a valid non-empty ID.",
        };
      }

      try {
        const contactDocRef = userContactsCollection.doc(String(contact.id));
        newBatch.set(contactDocRef, contact);
      } catch (e) {
        logger.error(e);
        return {error: e};
      }
    }

    await newBatch.commit();
    return {
      success: true,
      message: `Contacts for User with ID: ${userId} have been replaced.`,
    };
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});

exports.getUserContacts = onCall(async (request) => {
  const userId = request.data.userId;

  if (!userId) {
    return {
      success: false,
      message: "User ID must be provided in the query string.",
    };
  }

  try {
    const userDoc = await getFirestore().collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: `User with ID: ${userId} does not exist.`,
      };
    }

    const userContactsCollection = userDoc.ref.collection("contacts");

    const snapshot = await userContactsCollection.get();

    const contacts = snapshot.docs.map((doc) => doc.data());

    return {
      success: true,
      message: `Contacts for User with ID: ${userId} retrieved.`,
      data: contacts,
    };
  } catch (e) {
    logger.error(e);
    return {success: false, message: e};
  }
});
