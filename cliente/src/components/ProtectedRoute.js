import React, { useEffect, useState } from 'react'
import { GetCurrentUser } from '../apicalls/users';
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice";
import { HideLoading, ShowLoading } from '../redux/loadersSlice';

import { Navigate, useLocation } from 'react-router-dom';
import "../stylesheets/protectedroutestyle.css"
import SocialCircle from './SocialCircle';


function ProtectedRoute({ children }) {
    const { user } = useSelector((state) => state.users);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const intervalIdRef = React.useRef(null);




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
                message.error("Sessão expirou por favor faça login outra vez")
                console.log("aqui")
                localStorage.removeItem("token");
                { dispatch(ShowLoading()) }
                navigate("/")
                { dispatch(HideLoading()) }


            }
        } catch (error) {
            dispatch(HideLoading())
            dispatch(SetUser(null))
            message.error(error)
        }
    }


    


    useEffect(() => {
        if (localStorage.getItem('token')) {
            getCurrentuser();
            
        }
        else {
         
        }
    }, [navigate])

    

  

    useEffect(() => {
        if (user) {
            if ((!user.isAdmin && !user.isFunc) && (location.pathname.includes('/admin') || location.pathname.includes('/func')) ) {
                // Se o usuário é um cliente e tenta acessar /admin, redirecione para outra página, por exemplo, a página de perfil
                navigate('/profile');
            }
            else if (user.isAdmin && (location.pathname.includes('/profile') ||location.pathname.includes('/func')) ) {
                // Se o usuário é um administrador e tenta acessar /profile, redirecione para outra página, por exemplo, a página do administrador
                navigate('/admin');
            }
            else if(user.isFunc && (location.pathname.includes('/profile') ||location.pathname.includes('/admin'))){
                navigate('/func');
            }
          
        }
        
    }, [user, location, navigate]);

  

    if (localStorage.getItem('token') == null) {
        return (
            <div className="layout p-1">
                <div className="header bg-primary flex justify-between p-2">
                    <div>
                        <h1 className="text-2xl text-white cursor-pointer" onClick={()=>navigate("/")}> Cinema Mirandela </h1>
                    </div>
                    <div className="bg-white p-1 flex gap-1 cursor-pointer">
                        <i className="ri-shield-user-line text-primary"></i>
                        <h1 className=" login text-sm"
                            onClick={() => {
                                { dispatch(ShowLoading()) }
                                navigate("/login")
                                { dispatch(HideLoading()) }
                            }}>

                            LOGIN
                        </h1>

                    </div>
                </div  >
                <div className="content mt-1 p-1">{children}</div>
             

            </div>
        )
    }
    else {
        return (
            user && (
            <div>
                <div className="layout p-1">
                    <div className="header bg-primary flex justify-between p-2">
                        <div>
                        <h1 className="text-2xl text-white cursor-pointer"  onClick={()=>navigate("/")}> Cinema Mirandela </h1>
                        </div>
                        <div className="bg-white p-1 flex gap-1">
                            <i className="ri-shield-user-line text-primary"></i>
                            <h1 className=" nome text-sm underline"
                                onClick={() => {
                                    if (user.isAdmin) {
                                        navigate("/admin")
                                    }
                                    else if(user.isFunc) {
                                        navigate("/func")
                                    }
                                    else{
                                        navigate("/profile")
                                    }

                                }}>
                                {user.nome}
                            </h1>
                            <i class="ri-logout-circle-r-line ml-2"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    { dispatch(ShowLoading()) }
                                    navigate("/login")
                                    { dispatch(HideLoading()) }
                                }}
                            ></i>
                             
                        </div>
                    </div  >
                    <div className="mt-1 p-1">{children}</div>

                    
                    
                   </div>
            
                  {/* Renderize o SocialCircle somente se o caminho não for "/profile" */}
                  {location.pathname !== "/profile" && location.pathname !== "/func" && location.pathname !== "/admin" && <SocialCircle user={user} />}
                    </div>
                  
               
            )
        )
    }

}

export default ProtectedRoute;