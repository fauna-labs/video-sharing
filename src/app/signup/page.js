'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO - create user in Fauna
  };

  const redirectToLogin = (e) => {
    e.preventDefault();
    router.push("/login")
  }

  return (
    <div className={styles.wrapContainer}>
      <h3 className={styles.h3}>Sign Up</h3>
      <form onSubmit={handleSubmit} className={styles.formStyle}>
        <label className={styles.label}>E-mail</label>
        <input type="email" value={email} onChange={handleEmailChange} required className={styles.inputStyle}/>
        <label className={styles.label}>Password</label>
        <input type="password" value={password} onChange={handlePasswordChange} required className={styles.inputStyle}/>
        <button type="submit" className={styles.button}>Submit</button>
      </form>

      <div className={styles.bottomContainer}>
        <p className={styles.p}>Already have an account?</p>
        <button onClick={redirectToLogin} className={styles.buttonSecondary}>Log In</button>
      </div>
    </div>
  );
}