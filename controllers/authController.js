import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address,answer } = req.body;
    //validations
    if (!name) {
      return res.send({message: "Name is Required" });
    }
    if (!email) {
      return res.send({message: "Email is Required" });
    }
    if (!password) {
      return res.send({message: "Password is Required" });
    }
    if (!phone) {
      return res.send({message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({message: "Address is Required" });
    }
    if (!answer) {
      return res.send({message: "Answer is Required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: true,
        message: "Already Registered, Please Login.",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    return res.status(201).send({
      success: true,
      message: "User Registered Successfully.",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role:user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController
export const forgotPasswordController = async(req,res)=>{
  try {
    const {email, answer, newPassword} = req.body;
    if(!email || !answer || !newPassword){
      res.status(400).send({message:"All fields are required"})
    }
    //check
    const user = await userModel.findOne({email,answer});
    //validation
    if(!user){
      return res.status(404).send({
        success:false,
        message:'Wrong Email Or Answer'
      })
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id,{password:hashed});
    res.status(200).send({
      success:true,
      message:"Password Reset Successfully",
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).send({ message: "Access denied" });
};


//test controller
export const testController = (req,res)=>{
  res.send('protected route');
}

//update profile Controller
export const updateProfileController = async(req,res)=>{
  try {
    const {name, email, password, address, phone} = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    //we cant forcefully update password
    if(password && password.length < 6){
      return res.json({error:"Password is required and 6 character long"});
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id,{
      name: name || user.name,
      password: hashedPassword || user.password,
      phone:phone || user.phone,
      address: address || user.address,
    },{new:true});

    res.status(200).send({
      success: true,
      message:"Profile Updated Successfully",
      updatedUser,
    })
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success:false,
      message:"Error while updating Profile"
    })
  }
}

//orders
export const getOrdersController = async(req,res) => {
  try{
    const orders = await orderModel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name");
    res.json(orders);
  }catch(error){
    console.log(error)
    res.status(500).send({
      success:false,
      message:"Error while getting orders",
      error
    })
  }
}

// all orders
export const getAllOrdersController = async(req,res) => {
  try{
    const orders = await orderModel.find({}).populate("products","-photo").populate("buyer","name").sort({createdAt:-1});
    res.json(orders);
  }catch(error){
    console.log(error)
    res.status(500).send({
      success:false,
      message:"Error while getting all  orders",
      error
    })
  }
};

//order status
export const orderStatusController = async(req,res)=>{
  try {
    const {orderId} = req.params;
    const {status} = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      {status},
      {new:true}
    );
    res.json(orders);
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:"Error while Updating order status",
      error
    })
  }
} 