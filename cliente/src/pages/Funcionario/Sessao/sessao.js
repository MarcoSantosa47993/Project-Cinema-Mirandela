import React, { useEffect } from 'react'
import { Form, Col, Modal, Row, Table, message } from 'antd'
import Button from "../../../components/button"
import { useDispatch,useSelector } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loadersSlice'
import { GetAllMovies } from '../../../apicalls/movies'
import { AddSessao, DeleteCinema, GetAllSessoesbyCinema, GetAllSessoesbyCinemaFunc } from "../../../apicalls/cinemas"
import moment from "moment"
import { EliminarTodosBilhetes, GBilhetesFunc, GCompradores } from '../../../apicalls/bilhetes';
import { GetCompradores } from "../../../apicalls/bilhetes"
import AvisoBilhete from "../../../components/avisosessao"
import { GetCurrentUser } from '../../../apicalls/users';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';


function SessaoModal({openSessaoModal,setOpenSessaoModal,cinema}) {
    const [view, setview] = React.useState("table")
    const [sessao, setSessao] = React.useState()
    const [sessaoC, setSessaoC] = React.useState()
    const [bilhete , setBilhetes] = React.useState([])
    const [bilhetes , setBilhetess] = React.useState([])
    const [openCompradoresModal, setOpenCompradoresModal] = React.useState(false);
    const [selectedSessao = null, setSelectedSessao] = React.useState(null);
    const [openModalAvisoSessao = false,setopenModalAvisoSessao] = React.useState(false)
    const [movies, setMovies] = React.useState([])
    const [user, SetUser] = React.useState()
    const dispatch = useDispatch()
    const [searchTerm, setSearchTerm] = React.useState('');  // Novo estado para o termo de pesquisa

    const filteredTickets = bilhete.filter(
      ticket =>
        (ticket.estado === 'Comprado' || ticket.estado === 'Validado') &&
        ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    
   
    const getCurrentuser = async () => {
      try {
          dispatch(ShowLoading())
          const response = await GetCurrentUser();
          dispatch(HideLoading())
          if (response.success) {
              SetUser(response.data)
          }
          else {
            message.error(response.message)
        
          }
      } catch (error) {
          dispatch(HideLoading())

          message.error(error)
      }
  }



    const getData = async () => {
        try {
          dispatch(ShowLoading());
          const moviesResponse = await GetAllMovies();
          if (moviesResponse.success) {
            setMovies(moviesResponse.data);
          } else {
            message.error(moviesResponse.message)
          }
    
          const sessoesResponse = await GetAllSessoesbyCinemaFunc({
            cinemaId: cinema._id,
            funcionarioId: user._id
          })
          console.log(sessoesResponse)
          if (sessoesResponse.success) {
            setSessao(sessoesResponse.data.sessoes)
            setBilhetess(sessoesResponse.data.bilhetes)
            console.log(sessao)
          }
          else {
            message.error(sessoesResponse.message)
          }
    
          dispatch(HideLoading());
        } catch (error) {
          message.error(error.message)
          dispatch(HideLoading())
        }
      }

      const handleCompradores = async (values) => {
        try {
          dispatch(ShowLoading())
          console.log("Record -> " +values._id)
          const compradoresResponse = await GBilhetesFunc({ 
            sessaoId: values._id, 
            userId: user._id // Adicionando user._id aqui
          })
          if (compradoresResponse.success) {
            setBilhetes(compradoresResponse.data)
          }
          else {
            message.error(compradoresResponse.message)
          }
          dispatch(HideLoading())
        } catch (error) {
          message.error(error.message)
          dispatch(HideLoading())
        }
      }

      

      React.useEffect(() => {
        console.log(user)
    
      }, [user])

      React.useEffect(()=>{
        console.log("Sessão -> " + sessao)
      }, [sessao])
   

      React.useEffect(() => {
        getCurrentuser();
     
       
    
      }, [])



      useEffect(() => {
        console.log("Bilhetes" + JSON.stringify(bilhete));
      }, [bilhete]);
      
React.useEffect(() => {
  if (user) {  
      getData();
  }
}, [user]);

const generateAndPrintPDF = (record) => {
  const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
  });

  const valorEmEuros = selectedSessao.precobilhete;
  const valorFormatado = valorEmEuros.toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR',
  });

  const lineHeight = 10;
      const marginLeft = 10;
      let marginTop = 10;
      const imgWidth = 20;
      const imgHeight = 20;
      const pageWidth2 = doc.internal.pageSize.getWidth();
      const xPosition2 = pageWidth2 - imgWidth - 5;

  doc.setFontSize(12);
  doc.text('Detalhes do Bilhete:', marginLeft, marginTop);
  marginTop += lineHeight;

  // Add details
  doc.text('  - Cinema: ' + selectedSessao.cinema.nome, marginLeft, marginTop);
  marginTop += lineHeight;
  doc.text('  - Sessão: ' + selectedSessao.nome, marginLeft, marginTop);
  marginTop += lineHeight;
  doc.text('  - Filme: ' + selectedSessao.filme.titulo, marginLeft, marginTop);
  marginTop += lineHeight;
  doc.text('  - Total: ' + valorFormatado, marginLeft, marginTop);
  marginTop += lineHeight;
  marginTop += lineHeight;


  


  const rectX = marginLeft + 8;
  const rectY = marginTop - 9;
  const rectWidth = 70;
  const rectHeight = lineHeight + 6;
  let textX = marginLeft + 25;
  const textY = marginTop;
  const lugar = record.lugares && record.lugares[0] ? String(record.lugares[0]) : undefined;

  if (!lugar) {
    console.error('Lugar is not defined or empty.');
    return; // exit or throw an error
}

