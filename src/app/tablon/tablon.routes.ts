import { Routes } from "@angular/router";
import { TablonLayout } from "./layout/tablon-layout/tablon-layout";
import { TablonPage } from "./pages/tablon-page/tablon-page";
import { EntregarTarea } from "./pages/entregar-tarea/entregar-tarea";
import { TareasPage } from "./pages/tareas-page/tareas-page";

export const tablonRoutes: Routes = [
  {
    path: '',
    component: TablonLayout,
    children: [
      {
        path: 'mostrarClase/:claseId',
        component: TablonPage
      },
      {
        path: 'entregarTarea/:publicacionId',
        component: EntregarTarea
      },
      {
        path: 'tareas/:claseId',
        component: TareasPage
      }
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default tablonRoutes;