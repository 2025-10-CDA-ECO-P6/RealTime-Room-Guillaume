import { io } from 'socket.io-client'

const isProd = import.meta.env.PROD

const socket = io(isProd ? '' : 'http://localhost:3001', {
  path: '/socket.io'
})

export default socket