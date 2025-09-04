import express from 'express'
import { passwordDelete, passwordEdit, passwordGet, passwordStore } from '../../controller/password-manager/index.js'
import { middleware } from '../../controller/auth/index.js'

const passwordManagerRouter =  express.Router()


passwordManagerRouter.post('/add', middleware ,passwordStore);
passwordManagerRouter.get('/get', middleware ,passwordGet);
passwordManagerRouter.post('/delete',passwordDelete)
passwordManagerRouter.post('/edit', middleware ,passwordEdit)

export default passwordManagerRouter