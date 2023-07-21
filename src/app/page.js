'use client'
import { useState, useEffect } from "react";
import { Client, fql } from "fauna";
import { useRouter } from 'next/navigation';

export default function Home() {

  const router = useRouter();

  const client = new Client({
    secret: process.env.NEXT_PUBLIC_FAUNA_KEY
  });

  useEffect(() => {
    client.query(fql`
      User.all()
    `).then((response) => {
      console.log('response', response.data.data)
    })
  }, []);

  const logout = () => {
    window.localStorage.removeItem("video-sharing-app");
    router.push("/login")
  }

  return (
    <>    
      <button onClick={logout}>Logout</button>
      <div>
        Hello World
      </div>
    </>

  );
}
