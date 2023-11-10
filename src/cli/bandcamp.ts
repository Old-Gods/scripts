import { readFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import yargs from 'yargs'
import env from '../dotenv'
import { pick } from 'lodash'
import { format as formatDate } from 'date-fns'
import Table from 'cli-table3'
import {
  formatError,
  getMyBands,
  getOrders,
  login,
  updateShipping,
} from '../bandcamp'

yargs
  .scriptName('bandcamp')
  .usage('$0 <cmd> [args]')
  .fail((_msg, err) => {
    console.error(formatError(err))
    process.exit(1)
  })

  .command(
    'login',
    'Log in to bandcamp',
    (yargs) =>
      yargs
        .option('client_id', {
          alias: 'i',
          type: 'number',
          default: Number(env.BANDCAMP_CLIENT_ID),
        })
        .option('client_secret', {
          alias: 's',
          type: 'string',
          default: env.BANDCAMP_CLIENT_SECRET,
        }),
    async (argv) => {
      await login(argv)
      console.info('Successfully logged in.')
    },
  )

  .command(
    'bands',
    'Get your band(s) info',
    (yargs) => yargs,
    async () => {
      const myBands = await getMyBands()

      if (!myBands) return

      const table = new Table({
        head: ['id', 'name', 'subdomain'],
      })

      for (const band of myBands) {
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
        .option('band_id', {
          alias: 'b',
          demandOption: true,
          type: 'number',
          coerce: Number,
        })
        .option('start_time', {
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
      const orders = await getOrders(argv)

      const data =
        argv.field.length === 1
          ? orders.map((item: any) => item[argv.field[0]])
          : argv.field.length
          ? orders.map((item: any) => pick(item, argv.field!))
          : orders

      console.info(JSON.stringify(data, null, 2))
    },
  )

  .command(
    'ship',
    'Update shipping information on certain orders',
    async (yargs) =>
      yargs
        .option('band_id', {
          alias: 'b',
          demandOption: true,
          type: 'number',
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
        })
        .option('ids_file', {
          alias: 'f',
          type: 'string',
          config: true,
        })
        .option('id_type', {
          alias: 't',
          choices: ['p', 's'],
          default: 'p',
          type: 'string',
          coerce: (x) => x as 'p' | 's',
        })
        .option('name', {
          alias: 'n',
          type: 'string',
        })
        .option('notify', {
          alias: 'N',
          type: 'boolean',
          default: false,
        })
        .option('ship_date', {
          alias: 'd',
          type: 'string',
          default: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        })
        .option('shipped', {
          alias: 'S',
          type: 'boolean',
          default: false,
        })
        .option('start_time', {
          alias: 's',
          type: 'string',
        }),
    async (argv) => {
      let ids: number[] = []

      if (argv.ids_file) {
        ids = [
          ...new Set<number>(
            JSON.parse((await readFile(argv.ids_file)).toString()),
          ),
        ]
      } else {
        const orders = await getOrders(argv)
        ids = orders.items.map((item: any) =>
          argv.id_type === 'p' ? item.payment_id : item.sale_item_id,
        )
      }

      const options = pick(argv, ['id_type', 'ship_date', 'shipped', 'carrier'])

      if (!argv.commit) {
        console.info('Dry run')
        console.info('Setting', options)
        console.info(`TO ${ids.length} ids`)
        console.info(ids)
        return
      }

      console.info(`SUBMITTING ${ids.length} IDs TO BANDCAMP`)
      await setTimeout(5_000)

      const items = ids.map((id) => ({
        ...options,
        id,
      }))

      await updateShipping(items)

      console.info('Success')
    },
  )

  .demandCommand().argv
