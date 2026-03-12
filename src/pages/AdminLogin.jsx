import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("פרטי התחברות שגויים");
    else navigate('/admin'); // מעבר לדשבורד אחרי הצלחה
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">כניסת מנהל - נר ליה</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <input 
          type="email" placeholder="אימייל" 
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="סיסמה" 
          className="w-full p-2 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          התחבר למערכת
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;