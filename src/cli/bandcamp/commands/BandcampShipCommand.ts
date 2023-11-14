import { Command, Option } from 'clipanion'
import { setTimeout } from 'node:timers/promises'
import * as t from 'typanion'
import { loadJSON } from '../../../fs'
import { getOrders, updateShipping } from '../../../bandcamp'
import { pick } from 'lodash'
import { BandcampCommand } from './BandcampCommand'

export class BandcampShipCommand extends BandcampCommand {
  static override paths: string[][] = [['ship']]

  static override usage = Command.Usage({
    description: 'Update shipping information on certain orders',
  })

  readonly band_id = Option.String('-b,--band_id', {
    description: 'Your band ID can be found with the `bands` command.',
    required: true,
    validator: t.isNumber(),
  })

  readonly carrier = Option.String('-c,--carrier', {
    description: 'The shipping carrier.',
  })

  readonly commit = Option.Boolean('-C,--commit', {
    description: 'Send information to bandcamp. Dry run without.',
  })

  readonly ids_file = Option.String('-f,--ids_file', {
    description: 'Use the IDs from this file.',
  })

  readonly id_type = Option.String('-t,--id_type', 'p', {
    description: 'ID Type. Can be a sales item ID or a purchase ID.',
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
    const ids: number[] = this.ids_file
      ? t.isArray(t.isNumber())(await loadJSON(this.ids_file))
      : (await getOrders(this)).items.map((item: any) =>
          this.id_type === 'p' ? item.payment_id : item.sale_item_id,
        )

    const options = pick(this, ['id_type', 'ship_date', 'shipped', 'carrier'])

    if (!this.commit) {
      console.info('Dry run')
      console.info('Setting', options)
      console.info(`TO ${ids.length} ids`)
      console.info(ids)
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
    console.info('Success')
  }
}
