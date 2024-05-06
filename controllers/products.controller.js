import ProductDAO from "../daos/products.dao.js";
import UsersDAO from "../daos/users.dao.js";
import CartDAO from "../daos/carts.dao.js";
import UserDTO from "../dtos/user.dto.js";
import ProductDTO from "../dtos/product.dto.js";
import logger from '../utils/logger.js';

const GetProducts = async (req, res) => {
    try {
        const products = await ProductDAO.getAll();
        const userId = req.session.user;
        const user = await UsersDAO.getUserByID(userId);
        const userDTO = new UserDTO(user);
        const productsDTO = products.map(product => new ProductDTO(product));
        res.render("products", { user:userDTO, products: productsDTO });
        logger.info('Se obtuvieron los productos correctamente');
      } catch (error) {
        console.error(error);
        res.status(500).send("Error obteniendo productos");
        logger.error('Error al obtener los productos', { error: error.message });
      }
}

const GetProductById = async (req, res) => {
  const { pid } = req.params;
  try {
      const product = await ProductDAO.getById(pid);
      if (!product) {
        const errorMessage = errorHandler('PRODUCT_NOT_FOUND');
        return res.status(404).send(errorMessage);
      }
      const productDTO = new ProductDTO(product);
      res.render('detailProduct', { product: productDTO });
      logger.info(`Se obtuvo el producto ${pid} correctamente`);
  } catch (error) {
      console.error(error);
      const errorMessage = errorHandler('INTERNAL_ERROR');
      res.status(500).send(errorMessage);
      logger.error(`Error al obtener el producto ${pid}`, { error: error.message });
  }
}

const AddProductCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const userId = req.session.user;
    if (user.role === 'premium') {
      const product = await ProductDAO.getById(productId);
      if (product.owner.toString() === userId) {
        return res.status(403).json({ message: 'No puedes agregar tu propio producto al carrito' });
      }
    }
    await CartDAO.addProduct(userId, productId);
    res.redirect("/store/products");
    logger.info('Producto agregado al carrito correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error agregando producto al carrito");
    logger.error('Error al agregar producto al carrito', { error: error.message });
  }
}

const purchaseCart = async (req, res) => {
  const { cid } = req.params;  
  const userId = req.session.user;  
  try {
    const cart = await CartDAO.getByCartId(cid);
    console.log(cart.userId)
    console.log(userId)
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    const products = await Promise.all(cart.products.map(async (productId) => {
      const product = await ProductDAO.getById(productId);
      if (product.stock < 1) throw new Error(`Producto "${product.name}" sin stock disponible`);
      return product;
    }));
    const ticket = await CartDAO.finalizePurchase(userId, cart, products);
    logger.info('Compra realizada con éxito');
    return res.status(200).json({ message: "Compra realizada con éxito", ticket });
  } catch (error) {
    console.error(error);
    logger.error('Error al procesar la compra del carrito', { error: error.message });
    return res.status(500).json({ message: "Error al procesar la compra del carrito" });
  }
};

const viewCart = async (req, res) => {
  const userId = req.session.user;
  console.log(userId)
  try {
      const cart = await CartDAO.getByUserId(userId);
      console.log(cart)
      if (cart) {
          res.render('cart', { cart });
      } else {
          return res.status(404).json({ message: "El usuario no tiene un carrito asociado" });
      }
  } catch (error) {
      console.error(error);
      logger.error('Error al obtener el carrito del usuario', { error: error.message });
      return res.status(500).json({ message: "Error al obtener el carrito del usuario" });
  }
};

const CreateProduct = async (req, res) => {
    if (req.session && req.session.user && (req.session.user.role === 'premium' || req.session.user.role === 'admin')) {
      try {
          const { name, price, category, description } = req.body;
          const product = new Product({ name, price, category, description });
          await product.save();
          return res.status(200).json({ message: 'Producto creado con éxito.', product });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error al crear el producto.' });
      }
  } else {
      return res.status(403).json({ message: 'No tienes permiso para crear productos.' });
  }
}

const DeleteProduct = async (req, res) => {
  const productId = req.params.productId;
  
  try {
      const product = await ProductDAO.getById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Producto no encontrado' });
      }

      if (req.session.user.role === 'admin' || product.owner.toString() === req.session.user._id) {
          await ProductDAO.delete(productId);
          return res.status(200).json({ message: 'Producto eliminado correctamente' });
      } else {
          return res.status(403).json({ message: 'No tienes permiso para eliminar este producto' });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};


export default  {
    GetProducts,
    GetProductById,
    AddProductCart,
    purchaseCart,
    viewCart,
    CreateProduct ,
    DeleteProduct
}