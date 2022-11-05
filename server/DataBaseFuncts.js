const { MongoClient } = require("mongodb");
const QRCode = require("qrcode");
require("dotenv").config();
const client = new MongoClient(process.env.URI);
client.connect((err) => {
  console.log("Connected");
});
const db = client.db("urlshortener");
const URLColl = db.collection("urls");
const userColl = db.collection("users");

const allRecs = async () => {
  const recs = await URLColl.find().toArray();
  return recs;
};

const shortToFull = async (shortURL) => {
  const url = await URLColl.findOne({ shortURL });
  return url;
};

const redirectionFetch = async (shortURL) => {
  const url = await URLColl.findOne({ shortURL });
  if (url !== null) {
    let clickCount = url.clickCount;
    if (clickCount === undefined) clickCount = 1;
    else clickCount = clickCount + 1;
    await URLColl.updateOne({ shortURL }, { $set: { clickCount } });
    return url;
  } else return null;
};

const fullToShort = async (fullURL, shortURL, username) => {
  //status 0=success, 1=URL exists, 2 = shortcut exists.
  const searchExisting = await URLColl.findOne({ fullURL });
  if (searchExisting === null) {
    const searchShortCut = await URLColl.findOne({ shortURL });
    if (searchShortCut !== null) {
      return 2;
    }
    const qrcode = await QRCode.toDataURL(`http://localhost:3000/${shortURL}`);
    await URLColl.insertOne({ fullURL, shortURL, qrcode, clickCount: 0 });
    if (username !== undefined) {
      const shortcutUser = (await userColl.findOne({ username })).shortColl;
      if (!shortcutUser.includes(shortURL)) {
        await userColl.updateOne(
          { username },
          { $push: { shortColl: shortURL } }
        );
      }
    }
    return { status: 0, qrcode };
  }
  const shortPush = await searchExisting.shortURL;
  if (username !== undefined) {
    const shortcutUser = (await userColl.findOne({ username })).shortColl;
    if (!shortcutUser.includes(shortPush)) {
      await userColl.updateOne(
        { username },
        { $push: { shortColl: shortPush } }
      );
    }
  }
  return await searchExisting;
};

const registerUser = async (fname, lname, username, password, email) => {
  const checkExisting = await userColl.findOne({
    $or: [{ username }, { email }],
  });
  if (checkExisting === null) {
    const reply = await userColl.insertOne({
      username,
      password,
      fname,
      lname,
      email,
      shortColl: [],
    });
    return reply;
  } else return checkExisting;
};

const login = async (username, password) => {
  //0. Successufully logged in, 1. Incorrect password, 2. Invalid username
  const fetchedUser = await userColl.findOne({ username });
  if (fetchedUser === null) {
    return 2;
  }
  return fetchedUser;
};

const userCheck = async (username) => {
  const user = await userColl.findOne({ username });
  if (user !== null) {
    return user;
  }
  return null;
};

const removeUserUrl = async (username, shortURL) => {
  await userColl.updateOne({ username }, { $pull: { shortColl: shortURL } });
  return;
};

module.exports = {
  allRecs,
  shortToFull,
  fullToShort,
  registerUser,
  login,
  userCheck,
  removeUserUrl,
  redirectionFetch,
};
