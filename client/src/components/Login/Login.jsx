import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  async function handleLogin() {
    const reply = await axios.post("http://localhost:3001/login", {
      username,
      password,
    });
    if (reply.data.error === undefined) {
      const token = reply.data.token;
      localStorage.setItem("token", token);
      window.location.replace("/");
    } else alert(reply.data.error);
  }
  return (
    <div className="center">
      <br></br>
      <br></br>
      <h2>Enter your username and password</h2>
      <br></br>
      <input
        placeholder="username"
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      ></input>
      <br></br>
      <input
        placeholder="password"
        type={"password"}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></input>
      <br></br>
      <button type="submit" onClick={() => handleLogin()}>
        Login
      </button>
      <br></br>
      Not Registered?
      <span className="clickable" onClick={() => navigate("/pages/register")}>
        Register
      </span>
    </div>
  );
}

export default Login;
