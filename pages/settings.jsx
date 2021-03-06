import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useCurrentUser } from '@/hooks/index';

const ProfileSection = () => {
  const [user, { mutate }] = useCurrentUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const nameRef = useRef();
  const bioRef = useRef();
  const profilePictureRef = useRef();
  const [msg, setMsg] = useState({ message: '', isError: false });

  useEffect(() => {
    nameRef.current.value = user.name;
    bioRef.current.value = user.bio;
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    const formData = new FormData();
    if (profilePictureRef.current.files[0]) { formData.append('profilePicture', profilePictureRef.current.files[0]); }
    formData.append('name', nameRef.current.value);
    formData.append('bio', bioRef.current.value);
    const res = await fetch('/api/user', {
      method: 'PATCH',
      body: formData,
    });
    if (res.status === 200) {
      const userData = await res.json();
      mutate({
        user: {
          ...user,
          ...userData.user,
        },
      });
      setMsg({ message: 'Profile updated' });
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
    setIsUpdating(false);
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    const body = {
      oldPassword: e.currentTarget.oldPassword.value,
      newPassword: e.currentTarget.newPassword.value,
    };
    e.currentTarget.oldPassword.value = '';
    e.currentTarget.newPassword.value = '';

    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      setMsg({ message: 'Password updated' });
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  };

  async function sendVerificationEmail() {
    const res = await fetch('/api/user/email/verify', {
      method: 'POST',
    });
    if (res.status === 200) {
      setMsg({ message: 'An email has been sent to your mailbox' });
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  }

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <section>
        <h2>Seu cadastro</h2>
        {msg.message ? <p style={{ color: msg.isError ? 'red' : '#0070f3', textAlign: 'center' }}>{msg.message}</p> : null}
        <form onSubmit={handleSubmit}>
          {!user.emailVerified ? (
            <p>
              Seu e-mail ainda não foi verificado.
              {' '}
              {/* eslint-disable-next-line */}
                <a role="button" onClick={sendVerificationEmail}>
                  Verificar e-mail
                </a>
            </p>
          ) : null}
          <label htmlFor="name">
            Name
            <input
              required
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              ref={nameRef}
            />
          </label>
          <label htmlFor="bio">
          Fale um pouco mais sobre você
            <textarea
              id="bio"
              name="bio"
              type="text"
              placeholder="Fale um pouco mais sobre você"
              ref={bioRef}
            />
          </label>
          <label htmlFor="avatar">
            Profile picture
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/png, image/jpeg"
              ref={profilePictureRef}
            />
          </label>
          <button disabled={isUpdating} type="submit">Salvar</button>
        </form>
        <form onSubmit={handleSubmitPasswordChange}>
          <label htmlFor="oldpassword">
            Senha antiga
            <input
              type="password"
              name="oldPassword"
              id="oldpassword"
              required
            />
          </label>
          <label htmlFor="newpassword">
            Nova senha
            <input
              type="password"
              name="newPassword"
              id="newpassword"
              required
            />
          </label>
          <button type="submit">Mudar senha</button>
        </form>
      </section>
    </>
  );
};

const SettingPage = () => {
  const [user] = useCurrentUser();

  if (!user) {
    return (
      <>
        <p>Acessar</p>
      </>
    );
  }
  return (
    <>
      <h1>Configurações</h1>
      <ProfileSection />
    </>
  );
};

export default SettingPage;
