import React, { useEffect } from 'react'
import { Form, Col, Modal, Row, Table, message } from 'antd'
import Button from "../../../components/button"
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loadersSlice'

import moment from "moment"
import { GCompradores } from "../../../apicalls/bilhetes"
import Aviso from "../../../components/aviso"
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';


function Compradores({ openCompradoresModal, setopenCompradoresModal, sessao }) {
  const [bilhete , setBilhetes] = React.useState([])
  const [selectedBilhete = null, setSelectedBilhete] = React.useState(null);
  const [openModalAviso = false, setopenModalAviso] = React.useState(false);
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredBilhetes, setFilteredBilhetes] = React.useState([]); 

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
};


useEffect(() => {
  const filtered = bilhete.filter(b => {
      // Verifica se o email existe e está no local correto
      const email = b.user && b.user.email ? b.user.email.toLowerCase() : '';

      // Verifica se o ID existe
      const id = b._id ? b._id.toLowerCase() : '';

      return (b.estado === 'Comprado' || b.estado === 'Validado') &&
             (email.includes(searchTerm.toLowerCase()) ||
              id.includes(searchTerm.toLowerCase()));
  });
  setFilteredBilhetes(filtered);
}, [bilhete, searchTerm]);

  console.log(sessao)
  const handleCompradores = async () => {
    try {

      const compradoresResponse = await GCompradores({ sessaoId: sessao._id })
      if (compradoresResponse.success) {
        setBilhetes(compradoresResponse.data)
      }
      else {
        message.error(compradoresResponse)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  useEffect(() => {
    handleCompradores();
  }, [])
  

  const columns = [
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
        return moment(text).format("DD-MM-YYYY");
      }
    },
    {
      title: "lugares",
      dataIndex: "lugares",
      render: (text, record) => {
        return record.lugares.map(lugar => lugar).join(", ");
      }
    },
    {
      title: "Estado",
      dataIndex: "estado",
      align: "center",
    },
    {
      title: `Ações`,
      dataIndex: "acoes",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            {
              <i
                className="ri-delete-bin-line "
                style={{ color: "red" }}
                onClick={() => {
                  setopenModalAviso(true);
                  setSelectedBilhete(record);
                }}
              ></i>
      }{
                  <button onClick={() => generateAndPrintPDF(record)} style={{ background: 'none', border: 'none' }}>
                      <i className="ri-printer-fill"></i>
                  </button>
      }
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    handleCompradores();

    // Set up a polling mechanism every 10 seconds
    const interval = setInterval(() => {
        handleCompradores();
    }, 500); // 10 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
}, []);

const generateAndPrintPDF = (record) => {
  const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
  });

  const valorEmEuros = sessao.precobilhete;
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
  doc.text('  - Cinema: ' + sessao.cinema.nome, marginLeft, marginTop);
  marginTop += lineHeight;
  doc.text('  - Sessão: ' + sessao.nome, marginLeft, marginTop);
  marginTop += lineHeight;
  doc.text('  - Filme: ' + sessao.filme.titulo, marginLeft, marginTop);
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
  let startTime = sessao.hora;
  let durationMinutes = sessao.filme.duracao;
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



 
  return (
    <Modal
      title=""
      open={openCompradoresModal}
      onCancel={() => setopenCompradoresModal(false)}
      width={1500}
      footer={null}
    >
      <h1>Bilhetes</h1>
      <input
      type="text"
      placeholder="Pesquisar por Email ou ID do Bilhete"
      value={searchTerm}
      onChange={handleSearchChange}
      style={{ marginBottom: 20 }}
    />
      <Table columns={columns} dataSource={filteredBilhetes} pagination={{ pageSize:5}} />

      {openModalAviso && <Aviso
        openModalAviso={openModalAviso}
        setopenModalAviso={setopenModalAviso}
        bilhete = {selectedBilhete}

      ></Aviso> }
     
    </Modal>
  )
}

export default Compradores
