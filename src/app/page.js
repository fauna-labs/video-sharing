'use client'
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Client, fql } from "fauna";
import { useRouter } from 'next/navigation';
import VideoList from './VideoList';
import styles from  './page.module.css';

export default function Home() {

  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [sharedVideos, setSharedVideos] = useState([]);
  const [authoredVideos, setAuthoredVideos] = useState([]);


  useEffect(() => {
    setIsClient(true); // we're on the client, update the state
    const data = localStorage?.getItem("video-sharing-app");
    setUserInfo(data ? JSON.parse(data) : null);
  }, []);

  const client = new Client({
    secret: userInfo ? userInfo.key : process.env.NEXT_PUBLIC_FAUNA_KEY
  });

  useEffect(() => {
    client.query(fql`
      let user = User.byId("368374186628874313")
      let authoredVideos = Video.where(.author == user)
      let sharedWithUser = Permission.where(.user == user) {
        video {
          id,
          title
        }
      }
      let result = {
        shared_videoes: sharedWithUser,
        authored_videos: authoredVideos
      }
      result
    `).then((response) => {
      setSharedVideos(response.data.shared_videoes.data.map((item) => item.video))
      setAuthoredVideos(response.data.authored_videos.data)
    }).catch((error) => {})
  }, [userInfo]);

  const logout = () => {
    window.localStorage.removeItem("video-sharing-app");
    router.push("/login")
  }

  if (!isClient) {
    return <div>Loading...</div>
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
            <VideoList videos={authoredVideos} title="Your Videos" />
            <VideoList videos={sharedVideos} title="Videos Shared With You" />
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
