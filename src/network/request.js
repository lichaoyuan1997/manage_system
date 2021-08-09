import axios from 'axios'

export function request(config) {
  const instance = axios.create({
    baseURL:'http://timemeetyou.com:8889/api/private/v1/',
    timeout:5000
  })

  return instance(config)
}