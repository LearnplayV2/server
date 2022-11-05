import type { User } from "../Types/user";
import validator from "validator";
// import { RequestError } from "./errors";
import { RequestError } from "request-error";

export function CheckRegistration({email, name, password} : User) {
    if(email && !validator.isEmail(email) || !email) throw RequestError('Formato de e-mail inválido');

    // check empty fields
    if(!password) throw RequestError('Preencha o campo senha');
    if(!name) throw RequestError('Preencha o campo nome');

    // check min/max characters
    ValidateLength(name, 'nome', {min: 3, max: 12});
    ValidateLength(password, 'senha', {min: 8});
}

export function CheckLogin({email, password} : User) {
    if(email && validator.isEmpty(email) || password && validator.isEmpty(password)) throw RequestError('Campos não podem ser nulos', 422);
    if(email && !validator.isEmail(email)) throw RequestError('Digite um e-mail válido', 422);
}

function ValidateLength(what: string, fieldName: string, {min, max} : {min: number, max?: number} ) {
    if(max && !(what.length >= min && what.length <= max)) throw RequestError(`Preencha o campo ${fieldName} entre ${min} a ${max} caracteres`);
    if(!(what.length >= min)) throw RequestError(`O campo ${fieldName} requer no mínimo ${min} caracteres`);
}   