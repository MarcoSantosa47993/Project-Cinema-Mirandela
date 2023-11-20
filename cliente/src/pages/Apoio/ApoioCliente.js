// src/SupportPage.js
import { message,Upload,Button } from 'antd';
import React from 'react';
import { GetCurrentUser } from '../../apicalls/users';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom"
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { EnviarEmail } from '../../apicalls/bilhetes';
import { UploadOutlined } from '@ant-design/icons';


// Estilo CSS para o componente
const styles = {
    supportPage: {
        padding: '20px',
    
    },
    formGroup: {
        marginBottom: '15px',
        marginTop: '40px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
    },
    input: {
        width: '20%',
        padding: '10px',
        marginBottom: '10px',
    },
    select: {
        width: '20%',
        padding: '10px',
        marginBottom: '10px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
    },
    button: {
        padding: '10px 15px',
    }
};
const ApoioCliente = () => {
    const [assunto, setAssunto] = React.useState(''); 
    const [outroAssunto, setOutroAssunto] = React.useState(''); // estado para o assunto personalizado
      const params = useParams();
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const [mensagem, setMensagem] = React.useState('');
      const [bilheteIDs, setBilheteIDs] = React.useState('');
      const [fileList, setFileList] = React.useState([]);

      const beforeUpload = file => {
        return false
    }
    
    const handleChange = info => {
        console.log(info.file);  // Adicione esta linha
        setFileList(info.fileList);
    };


    const enviarEmail = async () => {
        try {
            dispatch(ShowLoading());
            let file = fileList[0]?.originFileObj;
            const formData = new FormData();
            formData.append('nome', params.nome);
            formData.append('email', params.email);
            formData.append('userId', params.userId)
            formData.append('assunto', assunto === 'outro' ? outroAssunto : assunto);
            formData.append('mensagem', mensagem);
            if (assunto === "Reembolso") {
                const bilhetes = bilheteIDs.split(',').map(id => id.trim()); // Dividir por vírgula e remover espaços em branco
                const bilhetesValidos = bilhetes.filter(id => id !== ""); // Filtrar os IDs que não estão vazios
        
                // Se tiver pelo menos um bilhete válido, adiciona ao formData
                if (bilhetesValidos.length > 0) {
                    formData.append('bilheteIDs', bilhetesValidos.join(', ')); // Unir novamente com vírgulas
                }
            }
    
            if (fileList.length > 0) {
                formData.append('image', file);
            }
    
            formData.append('Content-Type', 'multipart/form-data');
            
            fetch('/api/bilhetes/enviar-email', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                message.success("Mensagem enviada com sucesso"); // Mostrar a mensagem de sucesso
                navigate("/"); // Redirecionar para a página inicial
            })
            .catch((error) => {
                console.error('Erro:', error);
                message.error('Houve um erro ao enviar a mensagem. Tente novamente.');
            })
            .finally(() => {
                dispatch(HideLoading());
            });
        } catch (error) {
            message.error(error.response);
            dispatch(HideLoading());
        }
    };



    return (
        <div style={styles.supportPage}>
            <h1>Apoio ao Cliente</h1>
            <p>Se precisa de assistência, estamos aqui para ajudar!</p>
            <form onSubmit={e => { 
    e.preventDefault(); 
    enviarEmail(); 
}}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Assunto:</label>
                    <select value={assunto} onChange={e => setAssunto(e.target.value)} style={styles.select}>
                        <option value="">-- Selecione o assunto --</option>
                        <option value="Dúvida sobre Sessão">Dúvida sobre Sessão</option>
                        <option value="Suporte Técnico">Suporte Técnico</option>
                        <option value="Reembolso">Reembolso</option>
                        <option value="Problemas com o Website">Problemas com o Website</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                {assunto === "outro" && ( 
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Especifique o Assunto:</label>
                        <input type="text" value={outroAssunto} required onChange={e => setOutroAssunto(e.target.value)} style={styles.input} />
                    </div>
                )}
   

                {assunto && (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nome:</label>
                            <input type="text" required style={styles.input} defaultValue={params.nome} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email:</label>
                            <input type="email" required style={styles.input} defaultValue={params.email}/>
                        </div>
                        {assunto === "Reembolso" && ( 
    <div style={styles.formGroup}>
        <label style={styles.label}>IDs dos Bilhetes (separe com vírgulas se houver mais de um):</label>
        <input type="text" value={bilheteIDs} required onChange={e => setBilheteIDs(e.target.value)} style={styles.input} placeholder="Ex: 652FFFFD3B996A66C68DF2F6"/>
    </div>
)}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensagem:</label>
                            <textarea rows="5" required style={styles.textarea} value={mensagem} onChange={e => setMensagem(e.target.value)}></textarea>
                        </div>
                        <div>
                        <div style={styles.formGroup}>
    <label style={styles.label}>Adicione uma imagem:</label>
    <Upload
    name="image"
    beforeUpload={beforeUpload}
    onChange={handleChange}
    fileList={fileList}
    maxCount={1}
>
    <Button icon={<UploadOutlined />}>Upload</Button>
</Upload>
</div>
                            <button type="submit" style={styles.button}>Enviar Mensagem</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}

export default ApoioCliente;