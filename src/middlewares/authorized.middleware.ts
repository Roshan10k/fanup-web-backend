import { Response, NextFunction } from 'express';
import { JWT_SECRET } from '../configs';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';

declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser
    }
}

const userRepository = new UserRepository();

export const authorizedMiddleware = 
    async ( req: import('express').Request, res: Response, next: NextFunction) => {
        try{
            const authHeader = req.headers.authorization;
            if(!authHeader || !authHeader.startsWith('Bearer '))
                throw new HttpError(401, 'Unauthorized: JWT invalid');
            
            const token = authHeader.split(' ')[1];
            if(!token) throw new HttpError(401, 'Unauthorized: JWT missing');
            
            const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
            if(!decodedToken || !decodedToken.id){  
                throw new HttpError(401, 'Unauthorized: JWT unverified');
            }
            
            const user = await userRepository.getUserById(decodedToken.id as string);  // Using 'id'
            if(!user) throw new HttpError(401, 'Unauthorized: user not found');
            
            req.user = user;
            next();
        }catch(err: unknown){
            const httpErr = err as { statusCode?: number; message?: string };
            return res.status(httpErr.statusCode || 500).json(
                { success: false, message: httpErr.message }
            )
        }
}

export const adminMiddleware = async (
    req: import('express').Request, res: Response, next: NextFunction
) => {  
    try{
        if(!req.user){
            throw new HttpError(401, 'Unauthorized: no user info');
        }
        if(req.user.role !== 'admin'){
            throw new HttpError(403, 'Forbidden: not admin');
        }
        return next();
    }catch(err: unknown){
        const httpErr = err as { statusCode?: number; message?: string };
        return res.status(httpErr.statusCode || 500).json(
            { success: false, message: httpErr.message }
        )
    }
}