import compile from '../compile'
import { resolve } from 'path'

compile(resolve(__dirname, 'fixture/*.ts'))
require('./fixture/index.js')