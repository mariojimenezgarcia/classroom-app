import { Routes } from "@angular/router";
import { NotasLayout} from "./layout/notas-layout/notas-layout";
import { NotasPage } from "./pages/notas-page/notas-page";


export const notasRoutes:Routes=[
     {
        path:'',
        component:NotasLayout,
        children: [
            {
                path:'',
                component:NotasPage
            }, 
        ],
    },
    {
        path:'**',
        redirectTo:'',
    },        
];
export default notasRoutes;
