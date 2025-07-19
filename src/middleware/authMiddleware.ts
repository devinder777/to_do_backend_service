import jwt, {JwtPayload} from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({message: 'No token provided'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (typeof decoded !== 'object' || !decoded.id) {
            return res.status(401).json({message: 'Invalid token payload'});
        }

        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({message: 'Invalid or expired token'});
    }
}

export default authMiddleware;