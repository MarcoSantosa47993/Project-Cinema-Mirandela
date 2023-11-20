import React from 'react'
import { Tabs } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import PageTitle from '../../components/PageTitle'
import Compras from './Compras'
import HistoricoBilhetes from '../../components/HistoricoBilhetes'

function Profile() {
  return (
    <div>
      <PageTitle title="Perfil" />

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Bilhetes" key="1">
       
         <Compras/>
        </Tabs.TabPane>
 <Tabs.TabPane tab="Historico" key="2"><HistoricoBilhetes></HistoricoBilhetes></Tabs.TabPane>
      </Tabs>



    </div >
  )
}

export default Profile
