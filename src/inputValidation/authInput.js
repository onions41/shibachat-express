import { object, string } from 'yup'

export default object({
  nickname: string().required().trim().min(2).max(50),
  password: string().required().min(5).max(100)
})
