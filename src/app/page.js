'use client'
import { useState, useEffect } from "react";
import { Client, fql } from "fauna";

export default function Home() {

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

  return (
    <>    
      <div>
        Hello World
      </div>
    </>

  );
}
