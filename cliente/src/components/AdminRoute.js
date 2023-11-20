import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Este middleware verifica se o usuário é administrador antes de permitir o acesso
function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      // Se o usuário não for um administrador, redirecione para outra página
      navigate('/'); // Pode ser a página de login ou qualquer outra
    }
  }, [user, navigate]);

  // Renderize o conteúdo da rota se o usuário for um administrador
  return user && user.isAdmin ? children : null;
}

export default AdminRoute;