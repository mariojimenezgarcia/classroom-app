import { Routes } from "@angular/router";
import { HomeLayout } from "./layout/home-layout/home-layout";
import { HomePage } from "./pages/home-page/home-page";
import { CrearClase } from "./pages/crear-clase/crear-clase";
import { UnirseClase } from "./pages/unirse-clase/unirse-clase";
import { CodigoClase } from "./pages/codigo-clase/codigo-clase";
import { MostrarAlumnos } from "./pages/mostrar-alumnos/mostrar-alumnos";
import { EditarClase } from "./pages/editar-clase/editar-clase";
import { AdminPage } from "./pages/admin-page/admin-page";




export const homeRoutes:Routes=[
     {
        path:'',
        component:HomeLayout,
        children: [
            {
                path:'',
                component:HomePage
            },
            {
                path:'crearClase',
                component:CrearClase
            },
            {
                path:'unirseClase',
                component:UnirseClase
            },
            {
                path: 'mostrarCodigoAcceso/:id',
                component: CodigoClase
            },
            {
                path: 'mostrarAlumnos/:id',
                component: MostrarAlumnos
            },
            {
                path: 'editarClase/:id',
                component: EditarClase
            },
             {
                path: 'admin',
                component: AdminPage
            }
        ],
    },
    {
        path:'**',
        redirectTo:'',
    },        
];
export default homeRoutes;
