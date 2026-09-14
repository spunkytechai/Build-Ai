'use client';

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (result.error) throw result.error;
      if (mode === "signup") {
        setMessage("Account created. Check your email to confirm your address.");
      } else {
        window.location.assign("/dashboard");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f6f9fc"}}>
      <section style={{width:"100%",maxWidth:440,background:"white",border:"1px solid #dfe8f3",borderRadius:20,padding:32,boxShadow:"0 20px 60px #173c6414"}}>
        <a href="/" style={{fontWeight:800,fontSize:24,color:"#173c64",textDecoration:"none"}}>Build Ai</a>
        <h1 style={{fontSize:30,margin:"28px 0 8px",color:"#173c64"}}>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p style={{color:"#64748b",margin:"0 0 24px"}}>{mode === "signin" ? "Sign in to continue your building projects." : "Start designing with Build Ai."}</p>
        <form onSubmit={submit} style={{display:"grid",gap:14}}>
          <label style={{display:"grid",gap:7,fontWeight:650}}>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/></label>
          <label style={{display:"grid",gap:7,fontWeight:650}}>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle}/></label>
          <button disabled={busy} type="submit" style={{marginTop:8,padding:"13px 16px",border:0,borderRadius:10,background:"#173c64",color:"white",fontWeight:750,cursor:"pointer"}}>{busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}</button>
        </form>
        {message && <p role="status" style={{marginTop:18,color:"#475569"}}>{message}</p>}
        <button onClick={()=>{setMode(mode === "signin" ? "signup" : "signin");setMessage("")}} style={{marginTop:20,border:0,background:"transparent",color:"#1769aa",fontWeight:700,cursor:"pointer"}}>{mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}</button>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = { width:"100%",boxSizing:"border-box",padding:"12px 13px",border:"1px solid #cbd5e1",borderRadius:9,fontSize:15,outline:"none" };
