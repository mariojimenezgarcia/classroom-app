import { Routes } from "@angular/router";
import { VincularHijo } from "./pages/vincular-hijo/vincular-hijo";
import { PadresLayout } from "./layout/padres-layout/padres-layout";

export const padresRoutes:Routes=[
     {
        path:'',
        component:PadresLayout,
        children: [
            {
                path:'',
                component:VincularHijo
            }, 
        ],
    },
    {
        path:'**',
        redirectTo:'',
    },        
];
export default padresRoutes;