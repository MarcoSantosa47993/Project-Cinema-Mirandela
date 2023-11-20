import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import "./stylesheets/alinhamento.css"
import "./stylesheets/tamanhos.css"
import "./stylesheets/form-elements.css"
import "./stylesheets/padrao.css"
import "./stylesheets/temas.css"
import ProtectedRoute from './components/ProtectedRoute';
import { useSelector } from 'react-redux';
import PaginaFilme from './pages/MovieSessoes/paginafilme';
import MovieSessoes from './pages/MovieSessoes/MovieSessoes';
import BookSessao from './pages/BookShow';
import BookSessao2 from './pages/BookShow/index2';
import Func from './pages/Funcionario';
import ResetarSenha from './pages/Admin/RedefinirSenha/ResetarSenha';
import ApoioCliente from './pages/Apoio/ApoioCliente';

function App() {
  const { loading } = useSelector((state) => state.loaders)
  return (
    
    <div>
      {loading && <div className="loader-parent">
        <div className="loader"></div>
      </div>}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/movie/MovieSessoes/:id' element={<ProtectedRoute><MovieSessoes /></ProtectedRoute>} />
          <Route path='/movie/paginafilme/:id' element={<ProtectedRoute><PaginaFilme /></ProtectedRoute>} />
          <Route path='/book-sessao/:id' element={<ProtectedRoute><BookSessao /></ProtectedRoute>} />
          <Route path='/book-sessao2/:id' element={<ProtectedRoute><BookSessao2 /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path='/admin' element={<ProtectedRoute><Admin /></ProtectedRoute>}/>
          <Route path='/func' element={<ProtectedRoute><Func /></ProtectedRoute>}/>
          <Route path='/reset' element={<ResetarSenha />}/>
          <Route path='/apoio/:nome/:email/:userId' element={<ProtectedRoute><ApoioCliente></ApoioCliente></ProtectedRoute>}/>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
