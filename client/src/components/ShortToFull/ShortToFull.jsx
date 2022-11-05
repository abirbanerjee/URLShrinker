import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function Child() {
  let { shortURL } = useParams();
  const [fetchedURL, setFetchedURL] = useState("");
  useEffect(() => {
    async function fetchData() {
      const reply = await axios.get(`http://localhost:3001/${shortURL}`);
      console.log(reply.data.fullURL.fullURL);
      setFetchedURL(await reply.data.fullURL.fullURL);
      window.location.replace(await reply.data.fullURL.fullURL);
    }
    fetchData();
  }, []);
  return;
}

export default Child;
