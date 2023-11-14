import axios, { AxiosError } from 'axios'
import * as path from 'node:path'
import { loadJSON, saveJSON } from './fs'

const origin = 'https://bandcamp.com'

const credentialsPath = path.resolve(
  __dirname,
  '..',
  '.bandcamp',
  'credentials.json',
)

export async function login({
  client_id,
  client_secret,
}: {
  client_id: number
  client_secret: string
}) {
  const credentials = await getCredentials()
  const params = new URLSearchParams()

  params.set('client_id', client_id.toString())
  params.set('client_secret', client_secret)
  params.set(
    'grant_type',
    credentials?.refresh_token ? 'refresh_token' : 'client_credentials',
  )

  if (credentials?.refresh_token)
    params.set('refresh_token', credentials.refresh_token)

  const response = await axios.post(`${origin}/oauth_token`, params)

  await setCredentials(response.data)
  return response.data
}

export async function getMyBands() {
  return (await api('/account/1/my_bands')).bands
}

export async function getOrders(query: {
  band_id: number
  name?: string
  start_time?: string
}) {
  return (await api('/merchorders/3/get_orders', query)).items
}

export async function getMerch(query: {
  band_id: number
  member_band_id?: number
  start_time: string
  end_time?: string
  package_ids?: number[]
}) {
  return (await api('/merchorders/1/get_merch_details', query)).items
}

export async function updateShipping(
  items: {
    id: number
    id_type: 'p' | 's'
    shipped?: boolean
    notification?: boolean
    notification_message?: string
    ship_date?: string
    carrier?: string
    tracking_code?: string
  }[],
) {
  return api('/merchorders/2/update_shipped', {
    items,
  })
}

export function formatError(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      return 'Unauthorised. Please login first.'
    } else {
      return `Unexpected response code "${error.response?.status}" from the bandcamp API.\n${error.message}`
    }
  } else if (error instanceof Error) {
    return error.message
  } else {
    return error
  }
}

async function api(path: string, data: any = {}) {
  const credentials = await getCredentials()
  const response = await axios.post(`${origin}/api${path}`, data, {
    headers: {
      Authorization: `Bearer ${credentials?.access_token}`,
    },
  })
  if (response.data.error && response.data.error_message) {
    throw new Error(response.data.error_message)
  }
  return response.data
}

async function getCredentials() {
  try {
    return await loadJSON(credentialsPath)
  } catch (error) {
    return undefined
  }
}

async function setCredentials(credentials: any) {
  await saveJSON(credentialsPath, credentials)
}
