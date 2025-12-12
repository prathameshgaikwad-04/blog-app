import React, { useRef, useState } from "react";

const wrapSelection = (el, pre, suf) => {
  const s = el.selectionStart, e = el.selectionEnd;
  const t = el.value;
  el.value = t.slice(0,s) + pre + t.slice(s,e) + suf + t.slice(e);
  el.selectionStart = s + pre.length; el.selectionEnd = s + pre.length + (e - s);
  el.focus();
};

export default function PostForm({ initialValues = {title:"", body:"", media:[]}, onSubmit, submitLabel="Send" }){
  const [title,setTitle]=useState(initialValues.title);
  const [body,setBody]=useState(initialValues.body);
  const [media,setMedia]=useState(initialValues.media || []);
  const ta = useRef();

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    const converted = await Promise.all(files.map(f=> new Promise((res,rej)=>{
      const r = new FileReader(); r.onload = ()=> res({ data: r.result, mimeType: f.type }); r.onerror=rej; r.readAsDataURL(f);
    })));
    setMedia(prev => [...prev, ...converted]);
  };

  const removeMedia = (i)=> setMedia(prev=> prev.filter((_,idx)=> idx!==i));

  return (
    <form onSubmit={(ev)=> { ev.preventDefault(); onSubmit({ title, body, media }); }}>
      <div className="form-field">
        <label>Title</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>
      <div className="form-field">
        <label style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>Body
          <div className="format-toolbar">
            <button type="button" className="format-btn" onClick={()=> { wrapSelection(ta.current, "**", "**"); setBody(ta.current.value); }}>B</button>
            <button type="button" className="format-btn" onClick={()=> { wrapSelection(ta.current, "_", "_"); setBody(ta.current.value); }}>I</button>
            <button type="button" className="format-btn" onClick={()=> { wrapSelection(ta.current, "<u>", "</u>"); setBody(ta.current.value); }}>U</button>
          </div>
        </label>
        <textarea ref={ta} className="input" rows={8} value={body} onChange={e=>setBody(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>Multimedia</label>
        <input type="file" accept="image/*,video/*" multiple onChange={handleFile} />
        <div className="media-preview">{media.map((m,i)=> (<div key={i} style={{position:"relative"}}>{ m.mimeType.startsWith("image")? <img src={m.data} alt="" /> : <video src={m.data} controls/> }<button type="button" onClick={()=> removeMedia(i)}>x</button></div>))}</div>
      </div>

      <div style={{display:"flex",gap:8}}><button className="primary" type="submit">{submitLabel}</button></div>
    </form>
  );
}



