'use client'
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Client, fql } from "fauna";
import styles from  './page.module.css';


/** This component does the following:
 * 1. Get video
 * 2. Check if video owner
 *  - if owner, show the video
 *  - if not owner, check if video is shared with user
 * 3. Check if video is shared with user
 *  - if shared, show the video
 *  - if not shared, show error message "You do not have permission to view this video"
 */

export default function VideoPage() {
    const router = useRouter();
    const { id } = useParams();
    const userInfo = JSON.parse(localStorage.getItem("video-sharing-app"));
    const client = new Client({
        secret: userInfo ? userInfo.key : process.env.NEXT_PUBLIC_FAUNA_KEY
    });
    const [canSeeContent, setCanSeeContent] = useState(false);
    const [video, setVideo] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [email, setEmail] = useState("");

    if(!userInfo) {
        return (
            <div>
                <p>Please Log In</p>
                <button onClick={() => router.push("/login")}>Log In</button>
            </div>
        )
    }

    useEffect(() => {
        videoVisibility();
    }, [id]);

    const videoVisibility = () => {
        client.query(fql`
            let video = Video.byId(${id})
            let user = User.byId(${userInfo.id})
            let permission = Permission.where(.user == user && .video == video)
            
            let result = {
                video: video,
                permission: permission,
                is_owner: video.author == user
            }

            result
        `).then((response) => {
            console.log('response', response.data)
            if (response.data.is_owner || response.data.permission.data.length > 0) {
                setCanSeeContent(true)
                setVideo(response.data.video)
                setIsOwner(response.data.is_owner)
            }
        })
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleShareFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await client.query(fql`
                let video = Video.byId(${id})
                let user = User.where(.email == ${email}).first()
                Permission.create({
                    user: user,
                    video: video
                })
            `)
            alert('Video shared successfully')
            setEmail("")
        } catch (error) {
            alert('There was an error sharing your video')
        }
    }

    if (canSeeContent) {
        return (
            <div className={styles.main}>
                <h1>{video.title}</h1>
                <video controls width="600px" height="300px" src={`https://backend.shadidhaque2014.workers.dev/${video.id}`} />
                <hr />
                {
                    isOwner && (
                        <div>
                            <form onSubmit={handleShareFormSubmit}>
                                <label htmlFor="email">Share with:</label> 
                                <br />
                                <input type="email" value={email} onChange={handleEmailChange} />
                                <button type="submit">Share</button>
                            </form>
                        </div>
                    )
                }
            </div>
        )
    }
    
}