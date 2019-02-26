import {IRequest} from "../utils/request";
import {NextFunction, Response} from "express";

export function cors(origin: string = "*") {

    return (req: IRequest, res: Response, next: NextFunction) => {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", "true");

        next();
    };
}
