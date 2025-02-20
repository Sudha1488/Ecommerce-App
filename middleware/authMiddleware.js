
import  jwt  from 'jsonwebtoken';
import userModel from '../models/userModel.js';
//Protected routes from tokenbase
export const requireSign = async (req,res,next)=>{
    try {
        const decode = jwt.verify(
            req.headers.authorization,
            process.env.SECRET_KEY
        );
        req.user = decode
        next();
    } catch (error) {
        console.log(error);
    }
}; 

export const isAdmin = async(req,res,next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1){
            return res.status(401).send({
                success:false,
                message:"Unauthorized Access",
            })
        }else{
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success:false,
            error,
            message:"Error in admin middleware",
        })
        
    }
}