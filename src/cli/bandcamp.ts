import { readFile, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import yargs from 'yargs'
import axios from 'axios'
import env from '../dotenv'
import { pick } from 'lodash'
import { format as formatDate } from 'date-fns'
import Table from 'cli-table3'

const credentialsPath = path.resolve(
  __dirname,
  '..',
  '..',
  '.bandcamp',
  'credentials.json',
)

yargs
  .scriptName('bandcamp')
  .usage('$0 <cmd> [args]')
  .command(
    'login',
    'Log in to bandcamp',
    (yargs) =>
      yargs
        .option('clientId', {
          alias: 'i',
          type: 'number',
          default: Number(env.BANDCAMP_CLIENT_ID),
        })
        .option('clientSecret', {
          alias: 's',
          type: 'string',
          default: env.BANDCAMP_CLIENT_SECRET,
        }),
    async (argv) => {
      const credentials = await getCredentials()
      const params = new URLSearchParams()
      params.set('client_id', argv.clientId.toString())
      params.set('client_secret', argv.clientSecret)
      params.set(
        'grant_type',
        credentials?.refresh_token ? 'refresh_token' : 'client_credentials',
      )
      if (credentials?.refresh_token)
        params.set('refresh_token', credentials.refresh_token)

      const response = await axios.post(
        'https://bandcamp.com/oauth_token',
        params,
      )

      await setCredentials(response.data)
      console.info('DONE!')
      console.info(response.data)
    },
  )
  .command(
    'bands',
    'Get your band(s) info',
    (yargs) => yargs,
    async () => {
      const credentials = await getCredentials()

      const response = await axios.post(
        'https://bandcamp.com/api/account/1/my_bands',
        {},
        {
          headers: {
            Authorization: `Bearer ${credentials?.access_token}`,
          },
        },
      )

      const table = new Table({
        head: ['id', 'name', 'subdomain'],
      })

      for (const band of response.data.bands) {
        table.push([band.band_id, band.name, band.subdomain])
      }

      console.info(table.toString())
    },
  )
  .command(
    'orders',
    'Get Current Orders',
    async (yargs) =>
      yargs
        .option('band', {
          alias: 'b',
          demandOption: true,
          type: 'number',
        })
        .option('start', {
          alias: 's',
          type: 'string',
        })
        .option('name', {
          alias: 'n',
          type: 'string',
        })
        .option('field', {
          alias: 'f',
          type: 'array',
          default: [],
        }),
    async (argv) => {
      const credentials = await getCredentials()

      const response = await axios.post(
        'https://bandcamp.com/api/merchorders/3/get_orders',
        {
          band_id: argv.band,
          name: argv.name,
          start_time: argv.start,
        },
        {
          headers: {
            Authorization: `Bearer ${credentials?.access_token}`,
          },
        },
      )

      const data =
        argv.field.length === 1
          ? response.data.items.map((item: any) => item[argv.field[0]])
          : argv.field.length
          ? response.data.items.map((item: any) => pick(item, argv.field!))
          : response.data.items

      console.info(JSON.stringify(data, null, 2))
    },
  )
  .command(
    'ship',
    'Update shipping information on certain orders',
    async (yargs) =>
      yargs
        .option('band', {
          alias: 'b',
          demandOption: true,
          type: 'number',
        })
        .option('payment-ids-file', {
          alias: 'f',
          type: 'string',
        })
        .option('start', {
          alias: 's',
          type: 'string',
        })
        .option('name', {
          alias: 'n',
          type: 'string',
        })
        .option('shipped', {
          alias: 'S',
          type: 'boolean',
          default: false,
        })
        .option('notify', {
          alias: 'N',
          type: 'boolean',
          default: false,
        })
        .option('ship-date', {
          alias: 'd',
          type: 'string',
          default: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        })
        .option('carrier', {
          alias: 'c',
          type: 'string',
        })
        .option('commit', {
          alias: 'C',
          describe:
            'By default this command will do nothing. The flag will submit all information to Bandcamp.',
          type: 'boolean',
        })
        .option('interval', {
          alias: 'i',
          type: 'number',
          default: 1_000,
        }),
    async (argv) => {
      const credentials = await getCredentials()

      let paymentIds: number[] = []

      if (argv.paymentIdsFile) {
        paymentIds = [
          ...new Set<number>(
            JSON.parse((await readFile(argv.paymentIdsFile)).toString()),
          ),
        ]
      } else {
        const { data: orders } = await axios.post(
          'https://bandcamp.com/api/merchorders/3/get_orders',
          {
            band_id: argv.band,
            name: argv.name,
            start_time: argv.start,
          },
          {
            headers: {
              Authorization: `Bearer ${credentials?.access_token}`,
            },
          },
        )

        paymentIds = orders.items.map((item: any) => item.payment_id)
      }

      const options = {
        id_type: 'p',
        ship_date: argv.shipDate,
        shipped: argv.shipped,
        carrier: argv.carrier,
      }

      if (!argv.commit) {
        console.info('Dry run')
        console.info('Setting', options)
        console.info(`TO ${paymentIds.length} ids`)
        console.info(paymentIds)
        return
      }

      console.info(`SUBMITTING ${paymentIds.length} IDs TO BANDCAMP`)
      await setTimeout(5_000)

      const items = paymentIds.map((id) => ({
        ...options,
        id,
      }))

      const response = await axios.post(
        'https://bandcamp.com/api/merchorders/2/update_shipped',
        {
          items,
        },
        {
          headers: {
            Authorization: `Bearer ${credentials?.access_token}`,
          },
        },
      )

      console.info(response.data)
    },
  )
  .demandCommand().argv

async function getCredentials() {
  try {
    return JSON.parse((await readFile(credentialsPath)).toString())
  } catch (error) {
    return undefined
  }
}

async function setCredentials(credentials: any) {
  await writeFile(credentialsPath, JSON.stringify(credentials, null, 2))
}
