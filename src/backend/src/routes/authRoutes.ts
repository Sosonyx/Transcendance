import { app } from "../server.js" 
import { registerController, loginController, logoutController } from "../controllers/authController.js";

export function authRoutes(){
	app.post('/register', registerController);
	app.post('/login', loginController);
	app.post('/logout', logoutController);
}
