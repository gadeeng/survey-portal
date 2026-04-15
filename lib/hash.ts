import bcrypt from 'bcryptjs'

const password = 'adminPDS1234'
const hash = await bcrypt.hash(password, 10)
console.log(hash)