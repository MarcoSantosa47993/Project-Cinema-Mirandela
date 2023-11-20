import React from 'react'
import Historico from './Historico'
import {Tabs} from 'antd'
import EstatisticasGerais from './EstatisticasGerais'
import HistoricoBilhetes from './HistoricoBilhetes'

function HistoricoSessoes() {
  return (
    
        <div>
          
          
            
          <Tabs defaultActiveKey="1">~
             <Tabs.TabPane tab="Sessões" key="1"><Historico></Historico></Tabs.TabPane>
             <Tabs.TabPane tab="Bilhetes" key="2"><HistoricoBilhetes></HistoricoBilhetes></Tabs.TabPane>
             <Tabs.TabPane tab="Estatistica" key="3"><EstatisticasGerais></EstatisticasGerais></Tabs.TabPane>
          </Tabs>
        </div>
      )
  
}

export default HistoricoSessoes
