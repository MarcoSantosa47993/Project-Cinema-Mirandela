import React, {useState,useEffect} from 'react';
import Retangulo from './Retangulo';
import Lugaresesquerda from './lugaresesquerda';
import StripeCheckout from 'react-stripe-checkout';
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import { useDispatch, useSelector } from 'react-redux'
import { ComprarBilhete, GetBilhetesOfId, MakePagamento } from '../apicalls/bilhetes';
import { GetSessaoById } from '../apicalls/cinemas';
import { Button, message,Modal } from 'antd';
import { useNavigate, useParams } from "react-router-dom"
import { GetCurrentUser } from '../apicalls/users';
import { SetUser } from "../redux/usersSlice";
import Lugarestopo from './lugarestopo';
import Lugaresbaixo from './lugaresbaixo';
import Lugaresdireita from './lugaresdireita';
import MinhaImagem from '../images/auditorio.png'
import '../stylesheets/MeuComponente.css';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import "../stylesheets/lugares.css"
import io from "socket.io-client"



const Lugares = (dados) => {
  let socket
  let tamanhoRetangulo = {
    width: '300px',
    height: '200px',
  };
  
  let tamanhoRetangulo1 = {
    width: '150px',
    height: '200px',
  };
  
  
  useEffect(() => {
    // Conectar-se ao servidor
    socket = io('https://cinema-mirandela2.onrender.com');
    
  window.addEventListener('beforeunload', () => {
    socket.emit('cliente_desconectando', { userId :  user._id });
 });


    return () => {
        socket.disconnect();
    };
}, []);
  
  
  
  const { user } = useSelector((state) => state.users);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [showMovieFormModal, setShowMovieFormModal] = React.useState(false)
  const [showMovieFormModal2, setShowMovieFormModal2] = React.useState(false)
  const [showMovieFormModal3, setShowMovieFormModal3] = React.useState(false)
  const [showMovieFormModal4, setShowMovieFormModal4] = React.useState(false)
  const [bilheteId, setBilheteId] = React.useState(null)
  const [bilhete2Id,setBilhete2Id] = React.useState(null)
  const [sessao, setSessao] = React.useState(null)
  const [modalIsOpen, setModalIsOpen] = React.useState(false); // Estado para controlar a exibição do modal
   
  
  const [selectedPlacesParent, setSelectedPlacesParent] = useState([]);

  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);

  


   // Função para confirmar a compra
   const confirmPurchase = () => {
    setModalIsOpen(false);
    setSuccessModalIsOpen(true);
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await GetSessaoById({ sessaoId: params.id, })
      if (response.success) {
        setSessao(response.data)
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  const getBilhetesId = async (payload) => {
    
    try {
      dispatch(ShowLoading())
      const response = await GetBilhetesOfId(payload)
      console.log("API Response:", response); // Add this line
      if (response.success) {
        setBilhete2Id(response.data, () => {
          // Now that the state is updated, you can proceed with generating the PDF
          generateAndPrintPDF();
        });
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  const getCurrentuser = async () => {
    try {
      dispatch(ShowLoading())
      const response = await GetCurrentUser();
      dispatch(HideLoading())
      if (response.success) {
        dispatch(SetUser(response.data))
      }
      else {
        dispatch(SetUser(null))
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      dispatch(SetUser(null))
      message.error(error.message)
    }
  }
  
  const onToken = async (token) => {
    try {
      dispatch(ShowLoading())
      const response = await MakePagamento(token, selectedPlacesParent.length * sessao.sessao.precobilhete * 100)
      if (response.success) {
        message.success(response.message)
        bilhete(response.data)
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())

    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  const bilhete = async (pagamentoId) => {
    try {
      dispatch(ShowLoading())
      const response = await ComprarBilhete({
        sessao: params.id,
        lugares: selectedPlacesParent,
        pagamentoId,
        user: user._id,
      })
      if (response.success && !user.isAdmin && !user.isFunc) {
        message.success(response.message)
        setSelectedPlacesParent([])
        navigate("/profile")
      }
      else if(response.success && (user.isFunc || user.isAdmin)){
        message.success(response.message)
        setBilheteId(response.data)
      }
      else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  useEffect(() => {
    getData();
    if (localStorage.getItem('token')) {
      getCurrentuser();
    }


  }, []);
  
  const handleSelectedPlaces = (places) => {
    setSelectedPlacesParent(places); // Atualiza o estado de lugares selecionados na página
  };

 

 


  React.useEffect(() => {
    if(dados === 0)
    {
        setSelectedPlacesParent([dados]);
        
    }
   
  }, [dados]);

  

    const generateAndPrintPDF = (bilhetes) => {
     
      const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a6'
      });
  
      const valorEmEuros = sessao.sessao.precobilhete;
  
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
  
 
  
      bilhetes.forEach((bilhete, bilheteIndex) => {
          if (bilheteIndex !== 0) {
              doc.addPage();
              marginTop = 10;
          }
      
          doc.setFontSize(12);
          doc.text(`Detalhes do Bilhete ${bilheteIndex + 1}:`, marginLeft, marginTop);
          marginTop += lineHeight;
  
          // Add more details
          doc.text('  - Cinema: ' + sessao.sessao.cinema.nome, marginLeft, marginTop);
          marginTop += lineHeight;
          doc.text('  - Sessão: ' + sessao.sessao.nome, marginLeft, marginTop);
          marginTop += lineHeight;
          doc.text('  - Filme: ' + sessao.sessao.filme.titulo, marginLeft, marginTop);
          marginTop += lineHeight;
          doc.text('  - Total: ' + valorFormatado, marginLeft, marginTop );
          marginTop += lineHeight;
          marginTop += lineHeight;
  

          bilhete.lugares.forEach((lugar, lugarIndex) => {
            const rectX = marginLeft + 8; // Ajuste a posição horizontal do retângulo
            const rectY = marginTop - 9; // Ajuste a posição vertical do retângulo
            const rectWidth = 70; // Reduzi o tamanho do retângulo
            const rectHeight = lineHeight + 6; // Ajuste a altura do retângulo
            const textX = marginLeft + 25;
            const textY = marginTop;
            const letraDaFila = lugar.charAt(0); // Obtém a primeira letra do bilhete (por exemplo, 'c' de 'c2')
            const numeroDoLugar = lugar.slice(1); // Obtém o número do lugar (por exemplo, '2' de 'c2')

            const fila = letraDaFila;
            const lugar2 = `Lugar: ${numeroDoLugar}`;
          
            doc.setFillColor(0, 0, 0); // Define a cor do preenchimento para preto
            doc.rect(rectX, rectY, rectWidth, rectHeight, 'F'); // Desenha o retângulo preto
        
            doc.setTextColor(255, 255, 255); // Define a cor do texto para branco


           // Calcula as coordenadas x e y para centralizar o texto no retângulo
const textWidth = doc.getStringUnitWidth(` Fila: ${fila}, ${lugar2}`) * doc.internal.getFontSize();


doc.text(` Fila: ${fila}, ${lugar2}`, textX, textY);
        
            marginTop += rectHeight + 2; // Ajuste o espaço vertical entre os retângulos
        });
        doc.setFillColor(0, 0, 0); // Define a cor do preenchimento para preto
  
          // ... repeat for other details like 'sessão', 'filme', etc.
          doc.setTextColor(0, 0, 0);
          // Calculate ending time of the film
          let startTime = sessao.sessao.hora;
          let durationMinutes = sessao.sessao.filme.duracao;
  
          let startTimeParts = startTime.split(":");
          let startDate = new Date();
          startDate.setHours(parseInt(startTimeParts[0]));
          startDate.setMinutes(parseInt(startTimeParts[1]));
  
          let endDate = new Date(startDate.getTime() + durationMinutes * 60000); 
          let endTime = endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0');
          doc.setTextColor(0, 0, 0);
  
          // Add barcode
          const barcodeData = bilhete._id;
          const barcodeCanvas = document.createElement('canvas');
          JsBarcode(barcodeCanvas, barcodeData, { format: 'CODE128' });
          const barcodeDataURL = barcodeCanvas.toDataURL('image/png');
  
          const barcodeWidth = 100;
          const barcodeHeight = 30;
          const barcodeX = (doc.internal.pageSize.getWidth() - barcodeWidth) / 2;
  
          doc.addImage(barcodeDataURL, 'PNG', barcodeX, marginTop, barcodeWidth, barcodeHeight);
          marginTop += barcodeHeight + lineHeight;
          doc.setFontSize(9).text("Hora prevista de fim de filme: " + endTime, marginLeft +16, marginTop);
          marginTop += lineHeight;
          doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
          doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
          doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
     
          // Add any other details or texts as needed
            // Reset text color to black
    doc.setTextColor(0, 0, 0);
      });
  
      // Open the PDF in a new window
      window.open(doc.output('bloburl'), '_blank');
  };
  
  

  useEffect(() => {
    if (bilhete2Id) {
      generateAndPrintPDF(bilhete2Id);
    }
  }, [bilhete2Id]);

  useEffect(() => {
    if (sessao) {
      HideLoading();
    } else {
      ShowLoading();
    }
  }, [sessao]);

  if (!sessao) return null; // Não renderize nada enquanto sessao estiver carregando


  return (
    
    <div className="container2">
      <img  src={MinhaImagem} alt="Descrição da Imagem" className="imagem"  />
    <div className='elemento-sobreposto'>
      <div style={{display:'flex',justifyContent:'center'}}>
      </div>
    <div className='gridgap' style={{  display: 'flex', justifyContent: 'center'}}>
        <div className="esquerda">
      <Retangulo onClick={()=>{setShowMovieFormModal(true)}} className="retangulo1" cor="red" borderRadius={'10px'}  />
      </div>
      <div>
      <div className='topomeio' >
        <Retangulo onClick={()=>{setShowMovieFormModal2(true)}}  className="retangulo" cor="blue"   />
        </div>
        <Retangulo onClick={()=>{setShowMovieFormModal3(true)}} className="retangulo" cor="green"  />
      </div>
      <div className='direita' >
      <Retangulo  onClick={()=>{setShowMovieFormModal4(true)}} className="retangulo1" cor="orange" borderRadius={'10px'}  />
        </div>

     {showMovieFormModal && <Lugaresesquerda

      showMovieFormModal={showMovieFormModal}
      setShowMovieFormModal={setShowMovieFormModal}
      selectedPlacesParent={selectedPlacesParent}
      setSelectedPlacesParent={setSelectedPlacesParent}
      handleSelectedPlaces={handleSelectedPlaces}
      sessao={sessao}
      user = {user}
         />}
  </div>
      {showMovieFormModal2 && <Lugarestopo

showMovieFormModal2={showMovieFormModal2}
setShowMovieFormModal2={setShowMovieFormModal2}
selectedPlacesParent={selectedPlacesParent}
setSelectedPlacesParent={setSelectedPlacesParent}
handleSelectedPlaces={handleSelectedPlaces}
sessao={sessao}
user={user}
/>}

{showMovieFormModal3 && <Lugaresbaixo

showMovieFormModal3={showMovieFormModal3}
setShowMovieFormModal3={setShowMovieFormModal3}
selectedPlacesParent={selectedPlacesParent}
setSelectedPlacesParent={setSelectedPlacesParent}
handleSelectedPlaces={handleSelectedPlaces}
sessao={sessao}
user={user}
/>}

{showMovieFormModal4 && <Lugaresdireita

showMovieFormModal4={showMovieFormModal4}
setShowMovieFormModal4={setShowMovieFormModal4}
selectedPlacesParent={selectedPlacesParent}
setSelectedPlacesParent={setSelectedPlacesParent}
handleSelectedPlaces={handleSelectedPlaces}
sessao={sessao}
user={user}
/>}
<div className='flex justify-center mt-1'></div>
        <div className='flex justify-center '>
          <div className='flex uppercase p-2 gap-3'>
            <h1 className='text-sm'>
              Total Lugares: {selectedPlacesParent.length}
            </h1>
            {sessao && selectedPlacesParent.length > 0 &&(
        <h1 className='text-sm'>
              Total: {selectedPlacesParent.length * sessao.sessao.precobilhete} €
          </h1>
)}
          </div>
        
          {!user.isAdmin && !user.isFunc && selectedPlacesParent.length > 0 && <div className='flex justify-center  ' style={{marginTop:'14px'}} >
            <StripeCheckout
              token={onToken}
              amount={selectedPlacesParent.length * sessao.sessao.precobilhete * 100}
              currency='EUR'
              enum="eu_vat"
              tax_id_collection="true"
              email={user.email}
              card
              stripeKey="pk_test_51NKVhMDvObFXHlKcfOPXAS0i9bAfCw1ol6p6TbxAcKu6TGICeUvgDcDgMi65H2s84Y9ear5RWfFTfHKwebvnEpcl00mdOQc9Ya">


              <Button style={{  backgroundColor:'#6654DA',color:'white',fontSize:'15px'}}>Comprar</Button>
            </StripeCheckout>
          </div>}

          {(user.isFunc || user.isAdmin) && selectedPlacesParent.length > 0 && <div className='flex justify-center  ' style={{marginTop:'14px'}} >
            
          <Button style={{  backgroundColor:'#6654DA',color:'white',fontSize:'15px'}} onClick={() => setModalIsOpen(true)}>Comprar</Button>
            </div>
            }
       
     
       <Modal
        open={modalIsOpen}
        onCancel={() => setModalIsOpen(false)} // Função para fechar o modal
        contentLabel="Exemplo de Modal"
        footer={null}
      >
   <h2 style={{ textAlign: 'center' }}>Confirmar Compra</h2>
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
    Bilhetes: {selectedPlacesParent.map((place, index) => place.id + (index < selectedPlacesParent.length - 1 ? ', ' : ''))}
    <p>
  Preço: {sessao && sessao.sessao.precobilhete ? sessao.sessao.precobilhete * selectedPlacesParent.length + ' €' : ''}
</p>

    </div>

    <p style={{ textAlign: 'center' }}>Deseja confirmar a compra?</p>
    <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        style={{ backgroundColor: '#6654DA', color: 'white', fontSize: '15px', marginRight: '10px' }}
        onClick={async () => {
          try {
       
             await bilhete('Fisico: ' + user._id);
           
            confirmPurchase(); 
   

          } catch (error) {
            // Lida com erros, se houver
          }
        }}
      >
        Sim
      </Button>
      <Button
        style={{ backgroundColor: 'red', color: 'white', fontSize: '15px' }}
        onClick={() => setModalIsOpen(false)}
      >
        Não
      </Button>
    </div>
        
      </Modal>


     {/* Modal de Sucesso */}
     <Modal
  open={successModalIsOpen}
  onCancel={() => {setSuccessModalIsOpen(false)
  setSelectedPlacesParent([])
  }
  }
  contentLabel="Modal de Sucesso"
  footer={null}
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15vh', // Use vh para definir a margem superior
    marginBottom: '15vh' // Use vh para definir a margem inferior
  }}
>
  {/* Conteúdo do modal de sucesso */}
  <div style={{ textAlign: 'center' ,marginTop: '10px'}}>
    <h2>Compra Realizada com Sucesso!</h2>
    <p>O bilhete foi gerado e está pronto para imprimir.</p>
  </div>
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <Button
      style={{ backgroundColor: '#6654DA', color: 'white', fontSize: '15px' }}
      onClick={async ()  => {
        
     
    
         getBilhetesId(bilheteId)
   
    
 
    
        

        

        


      }
                
                  

       

      }

      
    >
      Imprimir Bilhete
    </Button>
  </div>
</Modal>
  
     </div>

   </div>
   </div>
  );
};

export default Lugares;