import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { ShowLoading, HideLoading } from '../../redux/loadersSlice';
import { GetAllSessoes, GetAllSessoesHistorico } from '../../apicalls/cinemas';
import { Chart, CategoryScale, LinearScale, BarController, BarElement,registerables } from 'chart.js';

function EstatisticasGerais() {
    const [sessao, setSessao] = React.useState([]);
    const [bilhetes,setBilhetes] = React.useState([])
    const [anoSelecionado, setAnoSelecionado] = React.useState(new Date().getFullYear());
    const dispatch = useDispatch();

    const getDataFunc = async () => {
        try {
            dispatch(ShowLoading());
            const response = await GetAllSessoes();
    
            if (response.success) {
                setSessao(response.data.sessao);
                setBilhetes(response.data.bilhetes)
            } else {
                message.error(response.message);
                dispatch(HideLoading());
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.response);
            dispatch(HideLoading());
        }
    };

    React.useEffect(() => {
        getDataFunc();
    }, [anoSelecionado]);

    React.useEffect(()=>{
        console.log("Olá Bilhetes ->" + JSON.stringify(bilhetes))
    },[bilhetes])

    React.useEffect(()=>{
        console.log("Olá Sessões ->" + JSON.stringify(sessao))
    },[sessao])
    const bilhetesValidos = bilhetes.filter(bilhete => bilhete.estado !== "Cancelado");
    // Filtra apenas os bilhetes que estão em estado "Validado" para calcular a média de lugares ocupados
    const bilhetesValidados = bilhetes.filter(bilhete => bilhete.estado === "Terminado");
    console.log("Bilhetes_Validados: " + bilhetesValidados.length)
    
    
        const totalLugaresOcupados = bilhetesValidados.reduce((acc, bilhete) => acc + bilhete.lugares.length, 0);
    console.log("TotalLugaresOcupados: " + totalLugaresOcupados)
        const mediaLugaresOcupados = bilhetesValidados.length ? totalLugaresOcupados / bilhetesValidados.length : 0; // Média calculada apenas com bilhetes "Validados"
  
    const filmesContagem = {};
     
    bilhetesValidos.forEach(bilhete => {
        const sessaoDoBilhete = sessao.find(s => s._id === bilhete.sessao);
        if (!sessaoDoBilhete) return;  // Skip se a sessão não for encontrada
        const nomeFilme = sessaoDoBilhete.filme.titulo;
        
        filmesContagem[nomeFilme] = (filmesContagem[nomeFilme] || 0) + 1;
    });
    
    const totalFaturadoGeral = bilhetesValidos.reduce((acc, bilhete) => {
        const sessaoDoBilhete = sessao.find(s => s._id === bilhete.sessao);
        return sessaoDoBilhete ? acc + (sessaoDoBilhete.precobilhete * bilhete.lugares.length) : acc;
    }, 0);
    
    const bilhetesAnoSelecionado = bilhetesValidos.filter(bilhete => new Date(bilhete.createdAt).getFullYear() === anoSelecionado);
    
    const totalFaturadoAno = bilhetesAnoSelecionado.reduce((acc, bilhete) => {
        const sessaoDoBilhete = sessao.find(s => s._id === bilhete.sessao);
        return sessaoDoBilhete ? acc + (sessaoDoBilhete.precobilhete * bilhete.lugares.length) : acc;
    }, 0);
    
    const filmesContagemAnual = {};
    
    bilhetesAnoSelecionado.forEach(bilhete => {
        const sessaoDoBilhete = sessao.find(s => s._id === bilhete.sessao);
        if (!sessaoDoBilhete) return;  // Skip se a sessão não for encontrada
        const nomeFilme = sessaoDoBilhete.filme.titulo;
        
        filmesContagemAnual[nomeFilme] = (filmesContagemAnual[nomeFilme] || 0) + 1;
    });
    
    const filmeMaisVistoAnual = Object.keys(filmesContagemAnual).reduce((a, b) => filmesContagemAnual[a] > filmesContagemAnual[b] ? a : b, ""); // Adicionado valor inicial
    
    // Inicializa arrays para armazenar o faturamento e bilhetes por mês
    const faturamentoMensal = new Array(12).fill(0);
    const bilhetesMensais = new Array(12).fill(0);
    
    // Para cada bilhete do ano selecionado, atualiza o faturamento e a quantidade de bilhetes por mês
    bilhetesAnoSelecionado.forEach(bilhete => {
        const sessaoDoBilhete = sessao.find(s => s._id === bilhete.sessao);
        if (!sessaoDoBilhete) return;  // Skip se a sessão não for encontrada
        const mes = new Date(bilhete.createdAt).getMonth(); // retorna o mês (0-11)
    
        faturamentoMensal[mes] += sessaoDoBilhete.precobilhete * bilhete.lugares.length;
        bilhetesMensais[mes] += 1;  // considerando que cada bilhete representa uma venda única
    });
 const filmeMaisVisto = Object.keys(filmesContagem).reduce((a, b) => filmesContagem[a] > filmesContagem[b] ? a : b, "");

 

    const data = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        datasets: [{
            label: 'Faturamento',
            data: faturamentoMensal,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',  // Explicitly defining the scale type
                beginAtZero: true
            }
        }
    };
    Chart.register(...registerables);

    return (
       
        <div> 
          <div style={{ padding: '20px 0' }}>
                <label>Selecione o ano: </label>
                <select value={anoSelecionado} onChange={e => setAnoSelecionado(Number(e.target.value))}>
                    {[...Array(11)].map((_, index) => (
                        <option key={index} value={2020 + index}>{2020 + index}</option>
                    ))}
                </select>
            </div>
    
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize:'16px' }}>
               <strong><span >Total faturado desde sempre: €{totalFaturadoGeral.toFixed(2).replace(".", ",")}</span></strong> 
               <strong><span>Total faturado em {anoSelecionado}: €{totalFaturadoAno.toFixed(2).replace(".", ",")}</span></strong> 
                <div>
             {/* <strong><span>  Filme mais visto (geral): {filmeMaisVistoGeral}</span></strong> */}
            </div>

            <div>
              <strong><span> Filme mais visto em {anoSelecionado}: {filmeMaisVistoAnual}</span></strong>
            </div>
            <div>
   <strong><span>Filme mais visto desde sempre: {filmeMaisVisto}</span></strong>
</div>
            <div>
            <strong><span>Média de lugares ocupados: {mediaLugaresOcupados.toFixed(2)}</span></strong>
            </div>
            </div>
    
            <div style={{ maxWidth: '800px', height: '400px', margin: '40px auto' }}>
                <Bar data={data} options={options} />
           </div>  
        </div>
                 );

                 
}

export default EstatisticasGerais;