import { json, redirect } from 'react-router-dom'

import AuthForm from '../components/AuthForm'

function AuthenticationPage() {
  return <AuthForm />
}

export default AuthenticationPage

export async function action({request}) {
  // action triggered anytime the AuthForm is submitted
  // param 'request' is built-in with the <Form /> component from react-router-dom (there's also 'params')

  // get the searchParam
  const searchParams = new URL(request.url).searchParams
  const mode = searchParams.get('mode') || 'login'

  if (mode !== 'logn' && mode !== 'signup') {
    throw json({message: 'Unsupported mode.'}, {status: 422})
  }

  // get the data submitted in the AuthForm
  const data = await request.formData()
  console.log(data)
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

  // soon: manage that token
  return redirect('/')
}