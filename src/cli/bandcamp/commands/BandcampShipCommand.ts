import { Command, Option } from 'clipanion'
import { setTimeout } from 'node:timers/promises'
import * as t from 'typanion'
import { loadJSON } from '../../../fs'
import { updateShipping } from '../../../bandcamp'
import { pick } from 'lodash'
import { BandcampCommand } from './BandcampCommand'
import z from 'zod'

export class BandcampShipCommand extends BandcampCommand {
  static override paths: string[][] = [['ship']]

  static override usage = Command.Usage({
    description: 'Updates shipped/unshipped status of merchandise orders',
  })

  readonly carrier = Option.String('-c,--carrier', {
    description: 'Name of the shipping carrier (displayed to buyer).',
  })

  readonly commit = Option.Boolean('-C,--commit', {
    description: 'Send information to bandcamp. Dry run without.',
  })

  readonly ids = Option.Array('-i,--ids', [], {
    description: 'Unique Bandcamp ID of the payment or sale item to update',
    validator: t.isArray(t.isNumber()),
  })

  readonly ids_file = Option.String('-f,--ids_file', {
    description: 'Use the IDs from this file.',
  })

  readonly id_type = Option.String('-t,--id_type', 'p', {
    description:
      "ID Type. 'p' when id parameter refers to a payment, 's' for sale item.",
    validator: t.isEnum(['p', 's'] as const),
  })

  readonly name = Option.String('-n,--name', {
    description: 'Mark all items that where the item matches this name.',
  })

  readonly notify = Option.Boolean('-N,--notify', {
    description: 'Notify customers via email.',
  })

  readonly ship_date = Option.String('-d,--ship_date', {
    description: 'The date it was shipped.',
  })

  readonly shipped = Option.Boolean('-S,--shipped', {
    description: 'Mark the item as shipped.',
  })

  readonly start_date = Option.String('-s,--start_time', {
    description: 'Mark all items that were purchased from this date.',
  })

  override async execute() {
    let ids: number[] = this.ids

    if (this.ids_file) {
      ids = z
        .number()
        .array()
        .parse(await loadJSON(this.ids_file))
    }

    const options = pick(this, ['id_type', 'ship_date', 'shipped', 'carrier'])

    if (!this.commit) {
      this.context.stdout.write('Dry run\n')
      this.context.stdout.write('Setting ')
      this.context.stdout.write(JSON.stringify(options, null, 2) + '\n')
      this.context.stdout.write(`TO ${ids.length} ids\n`)
      this.context.stdout.write(JSON.stringify(ids, null, 2) + '\n')
      return
    }

    const spinner = this.startSpinner(`Shipping ${ids.length} IDs to bandcamp`)
    await setTimeout(5_000)

    await updateShipping(
      ids.map((id) => ({
        ...options,
        id,
      })),
    )

    spinner.stop()
    this.context.stdout.write('Success\n')
  }
}
