
import { Routes } from "@angular/router";
import { PerfilLayout } from "./layout/perfil-layout/perfil-layout";
import { PerfilPage } from "./page/perfil-page/perfil-page";




export const crudRoutes:Routes=[
     {
        path:'',
        component:PerfilLayout,
        children: [
            {
                path:'',
                component:PerfilPage
            },
            
        ],
    },
    {
        path:'**',
        redirectTo:'',
    },        
];
export default crudRoutes;
