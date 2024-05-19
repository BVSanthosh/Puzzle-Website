import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/admin.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function register() {
  
  const router = useRouter();

  const [userRegistration, setUserRegistration] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleUsernameChange = (event) => {
    setUserRegistration({...userRegistration, username: event.target.value});
  }

  const handleEmailChange = (event) => {
    setUserRegistration({...userRegistration, email: event.target.value});
  }

  const handlePasswordChange = (event) => {
    setUserRegistration({...userRegistration, password: event.target.value});
  }

  const handleSubmit = async(event) => {
    event.preventDefault();

    if (!userRegistration.username) {
      alert('Please enter your username.');
      return false;
    }

    if (!userRegistration.email) {
      alert('Please enter your email.');
      return false;
    }

    if (!userRegistration.password) {
      alert('Please enter your password.');
      return false;
    }

    const res = await fetch(`api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: userRegistration.username, email: userRegistration.email, password: userRegistration.password}),
    }).then((r) => r.json())

    if(res.user_uuid){
      redirect();
    }
    else{
      alert("User has already been registered");
    }
  }

  function redirect(){
    router.push('/login');
  }

  return(
      <div className={styles.container}>
        <title>Register</title>

        <nav class="navbar sticky-top" style={{backgroundImage: "linear-gradient(160deg, #ea730f 0%, #fcc300 100%)", boxShadow: "0px 0px 5px #9e8a67"}}>
        <div class="container-fluid">
          <span className={styles.logo}>
            <Link className={styles.icon} href="./">
              <Image  src="/favicon.png" alt="Logo" width={50} height={50} class="d-inline-block align-text-top"/>
            </Link>

            <Link href="./">
              <div className={styles.brand}>
              Solvesudo
              </div>
            </Link>
          </span>
        </div>
      </nav>

        <div className={styles.content_container_register}>
          <div className={styles.form_box}>
            <form className={styles.transparent_box} onSubmit={handleSubmit}>
              <h2 className={styles.heading}>Register</h2>
              <label>Username</label>
              <br />
              <input className={styles.form_inputs} onChange={handleUsernameChange} type="text" id="username" placeholder="Username" required />
              <br /><br />
              <label>Email Address</label>
              <br />
              <input className={styles.form_inputs} onChange={handleEmailChange} type="text" id="email" placeholder="Email" required />
              <br /><br />
              <label>Password</label>
              <br />
              <input className={styles.form_inputs} onChange={handlePasswordChange} type="Password" id="pass" placeholder="Password (8 characters minimum)" minLength="8" required />
              <br /><br />
              <input className={styles.sbutton} type="submit" name="log" id="submit-register" value="Register" />
            </form>
          </div>
          <Link href="./login" legacyBehavior>
            <a className={styles.form_link}>Already have an account? Click here to login</a>
          </Link>
        </div>
      </div>
    )
  };
  
