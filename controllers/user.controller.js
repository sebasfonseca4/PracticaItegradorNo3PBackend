import UsersDAO from "../daos/users.dao.js";

const ChangeRol = async (req, res) => {

    const userId = req.params.uid;

    try {
        const user = await UsersDAO.getUserByID(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const newRole = user.role === 'user' ? 'premium' : 'user';
        await UsersDAO.updateRole(userId, newRole);

        res.status(200).json({ message: `Rol de usuario actualizado a ${newRole}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cambiar el rol del usuario' });
    }
}


export default  {
    ChangeRol
}