import { json, redirect } from 'react-router-dom'

import AuthForm from '../components/AuthForm'

function AuthenticationPage() {
  return <AuthForm />
}

export default AuthenticationPage

export async function action({request}) {
  // action triggered anytime the AuthForm is submitted
  // param 'request' is built-in with the <Form /> component from react-router-dom (there's also 'params')
  // this action code runs in the browser, so we can use all browser features, like localStorage for storing the token received from the backend

  // get the searchParam
  const searchParams = new URL(request.url).searchParams
  const mode = searchParams.get('mode') || 'login'

  if (mode !== 'login' && mode !== 'signup') {
    throw json({message: 'Unsupported mode.'}, {status: 422})
  }

  // get the data submitted in the AuthForm
  const data = await request.formData()
  const authData = {
    email: data.get('email'),
    password: data.get('password')
  }

  // send the request to the backend
  const response = await fetch('http://localhost:8080/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authData)
  })

  // handle the response
  if (response.status === 422 || response.status === 401) {
    return response
  }

  if (!response.ok) {
    throw json({message: 'Could not authenticate user.'}, {status: 500})
  }

  const resData = await response.json()
  const token = resData.token

  localStorage.setItem('token', token)
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + 1)   // set a date 1 hour in the future
  localStorage.setItem('expiration', expiration.toISOString())

  return redirect('/')
}