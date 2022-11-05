import UserRegistration from "./components/UserRegistration/UserRegistration";
import Login from "./components/Login/Login";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [URLColl, setURLColl] = useState([]);
  const [shrinked, setShrinked] = useState("");
  const [qrc, setQrc] = useState("");

  function handleLogout() {
    localStorage.clear();
    window.location.reload();
  }
  useEffect(() => {
    async function getuser(token) {
      const options = { headers: { token } };
      const reply = await axios.post("http://localhost:3001/web/", options);

      setUser(await reply.data.reply);

      setURLColl(await reply.data.reply.fullColl.reverse());
    }
    const token = localStorage.getItem("token");
    if (token !== null) {
      getuser(token);
    }
  }, []);
  function Home() {
    return (
      <div className="home">
        <span className="hello">
          {user.fname !== undefined ? (
            <div>
              Welcome, {user.fname}{" "}
              <span
                className="remove"
                onClick={() => {
                  handleLogout();
                }}
              >
                {" "}
                [Logout]
              </span>{" "}
            </div>
          ) : (
            <span
              onClick={
                user.fname === undefined
                  ? () => navigate("/login")
                  : () => handleLogout()
              }
              className="remove"
            >
              {user.fname === undefined ? "Login" : "Logout"}
            </span>
          )}
        </span>
        <span
          className="logo remove"
          onClick={() => {
            navigate("/");
          }}
        >
          Shrinker
        </span>
      </div>
    );
  }
  function RegisterURL() {
    const [enteredURL, setEnteredURL] = useState("");
    async function handleSubmit() {
      let result;
      if (enteredURL !== "") {
        if (user.username === undefined) {
          result = await axios.post("http://localhost:3001/registerURL", {
            fullURL: enteredURL,
          });
        } else {
          const username = user.username;
          result = await axios.post("http://localhost:3001/registerURL", {
            fullURL: enteredURL,
            username,
          });
        }
        setShrinked(`http://localhost:3001/${result.data.shortURL}`);
        setQrc(result.data.qrcode);
      } else {
        alert("Please enter a valid url");
      }
      async function getuser(token) {
        const options = { headers: { token } };
        const reply = await axios.post("http://localhost:3001/web/", options);
        // setUser(reply.data.reply);
        setURLColl(reply.data.reply.fullColl.reverse());
      }
      const token = localStorage.getItem("token");
      if (token !== null) {
        getuser(token);
      }
    }

    return (
      <div className="center">
        <br></br>
        <br></br>

        <h2 className="bannerText center">
          Enter the link below and click shrink
        </h2>
        <label className="prompts">Enter the full URL to be shrinked:</label>
        <br></br>
        <input
          type={"text"}
          onChange={(e) => setEnteredURL(e.target.value)}
        ></input>
        <button
          onClick={() => {
            handleSubmit();
          }}
        >
          Shrink
        </button>
        <a href={shrinked}>
          <h3>{shrinked}</h3>
        </a>
        {qrc && <img src={qrc} alt="qr code of the link"></img>}
      </div>
    );
  }
  async function removeHandler(e) {
    const shortURL = e.target.id;
    const username = user.username;
    await axios.post("http://localhost:3001/removeuserurl", {
      username,
      shortURL,
    });
    const token = localStorage.getItem("token");
    const options = { headers: { token } };
    const reply = await axios.post(" http://localhost:3001/web/", options);
    setURLColl(reply.data.reply.fullColl.reverse());
  }

  async function visitHandler(e) {
    const token = localStorage.getItem("token");
    const options = { headers: { token } };
    const reply = await axios.post("http://localhost:3001/web/", options);
    setURLColl(await reply.data.reply.fullColl.reverse());
  }
  return (
    <>
      <Home />
      <div className="App">
        <Routes>
          <Route path="/" element={<RegisterURL />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pages/register" element={<UserRegistration />} />
        </Routes>
        <h5 className="center">{user.fname && "Your URLs:"}</h5>
        {user.fullColl && (
          <table className="center">
            <tr>
              <th>{URLColl && "Full URL"}</th>
              <th>{URLColl && "Shortened URL"}</th>
              <th>Clicks</th>
              <th>QR Code</th>
              <th></th>
            </tr>

            {URLColl &&
              URLColl.map((coll, index) => (
                <tr>
                  <td>{coll.fullURL.fullURL}</td>
                  <td key={index}>
                    <a
                      href={"http://localhost:3001/" + coll.shortURL}
                      onMouseDown={(e) => visitHandler(e)}
                    >
                      {"http://localhost:3001/" + coll.shortURL}
                    </a>
                  </td>
                  <td>{coll.fullURL.clickCount}</td>
                  <td>
                    <img
                      alt="qr code click to enlarge"
                      height="80px"
                      src={coll.fullURL.qrcode}
                      onClick={() => {
                        const qrwindow = window.open(
                          "",
                          "QRCode",
                          "width=250 height=250"
                        );
                        qrwindow.document.write(
                          `<img height="200px" width="200px" src=${coll.fullURL.qrcode}></img>`
                        );
                      }}
                    ></img>
                  </td>
                  <td
                    className="remove"
                    onClick={(e) => removeHandler(e)}
                    id={coll.shortURL}
                  >
                    Remove
                  </td>
                </tr>
              ))}
          </table>
        )}
      </div>
    </>
  );
}

export default App;
