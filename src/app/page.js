'use client'
import Link from 'next/link';
import { Client, fql } from "fauna";
import { useRouter } from 'next/navigation';
import styles from  './page.module.css';

export default function Home() {

  const router = useRouter();
  let userInfo = null;
  if (typeof window !== 'undefined') {
    userInfo = JSON.parse(localStorage?.getItem("video-sharing-app"));
  }

  const client = new Client({
    secret: userInfo ? userInfo.key : process.env.NEXT_PUBLIC_FAUNA_KEY
  });

  const logout = () => {
    window.localStorage.removeItem("video-sharing-app");
    router.push("/login")
  }

  return (
    <>    
      <div className={styles.pageContainer}>
        {userInfo ? (
          <>
            <div className={styles.topbar}>
              <span className={styles.h2}>
                Hello 👋, {userInfo.email}
              </span>
              <Link href="/record" className={styles.link}>
                <span >Record Video</span>
              </Link>

              <button onClick={logout} className={styles.logout}>log out?</button>
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.h1}>Welcome to VidShare 📹</h1>
            <p>Please Login or Signup to get started...</p>
            <Link href="/login">
              <button className={styles.button}>Login</button>
            </Link>
            <Link href="/signup">
              <button className={styles.button}>Signup</button>
            </Link>       
          </>
        )}
      </div>
    </>
  );
}
