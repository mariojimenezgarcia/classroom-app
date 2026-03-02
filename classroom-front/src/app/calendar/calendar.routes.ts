import { Routes } from "@angular/router";
import { CalendarLayout} from "./layout/calendar-layout/calendar-layout";
import { CalendarPage } from "./pages/calendar-page/calendar-page";

export const calendarRoutes:Routes=[
     {
        path:'',
        component:CalendarLayout,
        children: [
            {
                path:'',
                component:CalendarPage
            }, 
        ],
    },
    {
        path:'**',
        redirectTo:'',
    },        
];
export default calendarRoutes;
