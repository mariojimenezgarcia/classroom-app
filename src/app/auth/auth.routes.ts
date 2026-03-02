import { Routes } from "@angular/router";
import { AuthLayout } from "./layout/auth-layout/auth-layout";
import { Login } from "./pages/login/login";
import { Register } from "./pages/register/register";



export const authRoutes : Routes=[
    {
        path:'',
        component:AuthLayout,
        children:[
            {
                path:'login',
                component:Login,
            },
            {
                path:'register',
                component:Register,
            },
            {
                path:'**',
                redirectTo:'login',
            },
        ]
            
    }
]
export default authRoutes;