import { useEffect, useState } from "react";
import api from "../api";
import { useParams } from "react-router-dom";

const calcStreaks = (posts) => {
  // posts: array with createdAt ISO strings sorted desc
  const days = new Set(posts.map(p => new Date(p.createdAt).toISOString().slice(0,10)));
  // show last 14 days squares
  const result = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    result.push({ day: key, active: days.has(key) });
  }
  return result;
}

const UserAccount = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [streakDays, setStreakDays] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const meRes = await api.get("/auth/me"); // requires login
        setUser(meRes.data);
        const postsRes = await api.get(`/posts/user/${meRes.data._id}`);
        setPosts(postsRes.data);
        setStreakDays(calcStreaks(postsRes.data));
      } catch (err) {
        console.error(err);
      }
    }
    fetch();
  }, [userId]);

  if (!user) return <p>Loading account...</p>;

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700}}>{user.username}</div>
          <div className="small">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div className="title">Your stats</div>
        <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
          <div>
            <div style={{fontWeight:700,fontSize:20}}>{posts.length}</div>
            <div className="small">posts</div>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:20}}>{streakDays.filter(s=>s.active).length}</div>
            <div className="small">in last 14 days</div>
          </div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div className="title">14-day activity</div>
        <div className="streak-grid" style={{marginTop:8}}>
          {streakDays.map((d,i)=>(
            <div key={d.day} className={`streak-day ${d.active ? 'active' : ''}`} title={d.day} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
