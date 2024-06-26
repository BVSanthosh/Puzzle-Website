import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/admin.module.css';
import Image from 'next/image';
import Head from 'next/head';
import { setItem, getItem } from './localStorage';

export default function login() {

  const router = useRouter();
  const supergroupRef = useRef();

  const [userLogin, setUserLogin] = useState({
    username: "",
    password: "",
  });

  const handleUsernameChange = (event) => {
    setUserLogin({ ...userLogin, username: event.target.value });
  }

  const handlePasswordChange = (event) => {
    setUserLogin({ ...userLogin, password: event.target.value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userLogin.username) {
      alert('Please enter your username.');
      return false;
    }

    if (!userLogin.password) {
      alert('Please enter your password.');
      return false;
    }

    const res = await fetch(`api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: userLogin.username, password: userLogin.password }),
    }).then((r) => r.json())

    const token = res.token;

    if (token) {
      setItem('user', JSON.stringify(res));
      redirect();
    }
    else {
      alert('User has not been registered yet');
    }
  }

  function redirect(){
    router.push('/home'); 
  }

  function supergroupLogin(event) {
    event.preventDefault();
    const [other_id, link] = supergroupRef.current.value.split(' ');
    router.push({pathname: link, query: {client_id: 'aces-eight', redirect_url: `https://cs3099user08.host.cs.st-andrews.ac.uk/oauth/redirect/${other_id}`}})
  }

  return (
    <div className={styles.container}>
      <nav class="navbar sticky-top" style={{ backgroundImage: "linear-gradient(160deg, #ea730f 0%, #fcc300 100%)", boxShadow: "0px 0px 5px #9e8a67" }}>
        <div class="container-fluid">
          <span className={styles.logo}>
            <Link className={styles.icon} href="./">
              <Image src="/favicon.png" alt="Logo" width={50} height={50} class="d-inline-block align-text-top" />
            </Link>

            <Link href="./">
              <div className={styles.brand}>
              Solvesudo
              </div>
            </Link>
          </span>

        </div>
      </nav>

      <Head>
        <title>Login Page</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <title>Login</title>
      <div className={styles.content_container}>
        <div className={styles.form_box}>
          <form className={styles.transparent_box} onSubmit={handleSubmit}>
            <h2 className={styles.heading}>Login</h2>
            <label>Username</label>
            <br />
            <input className={styles.form_inputs} onChange={handleUsernameChange} type="text" id="username" placeholder="Username" value={userLogin.username} required/>
            <br /><br />
            <label>Password</label>
            <br />
            <input className={styles.form_inputs} onChange={handlePasswordChange} type="Password" id="pass" placeholder="Password (8 characters minimum)" value={userLogin.password} minLength="8" required/>
            <br /><br />
            <input className={styles.sbutton} type="submit" name="log" id="submit-login" value="Log In" />
          </form>
        </div>

        <div className={styles.content_container}>
          <div className={styles.form_box}>
            <form className={styles.transparent_box} onSubmit={supergroupLogin}>
              <h2 className={styles.heading}>Supergroup Login</h2>
              <label for="group">Choose a group:</label>
              <br></br>
              <br />
              <select name="group" id="group" ref={supergroupRef}>
                <option value="cs3099-g1 https://cs3099user01.host.cs.st-andrews.ac.uk/oauth/authorize">Group 1</option>
                <option value="aces_g2 https://cs3099user02.host.cs.st-andrews.ac.uk/oauth/authorize">Group 2</option>
                <option value="cs3099group03 https://cs3099user03.host.cs.st-andrews.ac.uk/oauth/authorize">Group 3</option>
                <option value="cs3099-g4 https://cs3099user04.host.cs.st-andrews.ac.uk/oauth/authorize">Group 4</option>
                <option value="aces5 https://cs3099user05.host.cs.st-andrews.ac.uk/oauth/authorize">Group 5</option>
                <option value="g6 https://cs3099user06.host.cs.st-andrews.ac.uk/oauth/authorize">Group 6</option>
                <option value="aces-g7 https://cs3099user07.host.cs.st-andrews.ac.uk/oauth/authorize">Group 7</option>
                <option value="aces-g9 https://cs3099user09.host.cs.st-andrews.ac.uk/oauth/authorize">Group 9</option>
              </select>
              <br /><br />
              <input className={styles.sbutton} type="submit" name="log" id="submit-login" value="Log In" />
            </form>
          </div>
        </div>
        </div>
        <Link href="./register" legacyBehavior>
            <a className={styles.form_link}>Don't have an account? Click here to register </a>
        </Link>
      </div>
      );
  }

