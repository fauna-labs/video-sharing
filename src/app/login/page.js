'use client'
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Client, fql } from "fauna";
import styles from '../signup/page.module.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const client = new Client({
    secret: process.env.NEXT_PUBLIC_FAUNA_KEY
  });

  const [invalidPassword, setInvalidPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    client.query(fql`Login(${email}, ${password})`)
    .then((response) => {
        console.log('response', response.data)
        if (!response.data?.user) {
            setInvalidPassword(true)
        }
        const userInfo = {
            email: response.data.user.email,
            id: response.data.user.id,
            key: response.data.cred.secret
        }
        window.localStorage.setItem("video-sharing-app", JSON.stringify(userInfo));
        router.push("/")
    })
    .catch((error) => {
        console.log('error', error)
        setInvalidPassword(true)
    })
  };

  const redirectToSignup = (e) => {
    e.preventDefault();
    router.push("/signup")
  }

  return (
    <div className={styles.wrapContainer}>
      <h3 className={styles.h3}>Log In</h3>
      <form onSubmit={handleSubmit} className={styles.formStyle}>
        <label className={styles.label}>E-mail</label>
        <input type="email" value={email} onChange={handleEmailChange} required className={styles.inputStyle}/>
        <label className={styles.formStyle}>Password</label>
        <input type="password" value={password} onChange={handlePasswordChange} required className={styles.inputStyle}/>
        <button type="submit" className={styles.button}>Submit</button>
      </form>

      <div className={styles.bottomContainer}>
        <p className={styles.p}>Don't have an account?</p>
        <button onClick={redirectToSignup} className={styles.buttonSecondary}>Sign Up</button>
      </div>
    </div>
  );
}