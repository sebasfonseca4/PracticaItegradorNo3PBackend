import session from 'express-session';
import UsersDAO from "../daos/users.dao.js";
import UserDTO from '../dtos/user.dto.js';
import sendPasswordResetEmail from '../utils/forgetPasswordEmail.js';
import generateResetToken from '../utils/generateToken.js';

const RegisterUser = async (req, res) => {

    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let age = parseInt(req.body.age);
    let password = req.body.password;

    if(!first_name || !last_name || !email || !age || !password){
        res.redirect("/register");
    }

    let emailUsed = await UsersDAO.getUserByEmail(email);

    if(emailUsed){
        res.redirect("/register");
    } else {
        await UsersDAO.insert(first_name,last_name,age,email,password);
        res.redirect("/login");
    }

}

const LoginUser = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if(!email || !password){
        res.redirect("/login");
    }

    let user = await UsersDAO.getUserByCreds(email, password);

    if(!user){
        res.redirect("/login");
    } else {
        req.session.user = user._id;
        if (user.role === 'admin') { 
            req.session.isAdmin = true;
            res.redirect("/panel-administracion");
        } else {
            req.session.isAdmin = false;
            res.redirect("/store/products");
        }
    }
}

const LogoutUser = async (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/login");
    });
}

const CurrentUser = async (req, res) => {
    if (req.session && req.session.user) {
        const userId = req.session.user;
        const userDTO = new UserDTO(userId);
        res.status(200).json(userDTO);
    } else {
        res.status(401).json({ message: "No hay sesión de usuario activa" });
    }
}

const ForgetPassword = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'No hay sesión de usuario activa.' });
    }
    const userId = req.session.user;
    let user = await UsersDAO.getUserByID(userId);
    const userEmail = user.email;
    console.log('Email del usuario:', userEmail); // Agregar este mensaje para verificar que se obtenga el email correctamente
    const { resetToken, expirationTime } = generateResetToken();
    console.log('Token generado:', resetToken); // Agregar este mensaje para verificar que se genere el token correctamente
    await UsersDAO.saveResetToken(userEmail, resetToken, expirationTime);
    console.log('Token guardado en la base de datos.'); // Agregar este mensaje para verificar que se llame correctamente a saveResetToken
    res.status(200).json({ message: 'Token de restablecimiento de contraseña generado correctamente.' });
}


export default  {
    RegisterUser,
    LoginUser,
    LogoutUser,
    CurrentUser,
    ForgetPassword
}