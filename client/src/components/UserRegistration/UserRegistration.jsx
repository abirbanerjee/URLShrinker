import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserRegistration() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const handleSubmit = async () => {
    const reply = await axios.post("http://localhost:3001/userregistration", {
      username,
      password,
      email,
      fname,
      lname,
    });
    console.log(reply);
    window.location.replace("/");
  };
  return (
    <div className="center">
      <br></br>
      <br></br>
      <h2>Enter your registration details:</h2>
      <br></br>
      <input
        placeholder="First name"
        onChange={(e) => {
          setFname(e.target.value);
        }}
      ></input>
      <br></br>
      <input
        placeholder="Last name"
        onChange={(e) => {
          setLname(e.target.value);
        }}
      ></input>
      <br></br>
      <input
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      ></input>
      <br></br>
      <input
        placeholder="Username"
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      ></input>
      <br></br>
      <input
        placeholder="Password"
        type={"password"}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></input>
      <br></br>
      <button
        onClick={() => {
          handleSubmit();
        }}
      >
        Register
      </button>
      <br></br>
      Already Registered?
      <span
        className="clickable"
        onClick={() => {
          navigate("/login");
        }}
      >
        Login
      </span>
    </div>
  );
}

export default UserRegistration;
