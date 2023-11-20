import React from 'react'
import PageTitle from '../../components/PageTitle'
import {Tabs} from 'antd'
import Movies from './Movies'
import Cinema from './Cinema'
import Funcionarios from './Funcionarios'
import Historico from './Historico'
import HistoricoSessoes from './HistoricoSessoes'


function Admin() {

    // Estado para armazenar o nome do perfil
    const [profileName, setProfileName] = React.useState('');

    // Simule a obtenção do token após o login
    const authToken = localStorage.getItem('token');
  
    React.useEffect(() => {
      // Simule a decodificação do token para obter as informações do perfil
      const decodedToken = decodeAuthToken(authToken);
  
      if (decodedToken && decodedToken.profileName) {
        setProfileName(decodedToken.profileName);
      }
    }, []);



  return (
    <div>
      
      <PageTitle title="Dashboard Administrador"/>
        
      <Tabs defaultActiveKey="1">~
         <Tabs.TabPane tab="Filmes" key="1"><Movies /></Tabs.TabPane>
         <Tabs.TabPane tab="Cinemas" key="2"><Cinema /></Tabs.TabPane>
         <Tabs.TabPane tab="Funcionários" key="3"><Funcionarios/></Tabs.TabPane>
         <Tabs.TabPane tab="Histórico " key="4"><HistoricoSessoes></HistoricoSessoes></Tabs.TabPane>
      </Tabs>
    </div>
  )
}


// Função para decodificar o token (exemplo genérico)
function decodeAuthToken(token) {
 
  try {
    // O token JWT é geralmente composto por três partes: cabeçalho, payload e assinatura.
    // Cada parte é separada por um ponto ('.').

    // Divida o token em partes
    const [headerEncoded, payloadEncoded] = token.split('.');

    // Decodifique a parte do payload (que contém os claims)
    const payload = JSON.parse(atob(payloadEncoded));

    // Retorne os claims do payload
    return payload;
  } catch (error) {
    console.error('Erro ao decodificar o token', error);
    return null;
  }
}

export default Admin
