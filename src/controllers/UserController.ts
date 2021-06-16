import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import errorGenerator from "../errors/errorGenerator";
import gravatar from 'gravatar';
import { check, validationResult } from "express-validator";
import { IUserInputDTO } from "../interfaces/IUser";
import { UserService } from "../services";
import { nextTick } from "process";

// const router = express.Router();

// import auth from "../api/middleware/auth";
// import User from "../models/User";

const signUp = async (req: Request, res: Response, next: NextFunction) => {
    check("name", "Name is required").not().isEmpty();
    check("email", "Please include a valid email").isEmail();
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 });
    const { name, email, password } : IUserInputDTO = req.body;
    try{
        const errors = validationResult(req.body);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const foundUser = await UserService.findEmail({ email });
        if(foundUser)   errorGenerator({ statusCode: 409 });  // 이미 가입한 유저

        const avatar = gravatar.url(email, {
            s: "200",
            r: "pq",
            d: "mm",
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await UserService.createUser({ name, email, password: hashedPassword, avatar: avatar });

        const payload = {
            user: {
                email: createdUser.email,
            },
        };
        jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: 36000 },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        next(err);
    }
};
const logIn = async (req: Request, res: Response, next: NextFunction) => {
    check("email", "Please include a valid email").isEmail();
    check("password", "password is required").exists();
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())   return errorGenerator({ statusCode: 400 });
        
        const { email, password } = req.body;
        const user = await UserService.findEmail({ email });
        if(!user){
            return errorGenerator({ statusCode : 401});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return errorGenerator({ statusCode : 401 });
        }
        
        const payload = {
            user: {
                email: user.email,
            },
        };
        jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: 36000 },
            (err, token) => {
                if(err)     throw err;
                res.json({ token }); 
            }
        );
    } catch(err) {
        next(err);
    }
    
}
export default {
    signUp,
    logIn
}


