export const fetcher = async (url: string) => {
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    error.info = await response.json()
    error.status = response.status
    throw error
  }
  
  return response.json()
}

export const mutationFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })
  
  if (!response.ok) {
    const error = new Error('An error occurred while mutating the data.')
    error.info = await response.json()
    error.status = response.status
    throw error
  }
  
  return response.json()
}

export const updateFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })
  
  if (!response.ok) {
    const error = new Error('An error occurred while updating the data.')
    error.info = await response.json()
    error.status = response.status
    throw error
  }
  
  return response.json()
}

export const deleteFetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = new Error('An error occurred while deleting the data.')
    error.info = await response.json()
    error.status = response.status
    throw error
  }
  
  return response.json()
}

export const patchFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })
  
  if (!response.ok) {
    const error = new Error('An error occurred while patching the data.')
    error.info = await response.json()
    error.status = response.status
    throw error
  }
  
  return response.json()
}