// Check if the first character is alphabetical
const isFirstCharAlphabetical = /^[A-Za-z]$/.test(lugar.charAt(0));

const fila = isFirstCharAlphabetical ? lugar.charAt(0) : "";
const numeroDoLugar = isFirstCharAlphabetical ? lugar.slice(1) : lugar;
let lugarText;

if (fila) { // If the 'fila' (letter) exists.
    lugarText = `Fila: ${fila}, Lugar: ${numeroDoLugar}`;
} else { // If there's no 'fila' and only the 'numeroDoLugar'.
  textX=marginLeft + 32
    lugarText = `Lugar: ${numeroDoLugar}`;
}
 
  doc.setFillColor(0, 0, 0);
  doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(lugarText, textX, textY);
  marginTop += rectHeight + 2;
  console.log("Id -> " + record._id)
  // Add barcode
  const barcodeData = record._id;
  const barcodeCanvas = document.createElement('canvas');
  JsBarcode(barcodeCanvas, barcodeData, { format: 'CODE128' });
  const barcodeDataURL = barcodeCanvas.toDataURL('image/png');
  const barcodeWidth = 100;
  const barcodeHeight = 30;
  const barcodeX = (doc.internal.pageSize.getWidth() - barcodeWidth) / 2;
  doc.addImage(barcodeDataURL, 'PNG', barcodeX, marginTop, barcodeWidth, barcodeHeight);

  marginTop += barcodeHeight + lineHeight;
  doc.setTextColor(0, 0, 0);

  // Calculate ending time of the film
  let startTime = selectedSessao.hora;
  let durationMinutes = selectedSessao.filme.duracao;
  let startTimeParts = startTime.split(":");
  let startDate = new Date();
  startDate.setHours(parseInt(startTimeParts[0]));
  startDate.setMinutes(parseInt(startTimeParts[1]));
  let endDate = new Date(startDate.getTime() + durationMinutes * 60000); 
  let endTime = endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0');
  doc.text("Hora prevista de fim de filme: " + endTime, marginLeft + 8, marginTop);
  marginTop += lineHeight;
  doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
  doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
  doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);

  // Open the PDF in a new window
  window.open(doc.output('bloburl'), '_blank');
};


    

    const columns = [
        {
          title: "Nome da Sessão",
          dataIndex: "nome"
        },
        {
          title: "Data",
          dataIndex: "data",
          render: (text, record) => {
            return moment(text).format("DD-MM-YYYY")
          }
        },
        {
          title: "Hora",
          dataIndex: "hora",
        },
        {
          title: "Filme",
          dataIndex: "filme",
          render: (text, record) => {
            return record.filme.titulo;
          }
        },
        {
          title: "Preço Bilhetes ",
          dataIndex: "precobilhete",
          align: 'center',
          render: (text, record) => {
            return record.precobilhete + " €"
          }
        },
        {
          title: "Total de Lugares",
          dataIndex: "totallugares",
          align: 'center',
        },
        {
          title: "Lugares disponíveis",
          dataIndex: "lugaresocupados",
          align: 'center',
          render: (text, record) => {
            const bilhetesDaSessaoAtual = bilhetes.filter(bilhete => bilhete.sessao._id === record._id);
            return record.totallugares - bilhetesDaSessaoAtual.length;
          }
        },
        {
          title: "Estado",
          dataIndex: "estado",
          align: 'center',
         
        },
      
        {
          title: "Ações",
          dataIndex: "acoes",
          align: "center",
          render: (text, record) => {
            return <div >
              
               
    
              <i class="ri-user-line"
                onClick={() => {
                
                  setSelectedSessao(record);
                  setOpenCompradoresModal(true);
                  handleCompradores(record)
                
                 
                }}
              ></i>
    
            </div>
          }
    
        }
    

      ]

      const columns2 = [
        {
          title: "Id Bilhete",
          dataIndex: "_id"
        },
        {
          title: "Compradores",
          dataIndex: "users",
          sorter: (a, b) => {
            const orderValue = (user) => {
                if (user.isFunc) return 1;
                if (user.isAdmin) return 2;
                return 3; // Por padrão, assume que é Online
            };
    
            return orderValue(a.user) - orderValue(b.user);
        },
          render: (text, record) => {
            let clienteNome = record.user.nome;
            if (record.user.isFunc) {
              clienteNome = `Funcionário-${clienteNome}`;
            } else if (record.user.isAdmin) {
              clienteNome = `Admin-${clienteNome}`;
            } else {
              clienteNome = `Online-${clienteNome}`;
            }
      
            return clienteNome;
          }
        },
        {
          title: "Email",
          dataIndex: "email",
          render: (text, record) => {
            return record.user.email;
          }
        },
        {
          title: "Dia da compra",
          dataIndex: "createdAt",
          sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
          render: (text, record) => {
              return moment(text).format("DD-MM-YYYY HH:mm");
          }
      },
        {
          title: "lugares",
          dataIndex: "lugares",
          align: "center",
          render: (text, record) => {
            return record.lugares.map(lugar => lugar).join(", ");
          }
        },
        {
          title: "Ações",
          align: "center",
          render: (text, record) => {
              return (
                  <button onClick={() => generateAndPrintPDF(record)} style={{ background: 'none', border: 'none' }}>
                      <i className="ri-printer-fill"></i>
                  </button>
              );
          }
      }
        
      ];
     


      
  return (
    <Modal
    title=""
    open={openSessaoModal}
    onCancel={() => setOpenSessaoModal(false)}
    width={1500}
    footer={null}

  >
    <h1 className='text-primary text-xl uppercase mb-1'>
      Cinema : {cinema.nome}
    </h1>


    

    {view === "table" && (
       <Table 
       columns={columns} 
       dataSource={ (sessao || []).filter(s => s && (s.estado === "Criada" || s.estado === "A decorrer")) }
       pagination={{pageSize : 5}} 
   />
    )}


<Modal
    title=""
    open={openCompradoresModal}
    onCancel={() => setOpenCompradoresModal(false)}
    width={1500}
    footer={null}
>
    <h1 className='text-primary text-xl uppercase mb-1'>
        Cinema: {cinema.nome}
    </h1>
    <input
        type="text"
        placeholder="Pesquisar por email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}  // Atualize o estado com o novo termo de pesquisa
        className="mb-2"  // Aplique qualquer estilo necessário
      />
   {view === "table" && (
        <Table columns={columns2} dataSource={filteredTickets} pagination={{pageSize : 5}}  />
    )}  
</Modal>

   
      </Modal>



  )
}

export default SessaoModal
