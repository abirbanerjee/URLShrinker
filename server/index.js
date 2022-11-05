require("dotenv").config();
const path = require("path");
const jwt = require("jsonwebtoken");
const randomString = require("random-string-gen");
const cors = require("cors");
const database = require("./DataBaseFuncts");
const bcrypt = require("bcrypt");
const express = require("express");
const tokenSecret = process.env.token_secret;
const app = express();
app.use(cors());
app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

app.get("/allrecs", async (req, res) => {
  const reply = await database.allRecs();
  return res.json({ reply });
});

app.get("/urls/:shortURL", async (req, res) => {
  const { shortURL } = req.params;
  console.log(shortURL);
  // const reply = await database.shortToFull(shortURL);
  const reply = await database.redirectionFetch(shortURL);

  return res.json({ fullURL: reply });
});

app.post("/registerURL", async (req, res) => {
  const { fullURL, username } = req.body;
  let newfullURL = "";
  let proper = false;
  if (fullURL.startsWith("http://")) {
    proper = true;
  } else if (fullURL.startsWith("https://")) {
    newfullURL = "http://" + fullURL.replace("https://", "");
    proper = true;
  }
  if (!proper) {
    newfullURL = "http://" + fullURL;
  }
  let shortURL = randomString(6);
  const status = await database.fullToShort(newfullURL, shortURL, username);
  const statusCheck = (status) => {
    if (status.status === 0) {
      const qrcode = status.qrcode;
      return res.json({ shortURL, qrcode });
    } else if (status === 2) {
      shortURL = randomString(6);
      const newStatus = database.fullToShort(newfullURL, shortURL);
      statusCheck(newStatus);
    } else {
      const shortURL = status.shortURL;
      const qrcode = status.qrcode;
      return res.json({ shortURL, qrcode });
    }
  };
  statusCheck(status);
});

app.get("/:shortURL", async (req, res) => {
  console.log("redirecting..");
  const { shortURL } = req.params;
  try {
    const reply = await database.redirectionFetch(shortURL);
    if (reply !== null) res.redirect(reply.fullURL);
    else res.redirect("http://localhost:3000");
  } catch (e) {
    console.log(e);
  }
});

app.post("/userregistration", async (req, res) => {
  const { fname, lname, username, password, email } = req.body;
  const salt = await bcrypt.genSalt();
  const encryptedPassword = await bcrypt.hash(password, salt);
  const reply = await database.registerUser(
    fname,
    lname,
    username,
    encryptedPassword,
    email
  );
  if (reply.acknowledged) return res.send("ok");
  else return res.send("already registered");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const reply = await database.login(username, password);
  if (reply == 2) {
    return reply.json({ error: "Invalid username." });
  } else {
    if (await bcrypt.compare(password, reply.password)) {
      const token = jwt.sign(username, tokenSecret);
      return res.json({ token });
    } else {
      return res.json({ error: "Wrong password." });
    }
  }
});

app.post("/web", async (req, res) => {
  try {
    const username = jwt.verify(req.body.headers.token, tokenSecret);
    const reply = await database.userCheck(username);
    if (reply !== null) {
      const shortColl = reply.shortColl;
      const fullColl = [];
      for (let i = 0; i < shortColl.length; i++) {
        const full = await database.shortToFull(shortColl[i]);
        const preparedJson = { shortURL: shortColl[i], fullURL: full };
        fullColl.push(preparedJson);
      }
      delete reply.shortColl;
      delete reply.password;
      reply.fullColl = fullColl;
      return res.json({ reply });
    }
  } catch (e) {
    // console.log(e);
    return res.redirect("http://localhost:3000");
  }
});

app.post("/removeuserurl", async (req, res) => {
  const { username, shortURL } = req.body;
  console.log(username, shortURL);
  await database.removeUserUrl(username, shortURL);
  return res.json({ status: "ok" });
});
